import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { FaTrash, FaCut, FaEdit } from 'react-icons/fa';
import RelatorioInspecaoService from '../../services/relatorioInspecao';
import toast from 'react-hot-toast';
import ProdutoDivisaoModal from './ProdutoDivisaoModal';
import ProdutoEdicaoModal from './ProdutoEdicaoModal';

// Funções utilitárias para manipulação de datas
  const formatDateBR = (dateISO) => {
    if (!dateISO) return '';
    const date = new Date(dateISO);
    return date.toLocaleDateString('pt-BR');
  };

  const parseDateBR = (dateBR) => {
    if (!dateBR) return null;
  const partes = dateBR.split('/');
  if (partes.length !== 3) return null;
  const [dia, mes, ano] = partes;
  // Validar formato (DD/MM/YYYY)
  if (dia.length !== 2 || mes.length !== 2 || ano.length !== 4) return null;
    return `${ano}-${mes}-${dia}`;
  };

  const formatDateISO = (dateBR) => {
    if (!dateBR) return '';
    const parsed = parseDateBR(dateBR);
    return parsed ? new Date(parsed).toISOString().split('T')[0] : '';
  };

  // Função para normalizar números - remove pontos que não sejam decimais
  // Ex: "1.000" → "1", "10.5" → "10,5" (mantém decimal se houver vírgula ou ponto decimal)
  const normalizeNumber = (value) => {
    if (!value && value !== 0) return '-';
    if (typeof value === 'number') {
      // Se for número, verificar se tem decimais
      if (value % 1 === 0) {
        return value.toString();
      }
      // Se tiver decimais, formatar com vírgula
      return value.toString().replace('.', ',');
    }
    
    const str = String(value).trim();
    if (!str || str === '-') return '-';
    
    // Se contém vírgula, assumir que vírgula é decimal e remover todos os pontos
    if (str.includes(',')) {
      // Remover todos os pontos (separadores de milhar) e manter vírgula como decimal
      return str.replace(/\./g, '');
    }
    
    // Se contém ponto, verificar se é decimal ou separador de milhar
    if (str.includes('.')) {
      const parts = str.split('.');
      
      // Se tem mais de 2 partes, é separador de milhar (ex: "1.000.000")
      if (parts.length > 2) {
        // Remover todos os pontos (separadores de milhar)
        return parts.join('');
      }
      
      // Se tem 2 partes, verificar se é decimal ou milhar
      if (parts.length === 2) {
        // Se a segunda parte tem exatamente 3 dígitos E são todos zeros
        // E a primeira parte tem 1-3 dígitos, é separador de milhar incorreto (ex: "1.000" → "1")
        if (parts[1].length === 3 && parts[1] === '000' && /^\d{1,3}$/.test(parts[0])) {
          // Retornar apenas a parte antes do ponto (remover zeros)
          return parts[0];
        }
        
        // Se a segunda parte tem exatamente 3 dígitos (não zeros) E a primeira parte tem 1-3 dígitos
        // Provavelmente é separador de milhar (ex: "1.234" → "1234")
        if (parts[1].length === 3 && /^\d{1,3}$/.test(parts[0]) && /^\d{3}$/.test(parts[1])) {
          // Remover o ponto (separador de milhar)
          return parts.join('');
        }
        
        // Se a segunda parte tem 1-2 dígitos, provavelmente é decimal (ex: "10.5", "10.50")
        if (parts[1].length <= 2 && /^\d+$/.test(parts[1])) {
          // Converter ponto para vírgula (decimal)
          return str.replace('.', ',');
        }
        
        // Caso padrão: remover ponto (assumir separador de milhar)
        return parts.join('');
      }
    }
    
    return str;
  };

  // Função para exibir número normalizado
  const displayNumber = (value) => {
    const normalized = normalizeNumber(value);
    if (normalized === '-') return '-';
    return normalized;
  };

const ProdutosTable = forwardRef(({ produtos, onChange, onRemove, viewMode = false, pedidoIdAtual, onDesvincularSelecionados }, ref) => {
  const [produtosAtualizados, setProdutosAtualizados] = useState(produtos || []);
  const [errors, setErrors] = useState({});
  const [produtosSelecionados, setProdutosSelecionados] = useState([]);
  const [produtoParaDividir, setProdutoParaDividir] = useState(null);
  const [isDivisaoModalOpen, setIsDivisaoModalOpen] = useState(false);
  const [produtoParaEditar, setProdutoParaEditar] = useState(null);
  const [isEdicaoModalOpen, setIsEdicaoModalOpen] = useState(false);

  useEffect(() => {
    setProdutosAtualizados(produtos || []);
    // Limpar seleção de produtos que não existem mais
    setProdutosSelecionados(prev => 
      prev.filter(id => produtos?.some(p => p.pedido_item_id === id))
    );
  }, [produtos]);

  // Calcular controle de validade (%)
  // Regra: percentual_consumido = (1 - (dias_restantes / prazo_total)) * 100
  // Se > 30% → Campo vermelho (produto próximo ao vencimento)
  // Se ≤ 30% → Campo verde (produto OK)
  const calcularControleValidade = useCallback((fabricacao, validade) => {
    if (!fabricacao || !validade) return null;

    try {
      // Converter datas para formato ISO se necessário
      // Input type="date" retorna formato ISO (YYYY-MM-DD)
      // Se contém '/', é formato BR (DD/MM/YYYY) e precisa converter
      let fabricacaoISO = fabricacao.includes('/') ? formatDateISO(fabricacao) : fabricacao;
      let validadeISO = validade.includes('/') ? formatDateISO(validade) : validade;
      
      // Validar se a conversão funcionou
      if (!fabricacaoISO || !validadeISO) {
        return null;
      }
      
      // Criar objetos Date e resetar horas para meia-noite (evitar problemas de timezone)
      const fabricacaoDate = new Date(fabricacaoISO);
      fabricacaoDate.setHours(0, 0, 0, 0);
      
      const validadeDate = new Date(validadeISO);
      validadeDate.setHours(0, 0, 0, 0);
      
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      if (isNaN(fabricacaoDate.getTime()) || isNaN(validadeDate.getTime())) {
        return null;
      }

      // Validar se validade é posterior à fabricação
      if (validadeDate < fabricacaoDate) {
        // Validade anterior à fabricação é inválido
        return null;
      }
      
      // Calcular prazo_total = dias(validade - fabricacao)
      const prazoTotal = Math.ceil((validadeDate - fabricacaoDate) / (1000 * 60 * 60 * 24));
      
      // Validar se prazo_total é válido (deve ser maior que 0)
      if (prazoTotal <= 0) {
        // Se as datas são iguais ou inválidas, retornar null
        return null;
      }
      
      // Calcular dias_restantes = dias(validade - hoje)
      const diasRestantes = Math.ceil((validadeDate - hoje) / (1000 * 60 * 60 * 24));

      // Calcular percentual_consumido = (1 - (dias_restantes / prazo_total)) * 100
      const percentualConsumido = ((1 - (diasRestantes / prazoTotal)) * 100);
      
      // Limitar entre 0 e 100% para evitar valores negativos ou superiores a 100%
      const percentualLimitado = Math.max(0, Math.min(100, percentualConsumido));

      return parseFloat(percentualLimitado.toFixed(2));
    } catch (error) {
      console.error('Erro ao calcular controle de validade:', error, { fabricacao, validade });
      return null;
    }
  }, []);

  // Buscar NQA e plano de amostragem para um produto
  const buscarDadosNQA = useCallback(async (produto) => {
    if (!produto.grupo_id && !produto.grupoId) return;

    const grupoId = produto.grupo_id || produto.grupoId;
    
    try {
      // Buscar NQA do grupo
      const nqaResponse = await RelatorioInspecaoService.buscarNQAGrupo(grupoId);
      if (nqaResponse.success && nqaResponse.data) {
        const nqa = nqaResponse.data;
        
        // Se tiver tamanho do lote, buscar plano de amostragem
        if (produto.tam_lote && parseInt(produto.tam_lote) > 0) {
          const planoResponse = await RelatorioInspecaoService.buscarPlanoPorLote(
            nqa.id,
            parseInt(produto.tam_lote)
          );
          
          if (planoResponse.success && planoResponse.data) {
            const plano = planoResponse.data;
            
            // Atualizar produto com NQA e plano
            handleFieldChange(produto.index || produtosAtualizados.indexOf(produto), {
              nqa_codigo: nqa.codigo,
              nqa_id: nqa.id,
              num_amostras_avaliadas: plano.tamanho_amostra,
              ac: plano.ac,
              re: plano.re
            });
          } else {
            // Apenas atualizar NQA se não encontrar plano
            handleFieldChange(produto.index || produtosAtualizados.indexOf(produto), {
              nqa_codigo: nqa.codigo,
              nqa_id: nqa.id
            });
          }
        } else {
          // Apenas atualizar NQA se não tiver tamanho do lote
          handleFieldChange(produto.index || produtosAtualizados.indexOf(produto), {
            nqa_codigo: nqa.codigo,
            nqa_id: nqa.id
          });
        }
      }
    } catch (error) {
      console.error('Erro ao buscar NQA:', error);
    }
  }, [produtosAtualizados]);

  // Calcular resultado final
  // Regra: 
  // 1. Se Ctrl. Val. (%) > 30% → Reprovado (produto próximo ao vencimento)
  // 2. Se num_reprovadas >= RE && RE > 0 → Reprovado
  // 3. Caso contrário → Aprovado
  // Retorna null/vazio se não houver dados suficientes para calcular
  const calcularResultadoFinal = useCallback((produto) => {
    // Verificar se há dados mínimos necessários para calcular o resultado
    const temFabricacao = produto.fabricacao || produto.fabricacaoBR;
    const temValidade = produto.validade || produto.validadeBR;
    const temLote = produto.lote;
    const temAvalSensorial = produto.aval_sensorial;
    const temTamLote = produto.tam_lote;
    const temAmostrasAvaliadas = produto.num_amostras_avaliadas;
    const temAmostrasReprovadas = produto.num_amostras_reprovadas !== null && produto.num_amostras_reprovadas !== undefined && produto.num_amostras_reprovadas !== '';
    
    // Verificar se é grupo Frios (precisa de temperatura)
    const isGrupoFrios = produto.grupo_nome && produto.grupo_nome.toLowerCase() === 'frios';
    const temTemperatura = !isGrupoFrios || produto.temperatura;
    
    // Se não tiver dados obrigatórios, não calcular resultado
    if (!temFabricacao || !temValidade || !temLote || !temAvalSensorial || !temTemperatura || !temTamLote || !temAmostrasAvaliadas) {
      return null;
    }
    
    // Verificar controle de validade
    const controleValidade = produto.controle_validade;
    if (controleValidade !== null && controleValidade !== undefined && controleValidade > 30) {
      return 'Reprovado'; // Produto próximo ao vencimento (> 30%)
    }
    
    // Verificar amostras reprovadas (apenas se tiver RE definido e amostras reprovadas informadas)
    if (temAmostrasReprovadas) {
      const numReprovadas = parseInt(produto.num_amostras_reprovadas || 0);
      const re = parseInt(produto.re || 0);

      if (re > 0 && numReprovadas >= re) {
        return 'Reprovado';
      }
    }
    
    // Se todas as condições foram atendidas e não há motivo para reprovação, aprovar
    return 'Aprovado';
  }, []);

  const handleFieldChange = (index, field, value) => {
    const updated = [...produtosAtualizados];
    const produto = { ...updated[index] }; // Criar cópia para evitar mutação direta
    
    // Atualizar campo
    if (typeof field === 'string') {
      produto[field] = value;
    } else if (typeof field === 'object') {
      // Se for objeto, atualizar múltiplos campos
      Object.assign(produto, field);
    }

    // Se mudou grupo ou tamanho do lote, buscar NQA
    if (typeof field === 'string' && (field === 'grupo_id' || field === 'grupoId' || field === 'tam_lote') && value) {
      setTimeout(() => buscarDadosNQA(produto), 500);
    } else if (typeof field === 'object' && (field.grupo_id || field.grupoId || field.tam_lote)) {
      setTimeout(() => buscarDadosNQA(produto), 500);
    }

    // Se mudou fabricação ou validade, recalcular controle de validade
    // Sempre recalcular após atualizar qualquer campo de data
    const temAlteracaoData = (typeof field === 'string' && (field === 'fabricacao' || field === 'validade' || field === 'fabricacaoBR' || field === 'validadeBR')) ||
                             (typeof field === 'object' && (field.fabricacao !== undefined || field.validade !== undefined || field.fabricacaoBR !== undefined || field.validadeBR !== undefined));
    
    if (temAlteracaoData) {
      // Calcular controle de validade com os valores atualizados do produto
      const controleValidade = calcularControleValidade(
        produto.fabricacao || produto.fabricacaoBR,
        produto.validade || produto.validadeBR
      );
      // Atualizar controle_validade no produto
        produto.controle_validade = controleValidade;
      }

    // Sempre recalcular resultado final quando qualquer campo relevante mudar
    // Campos relevantes: todos os dados obrigatórios e dados de avaliação
    const mudouCampoRelevante = 
      (typeof field === 'string' && (
        field === 'num_amostras_reprovadas' || 
        field === 'num_amostras_avaliadas' ||
        field === 'num_amostras_aprovadas' ||
        field === 're' ||
        field === 'temperatura' ||
        field === 'aval_sensorial' ||
        field === 'tam_lote' ||
        field === 'lote' ||
        field === 'fabricacao' ||
        field === 'validade' ||
        field === 'fabricacaoBR' ||
        field === 'validadeBR'
      )) ||
      (typeof field === 'object' && (
        field.num_amostras_reprovadas !== undefined || 
        field.num_amostras_avaliadas !== undefined ||
        field.num_amostras_aprovadas !== undefined ||
        field.re !== undefined ||
        field.temperatura !== undefined ||
        field.aval_sensorial !== undefined ||
        field.tam_lote !== undefined ||
        field.lote !== undefined ||
        field.fabricacao !== undefined ||
        field.validade !== undefined ||
        field.fabricacaoBR !== undefined ||
        field.validadeBR !== undefined ||
        field.controle_validade !== undefined
      )) ||
      temAlteracaoData;
    
    // Sempre recalcular resultado final quando houver mudança em campos relevantes
    if (mudouCampoRelevante) {
      produto.resultado_final = calcularResultadoFinal(produto);
    }

    updated[index] = produto;
    setProdutosAtualizados(updated);
    onChange(updated);
  };

  const getValidadeColor = (percentual) => {
    if (percentual === null || percentual === undefined) return '';
    return percentual > 30 ? 'bg-red-50 text-red-700 font-semibold' : 'bg-green-50 text-green-700';
  };

  const getResultadoColor = (resultado) => {
    if (!resultado || resultado === '') {
      return 'bg-gray-50 text-gray-500'; // Estado neutro - aguardando avaliação
    }
    return resultado === 'Aprovado' 
      ? 'bg-green-100 text-green-800 font-semibold' 
      : 'bg-red-100 text-red-800 font-semibold';
  };

  // Validar campos obrigatórios
  const validateProdutos = useCallback(() => {
    const newErrors = {};
    let hasErrors = false;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    produtosAtualizados.forEach((produto, index) => {
      // Validar fabricação
      if (!produto.fabricacao && !produto.fabricacaoBR) {
        newErrors[`${index}-fabricacao`] = 'Fabricação é obrigatória';
        hasErrors = true;
      } else {
        // Validar se fabricação não é superior à data atual
        const fabricacao = produto.fabricacao || produto.fabricacaoBR;
        if (fabricacao) {
          let fabricacaoISO = fabricacao.includes('/') ? formatDateISO(fabricacao) : fabricacao;
          if (fabricacaoISO) {
            const fabricacaoDate = new Date(fabricacaoISO);
            fabricacaoDate.setHours(0, 0, 0, 0);
            if (fabricacaoDate > hoje) {
              newErrors[`${index}-fabricacao`] = 'Data de fabricação não pode ser superior à data atual';
              hasErrors = true;
            }
          }
        }
      }
      
      // Validar lote
      if (!produto.lote || produto.lote.trim() === '') {
        newErrors[`${index}-lote`] = 'Lote é obrigatório';
        hasErrors = true;
      }
      
      // Validar validade
      if (!produto.validade && !produto.validadeBR) {
        newErrors[`${index}-validade`] = 'Validade é obrigatória';
        hasErrors = true;
      } else {
        // Validar se validade não é anterior à data atual
        const validade = produto.validade || produto.validadeBR;
        if (validade) {
          let validadeISO = validade.includes('/') ? formatDateISO(validade) : validade;
          if (validadeISO) {
            const validadeDate = new Date(validadeISO);
            validadeDate.setHours(0, 0, 0, 0);
            if (validadeDate < hoje) {
              newErrors[`${index}-validade`] = 'Data de validade não pode ser anterior à data atual';
              hasErrors = true;
            }
          }
        }
      }
      
      // Validar avaliação sensorial
      if (!produto.aval_sensorial || produto.aval_sensorial.trim() === '') {
        newErrors[`${index}-aval_sensorial`] = 'Avaliação sensorial é obrigatória';
        hasErrors = true;
      }
      
      // Validar temperatura (obrigatória apenas para produtos do grupo Frios)
      const grupoNome = produto.grupo_nome || '';
      const isGrupoFrios = grupoNome.toLowerCase() === 'frios';
      if (isGrupoFrios && (!produto.temperatura || produto.temperatura.trim() === '')) {
        newErrors[`${index}-temperatura`] = 'Temperatura é obrigatória para produtos do grupo Frios';
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  }, [produtosAtualizados]);

  // Expor função de validação via ref
  useImperativeHandle(ref, () => ({
    validate: validateProdutos
  }), [validateProdutos]);

  if (produtosAtualizados.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
        <p>Nenhum produto adicionado. Selecione um pedido para carregar os produtos.</p>
      </div>
    );
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      const ids = produtosAtualizados
        .filter(p => p.pedido_item_id)
        .map(p => p.pedido_item_id);
      setProdutosSelecionados(ids);
    } else {
      setProdutosSelecionados([]);
    }
  };

  const handleSelectProduto = (pedidoItemId, checked) => {
    if (checked) {
      setProdutosSelecionados([...produtosSelecionados, pedidoItemId]);
    } else {
      setProdutosSelecionados(produtosSelecionados.filter(id => id !== pedidoItemId));
    }
  };

  const handleDesvincularSelecionadosClick = () => {
    if (produtosSelecionados.length === 0) {
      return;
    }
    if (onDesvincularSelecionados) {
      onDesvincularSelecionados(produtosSelecionados);
      setProdutosSelecionados([]);
    }
  };

  const handleDividirProduto = (index) => {
    const produto = produtosAtualizados[index];
    if (!produto) return;
    
    setProdutoParaDividir({ ...produto, _indexOriginal: index });
    setIsDivisaoModalOpen(true);
  };

  const handleConfirmarDivisao = (produtosDivididos) => {
    if (!produtoParaDividir) return;

    const indexOriginal = produtoParaDividir._indexOriginal;
    const updated = [...produtosAtualizados];
    
    // Remover o produto original e inserir os produtos divididos no lugar
    updated.splice(indexOriginal, 1, ...produtosDivididos);
    
    setProdutosAtualizados(updated);
    onChange(updated);
    
    toast.success(`Produto dividido em ${produtosDivididos.length} entrada(s)`);
    setProdutoParaDividir(null);
    setIsDivisaoModalOpen(false);
  };

  const handleEditarProduto = (index) => {
    const produto = produtosAtualizados[index];
    if (!produto) return;
    
    setProdutoParaEditar({ ...produto, _indexOriginal: index });
    setIsEdicaoModalOpen(true);
  };

  const handleSalvarEdicao = (produtoEditado) => {
    if (!produtoParaEditar) return;

    const indexOriginal = produtoParaEditar._indexOriginal;
    const updated = [...produtosAtualizados];
    
    // Atualizar o produto editado
    updated[indexOriginal] = {
      ...updated[indexOriginal],
      ...produtoEditado
    };
    
    setProdutosAtualizados(updated);
    onChange(updated);
    
    toast.success('Produto atualizado com sucesso');
    setProdutoParaEditar(null);
    setIsEdicaoModalOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Avaliação dos Produtos Recebidos</h3>
        {pedidoIdAtual && !viewMode && (
          <div className="flex gap-2">
            {produtosSelecionados.length === 1 && (
              <button
                type="button"
                onClick={() => {
                  const pedidoItemIdSelecionado = produtosSelecionados[0];
                  const index = produtosAtualizados.findIndex(
                    p => p.pedido_item_id && p.pedido_item_id === pedidoItemIdSelecionado
                  );
                  if (index !== -1) {
                    handleDividirProduto(index);
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
                title="Dividir produto selecionado em múltiplas entradas com diferentes fabricações, lotes e validades"
              >
                <FaCut className="w-4 h-4" />
                Dividir Produto
              </button>
            )}
            {produtosSelecionados.length > 0 && (
          <button
                type="button"
            onClick={handleDesvincularSelecionadosClick}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-sm font-medium"
          >
            Remover Selecionados ({produtosSelecionados.length})
          </button>
            )}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200" style={{ minWidth: '100%' }}>
          <thead className="bg-gray-50">
            <tr>
              {pedidoIdAtual && !viewMode && (
                <th className="px-2 py-1.5 text-center text-xs font-medium text-gray-500 uppercase w-10">
                  <input
                    type="checkbox"
                    checked={
                      produtosAtualizados.length > 0 && 
                      produtosAtualizados.some(p => p.pedido_item_id) &&
                      produtosAtualizados
                        .filter(p => p.pedido_item_id)
                        .every(p => produtosSelecionados.includes(p.pedido_item_id))
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                    title="Selecionar todos para remover"
                  />
                </th>
              )}
              <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
              <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
              <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Und.</th>
              <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Qtd. Ped.</th>
              <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Fab. <span className="text-red-500">*</span></th>
              <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Lote <span className="text-red-500">*</span></th>
              <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Val. <span className="text-red-500">*</span></th>
              <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Ctrl. Val.</th>
              <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Temp.</th>
              <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Aval. Sens. <span className="text-red-500">*</span></th>
              <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Tam. Lote</th>
              <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">NQA</th>
              <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Nº Amost.</th>
              <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Aprov.</th>
              <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Reprov.</th>
              <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase">Resultado</th>
              {!viewMode && (
                <th className="px-2 py-1.5 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {produtosAtualizados.map((produto, index) => {
              // Sempre calcular o controle de validade com os valores atuais
              const fabricacaoAtual = produto.fabricacao || produto.fabricacaoBR || '';
              const validadeAtual = produto.validade || produto.validadeBR || '';
              
              // Calcular controle de validade sempre que renderizar
              const controleValidadeCalculado = calcularControleValidade(fabricacaoAtual, validadeAtual);
              
              // Se temos um cálculo válido, usar ele. Caso contrário, usar o valor salvo (se existir)
              const controleValidade = controleValidadeCalculado !== null && controleValidadeCalculado !== undefined
                ? controleValidadeCalculado 
                : (produto.controle_validade !== null && produto.controle_validade !== undefined ? produto.controle_validade : null);
              
              // Atualizar produto com controle_validade calculado se necessário
              if (controleValidade !== produto.controle_validade) {
                produto.controle_validade = controleValidade;
              }
              
              // Calcular resultado final considerando controle de validade
              const resultadoFinal = calcularResultadoFinal(produto);

              // Renderizar controle de validade
              const renderControleValidade = () => {
                if (controleValidade !== null && controleValidade !== undefined) {
                  return `${controleValidade}%`;
                }
                
                const fab = produto.fabricacao || produto.fabricacaoBR || '';
                const val = produto.validade || produto.validadeBR || '';
                
                if (fab && val) {
                  try {
                    let fabISO = fab.includes('/') ? formatDateISO(fab) : fab;
                    let valISO = val.includes('/') ? formatDateISO(val) : val;
                    
                    if (fabISO && valISO) {
                      const fabDate = new Date(fabISO);
                      const valDate = new Date(valISO);
                      
                      if (!isNaN(fabDate.getTime()) && !isNaN(valDate.getTime())) {
                        if (valDate < fabDate) {
                          return <span className="text-red-600 text-xs" title="Validade não pode ser anterior à fabricação">⚠️</span>;
                        }
                        if (valDate.getTime() === fabDate.getTime()) {
                          return <span className="text-red-600 text-xs" title="Validade igual à fabricação">⚠️</span>;
                        }
                        return <span className="text-gray-500 text-xs">Erro</span>;
                      }
                    }
                  } catch (e) {
                    return <span className="text-gray-500 text-xs">Erro</span>;
                  }
                }
                
                return '-';
              };

              return (
                <tr key={index} className="hover:bg-gray-50">
                  {pedidoIdAtual && !viewMode && (
                    <td className="px-2 py-2 whitespace-nowrap text-center w-10">
                      {produto.pedido_item_id ? (
                        <input
                          type="checkbox"
                          checked={produtosSelecionados.includes(produto.pedido_item_id)}
                          onChange={(e) => handleSelectProduto(produto.pedido_item_id, e.target.checked)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                          title="Selecionar para remover do relatório"
                        />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  )}
                  <td className="px-2 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                    {produto.codigo || produto.codigo_produto || '-'}
                  </td>
                  <td className="px-2 py-2 text-xs text-gray-600 max-w-[120px] truncate" title={produto.descricao || produto.nome_produto || ''}>
                    {produto.descricao || produto.nome_produto || '-'}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-600">
                    {produto.und || produto.unidade_medida || '-'}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-600">
                    {displayNumber(produto.qtde || produto.quantidade_pedido)}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-600">
                    {produto.fabricacaoBR || formatDateBR(produto.fabricacao) || '-'}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-600">
                    {produto.lote || '-'}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-600">
                    {produto.validadeBR || formatDateBR(produto.validade) || '-'}
                  </td>
                  <td className={`px-2 py-2 whitespace-nowrap text-xs text-center ${getValidadeColor(controleValidade)}`}>
                    {renderControleValidade()}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-600">
                    {produto.temperatura ? `${displayNumber(produto.temperatura)}°C` : '-'}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-600">
                    {produto.aval_sensorial || '-'}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-600">
                    {displayNumber(produto.tam_lote)}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-600 font-medium">
                    {produto.nqa_codigo || '-'}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-600 font-medium">
                    {displayNumber(produto.num_amostras_avaliadas)}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-600">
                    {displayNumber(produto.num_amostras_aprovadas)}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-600">
                    {displayNumber(produto.num_amostras_reprovadas)}
                  </td>
                  <td className={`px-2 py-2 whitespace-nowrap text-xs text-center ${getResultadoColor(resultadoFinal)}`}>
                    {resultadoFinal || 'Aguardando avaliação'}
                  </td>
                  {!viewMode && (
                    <td className="px-2 py-2 whitespace-nowrap text-center">
                      <div className="flex justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditarProduto(index)}
                          className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                          title="Preencher informações do produto"
                        >
                          <FaEdit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemove(index)}
                          className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                          title="Remover produto deste relatório"
                        >
                          <FaTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal de Divisão de Produto */}
      <ProdutoDivisaoModal
        isOpen={isDivisaoModalOpen}
        onClose={() => {
          setIsDivisaoModalOpen(false);
          setProdutoParaDividir(null);
        }}
        produto={produtoParaDividir}
        onConfirm={handleConfirmarDivisao}
      />

      {/* Modal de Edição de Produto */}
      <ProdutoEdicaoModal
        isOpen={isEdicaoModalOpen}
        onClose={() => {
          setIsEdicaoModalOpen(false);
          setProdutoParaEditar(null);
        }}
        produto={produtoParaEditar}
        onSave={handleSalvarEdicao}
      />
    </div>
  );
});

ProdutosTable.displayName = 'ProdutosTable';

export default ProdutosTable;

