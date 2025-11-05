import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { FaTrash } from 'react-icons/fa';
import { Input } from '../ui';
import RelatorioInspecaoService from '../../services/relatorioInspecao';
import toast from 'react-hot-toast';

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

const ProdutosTable = forwardRef(({ produtos, onChange, onRemove, viewMode = false }, ref) => {
  const [produtosAtualizados, setProdutosAtualizados] = useState(produtos || []);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setProdutosAtualizados(produtos || []);
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
  const calcularResultadoFinal = useCallback((produto) => {
    const numReprovadas = parseInt(produto.num_amostras_reprovadas || 0);
    const re = parseInt(produto.re || 0);

    if (re > 0 && numReprovadas >= re) {
      return 'Reprovado';
    }
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

    // Sempre recalcular resultado final quando mudar reprovadas ou quando atualizar RE
    if (typeof field === 'string' && (field === 'num_amostras_reprovadas' || field === 're')) {
      produto.resultado_final = calcularResultadoFinal(produto);
    } else if (typeof field === 'object' && (field.num_amostras_reprovadas !== undefined || field.re !== undefined)) {
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Avaliação dos Produtos Recebidos</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th colSpan="8" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase bg-blue-50">
                Informações do Produto
              </th>
            </tr>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unidade</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qtd. Pedido</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fabricação *</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Lote *</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Validade *</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ctrl. Val. (%)</th>
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

              return (
                <React.Fragment key={index}>
                  {/* Linha 1: Informações do Produto */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {produto.codigo || produto.codigo_produto || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {produto.descricao || produto.nome_produto || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {produto.und || produto.unidade_medida || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {produto.qtde || produto.quantidade_pedido || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <Input
                          type="date"
                          value={produto.fabricacao || formatDateISO(produto.fabricacaoBR) || ''}
                          max={new Date().toISOString().split('T')[0]}
                          onChange={(e) => {
                            const dataSelecionada = e.target.value;
                            const hoje = new Date();
                            hoje.setHours(0, 0, 0, 0);
                            const dataFabricacao = new Date(dataSelecionada);
                            
                            // Validar se a data de fabricação não é superior à data atual
                            if (dataFabricacao > hoje) {
                              const newErrors = { ...errors };
                              newErrors[`${index}-fabricacao`] = 'Data de fabricação não pode ser superior à data atual';
                              setErrors(newErrors);
                              return;
                            }
                            
                            const dateBR = formatDateBR(dataSelecionada);
                            // Atualizar ambos os campos de uma vez para garantir que o cálculo funcione
                            handleFieldChange(index, {
                              fabricacao: dataSelecionada,
                              fabricacaoBR: dateBR
                            });
                            // Remover erro quando preencher corretamente
                            if (errors[`${index}-fabricacao`]) {
                              const newErrors = { ...errors };
                              delete newErrors[`${index}-fabricacao`];
                              setErrors(newErrors);
                            }
                          }}
                          className={`w-32 text-sm ${errors[`${index}-fabricacao`] ? 'border-red-500' : ''}`}
                          disabled={viewMode}
                          required
                        />
                        {errors[`${index}-fabricacao`] && (
                          <p className="text-xs text-red-600 mt-1">{errors[`${index}-fabricacao`]}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <Input
                          type="text"
                          value={produto.lote || ''}
                          onChange={(e) => {
                            handleFieldChange(index, 'lote', e.target.value);
                            // Remover erro quando preencher
                            if (errors[`${index}-lote`]) {
                              const newErrors = { ...errors };
                              delete newErrors[`${index}-lote`];
                              setErrors(newErrors);
                            }
                          }}
                          placeholder="Lote"
                          className={`w-24 text-sm ${errors[`${index}-lote`] ? 'border-red-500' : ''}`}
                          disabled={viewMode}
                          required
                        />
                        {errors[`${index}-lote`] && (
                          <p className="text-xs text-red-600 mt-1">{errors[`${index}-lote`]}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <Input
                          type="date"
                          value={produto.validade || formatDateISO(produto.validadeBR) || ''}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => {
                            const dataSelecionada = e.target.value;
                            const hoje = new Date();
                            hoje.setHours(0, 0, 0, 0);
                            const dataValidade = new Date(dataSelecionada);
                            
                            // Validar se a data de validade não é anterior à data atual
                            if (dataValidade < hoje) {
                              const newErrors = { ...errors };
                              newErrors[`${index}-validade`] = 'Data de validade não pode ser anterior à data atual';
                              setErrors(newErrors);
                              return;
                            }
                            
                            const dateBR = formatDateBR(dataSelecionada);
                            // Atualizar ambos os campos de uma vez para garantir que o cálculo funcione
                            handleFieldChange(index, {
                              validade: dataSelecionada,
                              validadeBR: dateBR
                            });
                            // Remover erro quando preencher corretamente
                            if (errors[`${index}-validade`]) {
                              const newErrors = { ...errors };
                              delete newErrors[`${index}-validade`];
                              setErrors(newErrors);
                            }
                          }}
                          className={`w-32 text-sm ${errors[`${index}-validade`] ? 'border-red-500' : ''}`}
                          disabled={viewMode}
                          required
                        />
                        {errors[`${index}-validade`] && (
                          <p className="text-xs text-red-600 mt-1">{errors[`${index}-validade`]}</p>
                        )}
                      </div>
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm text-center ${getValidadeColor(controleValidade)}`}>
                      {(() => {
                        // Se tem cálculo válido, mostrar percentual
                        if (controleValidade !== null && controleValidade !== undefined) {
                          return `${controleValidade}%`;
                        }
                        
                        // Se tem ambas as datas mas não calculou, verificar o motivo
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
                                // Validar se validade é anterior à fabricação
                                if (valDate < fabDate) {
                                  return <span className="text-red-600 text-xs font-semibold" title="Validade não pode ser anterior à fabricação">⚠️ Inválido</span>;
                                }
                                // Validar se datas são iguais (também é inválido)
                                if (valDate.getTime() === fabDate.getTime()) {
                                  return <span className="text-red-600 text-xs font-semibold" title="Validade igual à fabricação - não é possível calcular">⚠️ Inválido</span>;
                                }
                                // Se chegou aqui, as datas são válidas mas o cálculo retornou null por outro motivo
                                return <span className="text-gray-500 text-xs" title="Erro ao calcular - verifique as datas">Erro</span>;
                              }
                            }
                          } catch (e) {
                            // Ignorar erros de conversão
                            return <span className="text-gray-500 text-xs" title="Erro ao processar datas">Erro</span>;
                          }
                        }
                        
                        // Sem datas preenchidas
                        return '-';
                      })()}
                    </td>
                  </tr>
                  
                  {/* Linha 2: Avaliação e Resultado - Cabeçalho */}
                  <tr className="bg-blue-50">
                    <th colSpan="8" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Avaliação e Resultado
                    </th>
                  </tr>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Temp. (°C)</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Aval. Sensorial</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tam. Lote</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">NQA</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nº Amostras Aval.</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nº Aprov.</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nº Reprov.</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Resultado Final</th>
                  </tr>
                  {/* Linha 2: Avaliação e Resultado - Dados */}
                  <tr className="bg-gray-50 hover:bg-gray-100">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Input
                        type="number"
                        value={produto.temperatura || ''}
                        onChange={(e) => handleFieldChange(index, 'temperatura', e.target.value)}
                        placeholder="°C"
                        className="w-20 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <select
                        value={produto.aval_sensorial || ''}
                        onChange={(e) => handleFieldChange(index, 'aval_sensorial', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Selecione...</option>
                        <option value="Conforme">Conforme</option>
                        <option value="Não Conforme">Não Conforme</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Input
                        type="number"
                        value={produto.tam_lote || ''}
                        onChange={(e) => {
                          handleFieldChange(index, 'tam_lote', e.target.value);
                          // Buscar plano quando tamanho do lote mudar
                          if (produto.grupo_id && e.target.value) {
                            buscarDadosNQA({ ...produto, tam_lote: e.target.value });
                          }
                        }}
                        placeholder="Tamanho"
                        className="w-20 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 font-medium">
                      {produto.nqa_codigo || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 font-medium">
                      {produto.num_amostras_avaliadas || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Input
                        type="number"
                        value={produto.num_amostras_aprovadas || ''}
                        onChange={(e) => handleFieldChange(index, 'num_amostras_aprovadas', e.target.value)}
                        className="w-16 text-sm"
                        min="0"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Input
                        type="number"
                        value={produto.num_amostras_reprovadas || ''}
                        onChange={(e) => handleFieldChange(index, 'num_amostras_reprovadas', e.target.value)}
                        className="w-16 text-sm"
                        min="0"
                      />
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm text-center ${getResultadoColor(produto.resultado_final || calcularResultadoFinal(produto))}`}>
                      {produto.resultado_final || calcularResultadoFinal(produto) || '-'}
                    </td>
                  </tr>
                  {/* Linha de ações (opcional, pode ser removida se não quiser) */}
                  <tr className="bg-gray-100">
                    <td colSpan="8" className="px-4 py-2 text-right">
                      <button
                        onClick={() => onRemove(index)}
                        className="text-red-600 hover:text-red-900 p-1 rounded transition-colors text-sm"
                        title="Remover produto"
                      >
                        <FaTrash className="w-4 h-4 inline mr-1" />
                        Remover
                      </button>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

ProdutosTable.displayName = 'ProdutosTable';

export default ProdutosTable;

