import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { Modal, Button, Input } from '../ui';
import toast from 'react-hot-toast';
import RelatorioInspecaoService from '../../services/relatorioInspecao';

// Funções utilitárias para manipulação de datas
const formatDateBR = (dateISO) => {
  if (!dateISO) return '';
  const date = new Date(dateISO);
  return date.toLocaleDateString('pt-BR');
};

const formatDateISO = (dateBR) => {
  if (!dateBR) return '';
  const parsed = dateBR.split('/');
  if (parsed.length !== 3) return '';
  const [dia, mes, ano] = parsed;
  if (dia.length !== 2 || mes.length !== 2 || ano.length !== 4) return '';
  return `${ano}-${mes}-${dia}`;
};

// Função para converter string numérica (aceita vírgula ou ponto) para número
const parseNumber = (value) => {
  if (!value && value !== 0) return NaN;
  if (typeof value === 'number') return value;
  // Substituir vírgula por ponto para parseFloat
  const normalized = String(value).replace(',', '.');
  return parseFloat(normalized);
};

// Função para formatar números (remove zeros desnecessários e formata decimais)
const formatNumber = (value) => {
  if (!value && value !== 0) return '-';
  
  // Converter para número
  const num = parseNumber(value);
  
  if (isNaN(num)) return value;
  
  // Se for número inteiro, exibir sem decimais
  if (num % 1 === 0) {
    return num.toString();
  }
  
  // Se tiver decimais, formatar com vírgula e remover zeros à direita
  return num.toFixed(3).replace('.', ',').replace(/\.?0+$/, '');
};

const ProdutoEdicaoModal = ({ 
  isOpen, 
  onClose, 
  produto, 
  onSave,
  grupos = []
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && produto) {
      setFormData({
        fabricacao: produto.fabricacao || formatDateISO(produto.fabricacaoBR) || '',
        fabricacaoBR: produto.fabricacaoBR || formatDateBR(produto.fabricacao) || '',
        lote: produto.lote || '',
        validade: produto.validade || formatDateISO(produto.validadeBR) || '',
        validadeBR: produto.validadeBR || formatDateBR(produto.validade) || '',
        temperatura: produto.temperatura || '',
        aval_sensorial: produto.aval_sensorial || '',
        tam_lote: produto.tam_lote || '',
        num_amostras_aprovadas: produto.num_amostras_aprovadas || '',
        num_amostras_reprovadas: produto.num_amostras_reprovadas || '',
      });
      setErrors({});
    }
  }, [isOpen, produto]);

  // Calcular controle de validade
  const calcularControleValidade = (fabricacao, validade) => {
    if (!fabricacao || !validade) return null;

    try {
      let fabricacaoISO = fabricacao.includes('/') ? formatDateISO(fabricacao) : fabricacao;
      let validadeISO = validade.includes('/') ? formatDateISO(validade) : validade;
      
      if (!fabricacaoISO || !validadeISO) return null;
      
      const fabricacaoDate = new Date(fabricacaoISO);
      fabricacaoDate.setHours(0, 0, 0, 0);
      
      const validadeDate = new Date(validadeISO);
      validadeDate.setHours(0, 0, 0, 0);
      
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      if (isNaN(fabricacaoDate.getTime()) || isNaN(validadeDate.getTime())) return null;
      if (validadeDate < fabricacaoDate) return null;
      
      const prazoTotal = Math.ceil((validadeDate - fabricacaoDate) / (1000 * 60 * 60 * 24));
      if (prazoTotal <= 0) return null;
      
      const diasRestantes = Math.ceil((validadeDate - hoje) / (1000 * 60 * 60 * 24));
      const percentualConsumido = ((1 - (diasRestantes / prazoTotal)) * 100);
      const percentualLimitado = Math.max(0, Math.min(100, percentualConsumido));

      return parseFloat(percentualLimitado.toFixed(2));
    } catch (error) {
      return null;
    }
  };

  // Calcular resultado final
  // Retorna null se não houver dados suficientes para calcular
  const calcularResultadoFinal = () => {
    // Verificar se há dados mínimos necessários para calcular o resultado
    const temFabricacao = formData.fabricacao || formData.fabricacaoBR;
    const temValidade = formData.validade || formData.validadeBR;
    const temLote = formData.lote;
    const temAvalSensorial = formData.aval_sensorial;
    const temTamLote = formData.tam_lote;
    const temAmostrasAvaliadas = formData.num_amostras_avaliadas;
    const temAmostrasReprovadas = formData.num_amostras_reprovadas !== null && formData.num_amostras_reprovadas !== undefined && formData.num_amostras_reprovadas !== '';
    
    // Verificar se é grupo Frios (precisa de temperatura)
    const grupoNome = produto?.grupo_nome || '';
    const isGrupoFrios = grupoNome.toLowerCase() === 'frios';
    const temTemperatura = !isGrupoFrios || formData.temperatura;
    
    // Se não tiver dados obrigatórios, não calcular resultado
    if (!temFabricacao || !temValidade || !temLote || !temAvalSensorial || !temTemperatura || !temTamLote || !temAmostrasAvaliadas) {
      return null;
    }
    
    const controleValidade = calcularControleValidade(
      formData.fabricacao || formData.fabricacaoBR,
      formData.validade || formData.validadeBR
    );
    
    if (controleValidade !== null && controleValidade > 30) {
      return 'Reprovado';
    }
    
    // Verificar amostras reprovadas (apenas se tiver RE definido e amostras reprovadas informadas)
    if (temAmostrasReprovadas) {
      const numReprovadas = parseInt(formData.num_amostras_reprovadas || 0);
      const re = parseInt(produto?.re || 0);

      if (re > 0 && numReprovadas >= re) {
        return 'Reprovado';
      }
    }
    
    // Se todas as condições foram atendidas e não há motivo para reprovação, aprovar
    return 'Aprovado';
  };

  // Buscar NQA e plano de amostragem
  const buscarDadosNQA = async () => {
    if (!produto?.grupo_id && !produto?.grupoId) return;

    const grupoId = produto.grupo_id || produto.grupoId;
    
    try {
      const nqaResponse = await RelatorioInspecaoService.buscarNQAGrupo(grupoId);
      if (nqaResponse.success && nqaResponse.data) {
        const nqa = nqaResponse.data;
        
        if (formData.tam_lote && parseInt(formData.tam_lote) > 0) {
          const planoResponse = await RelatorioInspecaoService.buscarPlanoPorLote(
            nqa.id,
            parseInt(formData.tam_lote)
          );
          
          if (planoResponse.success && planoResponse.data) {
            const plano = planoResponse.data;
            setFormData(prev => {
              const updated = {
                ...prev,
                nqa_codigo: nqa.codigo,
                nqa_id: nqa.id,
                num_amostras_avaliadas: plano.tamanho_amostra,
                ac: plano.ac,
                re: plano.re
              };
              
              // Validar soma de amostras quando num_amostras_avaliadas for atualizado
              const numAmostrasAvaliadas = parseNumber(plano.tamanho_amostra || 0);
              const numAprovadas = parseNumber(updated.num_amostras_aprovadas || 0);
              const numReprovadas = parseNumber(updated.num_amostras_reprovadas || 0);
              const somaAmostras = numAprovadas + numReprovadas;
              
              if (numAmostrasAvaliadas > 0) {
                const diferenca = Math.abs(somaAmostras - numAmostrasAvaliadas);
                if (diferenca > 0.0001) {
                  setErrors(prev => ({
                    ...prev,
                    num_amostras_reprovadas: `A soma de aprovadas e reprovadas deve ser igual ao número de amostras avaliadas (${formatNumber(numAmostrasAvaliadas)})`
                  }));
                } else {
                  // Remover erro se a soma estiver correta
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.num_amostras_reprovadas;
                    return newErrors;
                  });
                }
              }
              
              return updated;
            });
          } else {
            setFormData(prev => ({
              ...prev,
              nqa_codigo: nqa.codigo,
              nqa_id: nqa.id
            }));
          }
        } else {
          setFormData(prev => ({
            ...prev,
            nqa_codigo: nqa.codigo,
            nqa_id: nqa.id
          }));
        }
      }
    } catch (error) {
      console.error('Erro ao buscar NQA:', error);
    }
  };

  useEffect(() => {
    if (formData.tam_lote && produto?.grupo_id) {
      const timer = setTimeout(() => {
        buscarDadosNQA();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [formData.tam_lote]);

  const handleFieldChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev };
      
      if (field === 'fabricacao') {
        updated.fabricacao = value;
        updated.fabricacaoBR = formatDateBR(value);
      } else if (field === 'validade') {
        updated.validade = value;
        updated.validadeBR = formatDateBR(value);
      } else {
        updated[field] = value;
      }
      
      // Auto-preencher Nº Aprov. quando Nº Reprov. for alterado
      if (field === 'num_amostras_reprovadas') {
        const numAmostrasAvaliadas = parseNumber(updated.num_amostras_avaliadas || produto?.num_amostras_avaliadas || 0);
        const numReprovadas = parseNumber(value || 0);
        
        if (!isNaN(numAmostrasAvaliadas) && numAmostrasAvaliadas > 0 && !isNaN(numReprovadas) && numReprovadas >= 0) {
          const numAprovadas = numAmostrasAvaliadas - numReprovadas;
          if (numAprovadas >= 0) {
            // Formatar o número mantendo decimais se necessário
            updated.num_amostras_aprovadas = numAprovadas % 1 === 0 
              ? numAprovadas.toString() 
              : numAprovadas.toFixed(3).replace(/\.?0+$/, '');
          } else {
            // Se o resultado for negativo, limpar o campo
            updated.num_amostras_aprovadas = '';
          }
        }
      }
      
      // Validar soma de amostras em tempo real quando alterar reprovadas (aprovadas não é editável)
      if (field === 'num_amostras_reprovadas') {
        const numAmostrasAvaliadas = parseNumber(updated.num_amostras_avaliadas || produto?.num_amostras_avaliadas || 0);
        const numAprovadas = parseNumber(updated.num_amostras_aprovadas || 0);
        const numReprovadas = parseNumber(updated.num_amostras_reprovadas || 0);
        const somaAmostras = numAprovadas + numReprovadas;
        
        if (numAmostrasAvaliadas > 0) {
          // Usar comparação com tolerância para números decimais
          const diferenca = Math.abs(somaAmostras - numAmostrasAvaliadas);
          if (diferenca > 0.0001) { // Tolerância para erros de ponto flutuante
            setErrors(prev => ({
              ...prev,
              num_amostras_reprovadas: `A soma de aprovadas e reprovadas deve ser igual ao número de amostras avaliadas (${formatNumber(numAmostrasAvaliadas)})`
            }));
          } else {
            // Remover erro se a soma estiver correta
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.num_amostras_reprovadas;
              return newErrors;
            });
          }
        }
      }
      
      return updated;
    });

    // Remover erro do campo
    if (errors[field] && !errors[field].includes('soma')) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    let hasErrors = false;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Validar fabricação
    if (!formData.fabricacao && !formData.fabricacaoBR) {
      newErrors.fabricacao = 'Fabricação é obrigatória';
      hasErrors = true;
    } else {
      const fabricacao = formData.fabricacao || formatDateISO(formData.fabricacaoBR);
      if (fabricacao) {
        const fabricacaoDate = new Date(fabricacao);
        fabricacaoDate.setHours(0, 0, 0, 0);
        if (fabricacaoDate > hoje) {
          newErrors.fabricacao = 'Data de fabricação não pode ser superior à data atual';
          hasErrors = true;
        }
      }
    }

    // Validar lote
    if (!formData.lote || formData.lote.trim() === '') {
      newErrors.lote = 'Lote é obrigatório';
      hasErrors = true;
    }

    // Validar validade
    if (!formData.validade && !formData.validadeBR) {
      newErrors.validade = 'Validade é obrigatória';
      hasErrors = true;
    } else {
      const validade = formData.validade || formatDateISO(formData.validadeBR);
      if (validade) {
        const validadeDate = new Date(validade);
        validadeDate.setHours(0, 0, 0, 0);
        if (validadeDate < hoje) {
          newErrors.validade = 'Data de validade não pode ser anterior à data atual';
          hasErrors = true;
        }
      }
    }

    // Validar avaliação sensorial
    if (!formData.aval_sensorial || formData.aval_sensorial.trim() === '') {
      newErrors.aval_sensorial = 'Avaliação sensorial é obrigatória';
      hasErrors = true;
    }

    // Validar tamanho do lote
    const tamLoteParsed = parseNumber(formData.tam_lote);
    if (!formData.tam_lote || formData.tam_lote.trim() === '' || isNaN(tamLoteParsed) || tamLoteParsed <= 0) {
      newErrors.tam_lote = 'Tamanho do lote é obrigatório';
      hasErrors = true;
    } else {
      // Validar se tam_lote não é maior que quantidade do pedido
      const quantidadePedido = parseNumber(produto?.qtde || produto?.quantidade_pedido || 0);
      
      if (!isNaN(quantidadePedido) && tamLoteParsed > quantidadePedido) {
        newErrors.tam_lote = `Tamanho do lote não pode ser superior à quantidade do pedido (${formatNumber(quantidadePedido)})`;
        hasErrors = true;
      }
    }

    // Validar temperatura (obrigatória apenas para produtos do grupo Frios)
    const grupoNome = produto?.grupo_nome || '';
    const isGrupoFrios = grupoNome.toLowerCase() === 'frios';
    if (isGrupoFrios && (!formData.temperatura || formData.temperatura.trim() === '')) {
      newErrors.temperatura = 'Temperatura é obrigatória para produtos do grupo Frios';
      hasErrors = true;
    }

    // Validar número de amostras aprovadas (campo não editável, apenas verificar se existe)
    const numAprovadas = parseNumber(formData.num_amostras_aprovadas || 0);

    // Validar número de amostras reprovadas (apenas números inteiros)
    const numReprovadas = parseNumber(formData.num_amostras_reprovadas);
    if (!formData.num_amostras_reprovadas || formData.num_amostras_reprovadas.trim() === '' || isNaN(numReprovadas) || numReprovadas < 0) {
      newErrors.num_amostras_reprovadas = 'Número de amostras reprovadas é obrigatório';
      hasErrors = true;
    } else if (numReprovadas % 1 !== 0) {
      newErrors.num_amostras_reprovadas = 'O número de amostras reprovadas deve ser um número inteiro';
      hasErrors = true;
    }

    // Validar se a soma de aprovadas + reprovadas é igual ao número de amostras avaliadas
    const numAmostrasAvaliadas = parseNumber(formData.num_amostras_avaliadas || produto?.num_amostras_avaliadas || 0);
    if (!isNaN(numAmostrasAvaliadas) && numAmostrasAvaliadas > 0) {
      const somaAmostras = numAprovadas + numReprovadas;
      
      // Usar comparação com tolerância para números decimais
      const diferenca = Math.abs(somaAmostras - numAmostrasAvaliadas);
      if (diferenca > 0.0001) { // Tolerância para erros de ponto flutuante
        // Apenas mostrar erro no campo reprovadas (aprovadas não é editável)
        newErrors.num_amostras_reprovadas = `A soma de aprovadas e reprovadas deve ser igual ao número de amostras avaliadas (${formatNumber(numAmostrasAvaliadas)})`;
        hasErrors = true;
      }
    }

    // Validar se validade é posterior à fabricação
    const fabricacao = formData.fabricacao || formatDateISO(formData.fabricacaoBR);
    const validade = formData.validade || formatDateISO(formData.validadeBR);
    if (fabricacao && validade) {
      const fabricacaoDate = new Date(fabricacao);
      const validadeDate = new Date(validade);
      fabricacaoDate.setHours(0, 0, 0, 0);
      validadeDate.setHours(0, 0, 0, 0);
      if (validadeDate < fabricacaoDate) {
        newErrors.validade = 'Data de validade não pode ser anterior à data de fabricação';
        hasErrors = true;
      }
    }

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleSave = () => {
    if (!validate()) {
      toast.error('Por favor, corrija os erros antes de salvar');
      return;
    }

    const controleValidade = calcularControleValidade(
      formData.fabricacao || formData.fabricacaoBR,
      formData.validade || formData.validadeBR
    );

    const resultadoFinal = calcularResultadoFinal();

    const produtoAtualizado = {
      ...produto,
      ...formData,
      controle_validade: controleValidade,
      resultado_final: resultadoFinal
    };

    onSave(produtoAtualizado);
    onClose();
  };

  if (!isOpen || !produto) return null;

  const controleValidade = calcularControleValidade(
    formData.fabricacao || formData.fabricacaoBR,
    formData.validade || formData.validadeBR
  );
  const resultadoFinal = calcularResultadoFinal();
  const grupoNome = produto?.grupo_nome || '';
  const isGrupoFrios = grupoNome.toLowerCase() === 'frios';

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" title="Editar Produto">
      <div className="space-y-6">
        {/* Informações do Produto (somente leitura) */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-3">Informações do Produto</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Código:</span>
              <p className="font-medium text-gray-900">{produto.codigo || produto.codigo_produto || '-'}</p>
            </div>
            <div>
              <span className="text-gray-600">Produto:</span>
              <p className="font-medium text-gray-900">{produto.descricao || produto.nome_produto || '-'}</p>
            </div>
            <div>
              <span className="text-gray-600">Unidade:</span>
              <p className="font-medium text-gray-900">{produto.und || produto.unidade_medida || '-'}</p>
            </div>
            <div>
              <span className="text-gray-600">Qtd. Pedido:</span>
              <p className="font-medium text-gray-900">{formatNumber(produto.qtde || produto.quantidade_pedido)}</p>
            </div>
          </div>
        </div>

        {/* Seção: Informações de Recebimento */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 border-b pb-2">Informações de Recebimento</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label={<span>Fabricação <span className="text-red-500">*</span></span>}
              type="date"
              value={formData.fabricacao}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                const dataSelecionada = e.target.value;
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);
                const dataFabricacao = new Date(dataSelecionada);
                
                if (dataFabricacao > hoje) {
                  setErrors(prev => ({
                    ...prev,
                    fabricacao: 'Data de fabricação não pode ser superior à data atual'
                  }));
                  return;
                }
                
                handleFieldChange('fabricacao', dataSelecionada);
              }}
              error={errors.fabricacao}
            />

            <Input
              label={<span>Lote <span className="text-red-500">*</span></span>}
              type="text"
              value={formData.lote}
              onChange={(e) => handleFieldChange('lote', e.target.value)}
              error={errors.lote}
              placeholder="Número do lote"
            />

            <Input
              label={<span>Validade <span className="text-red-500">*</span></span>}
              type="date"
              value={formData.validade}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                const dataSelecionada = e.target.value;
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);
                const dataValidade = new Date(dataSelecionada);
                
                if (dataValidade < hoje) {
                  setErrors(prev => ({
                    ...prev,
                    validade: 'Data de validade não pode ser anterior à data atual'
                  }));
                  return;
                }
                
                handleFieldChange('validade', dataSelecionada);
              }}
              error={errors.validade}
            />
          </div>

          {/* Controle de Validade */}
          {controleValidade !== null && (
            <div className={`p-3 rounded-lg ${getValidadeColor(controleValidade)}`}>
              <p className="text-sm font-medium">
                Controle de Validade: <span className="font-bold">{controleValidade}%</span>
              </p>
            </div>
          )}
        </div>

        {/* Seção: Avaliação e Resultado */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 border-b pb-2">Avaliação e Resultado</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={
                <span>
                  Temp. (°C)
                  {isGrupoFrios && <span className="text-red-500"> *</span>}
                </span>
              }
              type="number"
              step="0.1"
              min="-50"
              max="50"
              value={formData.temperatura}
              onChange={(e) => handleFieldChange('temperatura', e.target.value)}
              error={errors.temperatura}
              placeholder="°C"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aval. Sensorial <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.aval_sensorial || ''}
                onChange={(e) => handleFieldChange('aval_sensorial', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.aval_sensorial ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecione...</option>
                <option value="Conforme">Conforme</option>
                <option value="Não Conforme">Não Conforme</option>
              </select>
              {errors.aval_sensorial && (
                <p className="mt-1 text-sm text-red-600">{errors.aval_sensorial}</p>
              )}
            </div>

            <Input
              label={<span>Tam. Lote <span className="text-red-500">*</span></span>}
              type="number"
              step="0.1"
              value={formData.tam_lote}
              onChange={(e) => {
                const valor = e.target.value;
                const quantidadePedido = parseNumber(produto?.qtde || produto?.quantidade_pedido || 0);
                const tamLote = parseNumber(valor);
                
                // Validar em tempo real
                if (valor && !isNaN(tamLote) && !isNaN(quantidadePedido) && tamLote > quantidadePedido) {
                  setErrors(prev => ({
                    ...prev,
                    tam_lote: `Tamanho do lote não pode ser superior à quantidade do pedido (${formatNumber(quantidadePedido)})`
                  }));
                } else if (errors.tam_lote && errors.tam_lote.includes('superior')) {
                  // Remover erro se o valor for válido
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.tam_lote;
                    return newErrors;
                  });
                }
                
                handleFieldChange('tam_lote', valor);
              }}
              error={errors.tam_lote}
              placeholder="Tamanho"
              min="0.1"
              max={produto?.qtde || produto?.quantidade_pedido || undefined}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">NQA</label>
              <p className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-600">
                {formData.nqa_codigo || produto?.nqa_codigo || '-'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nº Amostras Aval.</label>
              <p className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-600">
                {formData.num_amostras_avaliadas || produto?.num_amostras_avaliadas || '-'}
              </p>
            </div>

            <Input
              label={<span>Nº Aprov. <span className="text-red-500">*</span></span>}
              type="number"
              step="0.1"
              value={formData.num_amostras_aprovadas}
              onChange={(e) => handleFieldChange('num_amostras_aprovadas', e.target.value)}
              error={errors.num_amostras_aprovadas}
              min="0"
              placeholder="0"
              disabled={true}
              className="bg-gray-50"
            />

            <Input
              label={<span>Nº Reprov. <span className="text-red-500">*</span></span>}
              type="number"
              step="1"
              value={formData.num_amostras_reprovadas}
              onChange={(e) => {
                const value = e.target.value;
                // Aceitar apenas números inteiros (bloquear decimais)
                if (value === '' || (!isNaN(value) && Number.isInteger(parseFloat(value)) && parseFloat(value) >= 0)) {
                  handleFieldChange('num_amostras_reprovadas', value);
                } else if (value.includes('.') || value.includes(',')) {
                  // Bloquear se contém ponto ou vírgula (decimais)
                  return;
                }
              }}
              onKeyDown={(e) => {
                // Bloquear teclas de ponto e vírgula
                if (e.key === '.' || e.key === ',' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                  e.preventDefault();
                }
              }}
              error={errors.num_amostras_reprovadas}
              min="0"
              placeholder="0"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Resultado Final</label>
              <div className={`px-3 py-2 rounded-lg text-sm text-center ${getResultadoColor(resultadoFinal)}`}>
                {resultadoFinal || 'Aguardando avaliação'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            size="md"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            variant="primary"
            size="md"
          >
            Salvar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProdutoEdicaoModal;

