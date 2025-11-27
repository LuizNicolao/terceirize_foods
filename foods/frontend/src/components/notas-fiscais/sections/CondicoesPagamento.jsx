import React, { useState, useEffect, useRef } from 'react';
import { FaCreditCard } from 'react-icons/fa';
import { Input } from '../../ui';
import FormSection from './FormSection';

const CondicoesPagamento = ({ pedido, dataEmissao, isViewMode = false, formData, onChange }) => {
  if (!pedido) {
    return null;
  }

  // Extrair número de parcelas do prazo de pagamento
  const extrairNumeroParcelas = (prazo) => {
    if (!prazo) return 1;
    
    const prazoStr = String(prazo).toLowerCase().trim();
    
    // Se for "à vista" ou similar, retorna 1
    if (prazoStr.includes('vista') || prazoStr === '1x' || prazoStr === '1') {
      return 1;
    }
    
    // Tentar extrair número de parcelas (ex: "2x", "3x", "2", "3")
    const match = prazoStr.match(/(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
    
    return 1;
  };

  // Extrair dias de cada parcela do prazo de pagamento
  // Ex: "4x (30/60/90/120 dias)" -> [30, 60, 90, 120]
  const extrairDiasParcelas = (prazo) => {
    if (!prazo) return [];
    
    const prazoStr = String(prazo).trim();
    
    // Tentar extrair padrão: "4x (30/60/90/120 dias)" ou similar
    const match = prazoStr.match(/\(([\d\/\s]+)\s*dias?\)/i);
    if (match) {
      const diasStr = match[1];
      const dias = diasStr.split('/').map(d => parseInt(d.trim(), 10)).filter(d => !isNaN(d));
      if (dias.length > 0) {
        return dias;
      }
    }
    
    // Se não encontrou padrão, tentar extrair número de parcelas e usar intervalo padrão
    const numeroParcelas = extrairNumeroParcelas(prazo);
    if (numeroParcelas > 1) {
      // Se não especificou dias, usar 30 dias por padrão entre parcelas
      return Array.from({ length: numeroParcelas }, (_, i) => 30 * (i + 1));
    }
    
    return [0]; // À vista
  };

  // Calcular data de vencimento baseado na data de emissão e dias
  const calcularDataVencimento = (dataEmissao, dias) => {
    if (!dataEmissao) return '';
    
    try {
      const data = new Date(dataEmissao);
      data.setDate(data.getDate() + dias);
      
      // Formatar para YYYY-MM-DD (formato do input date)
      const ano = data.getFullYear();
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const dia = String(data.getDate()).padStart(2, '0');
      
      return `${ano}-${mes}-${dia}`;
    } catch (error) {
      return '';
    }
  };

  const numeroParcelas = extrairNumeroParcelas(pedido.prazo_pagamento_nome || pedido.prazo_pagamento);
  const numeroParcelasAnteriorRef = useRef(numeroParcelas);
  const dataEmissaoAnteriorRef = useRef(dataEmissao);
  const prazoAnteriorRef = useRef(pedido.prazo_pagamento_nome || pedido.prazo_pagamento);
  
  // Inicializar datas de vencimento
  const [datasVencimento, setDatasVencimento] = useState(() => {
    if (formData?.datas_vencimento && Array.isArray(formData.datas_vencimento) && formData.datas_vencimento.length > 0) {
      return formData.datas_vencimento;
    }
    // Inicializar com array vazio do tamanho correto
    return Array(numeroParcelas).fill('');
  });

  // Flag para controlar se a atualização veio de cálculo interno ou externo
  const isCalculoInternoRef = useRef(false);
  const ultimasDatasEnviadasRef = useRef('');

  // Sincronizar com formData quando mudar externamente (apenas se vier de fora, não de cálculo interno)
  useEffect(() => {
    if (isCalculoInternoRef.current) {
      return;
    }
    
    if (formData?.datas_vencimento && Array.isArray(formData.datas_vencimento)) {
      const datasNovas = formData.datas_vencimento.join(',');
      if (ultimasDatasEnviadasRef.current !== datasNovas) {
        setDatasVencimento(formData.datas_vencimento);
      }
    }
  }, [formData?.datas_vencimento]);

  // Calcular e preencher datas de vencimento automaticamente
  useEffect(() => {
    const novasParcelas = extrairNumeroParcelas(pedido.prazo_pagamento_nome || pedido.prazo_pagamento);
    const parcelasAnteriores = numeroParcelasAnteriorRef.current;
    const prazo = pedido.prazo_pagamento_nome || pedido.prazo_pagamento;
    const prazoAnterior = prazoAnteriorRef.current;
    const dataEmissaoAnterior = dataEmissaoAnteriorRef.current;
    
    // Verificar se algo mudou que requer recálculo
    const mudouParcelas = novasParcelas !== parcelasAnteriores;
    const mudouPrazo = prazo !== prazoAnterior;
    const mudouDataEmissao = dataEmissao !== dataEmissaoAnterior;
    
    // Só recalcular se mudou algo relevante E tem data de emissão
    if ((mudouParcelas || mudouPrazo || mudouDataEmissao) && dataEmissao) {
      const diasParcelas = extrairDiasParcelas(prazo);
      
      // Atualizar refs
      numeroParcelasAnteriorRef.current = novasParcelas;
      dataEmissaoAnteriorRef.current = dataEmissao;
      prazoAnteriorRef.current = prazo;
      isCalculoInternoRef.current = true;
      
      setDatasVencimento(prevDatas => {
        const novasDatas = [];
        
        // Calcular datas baseado nos dias extraídos do prazo
        for (let i = 0; i < novasParcelas; i++) {
          // Se mudou apenas a data de emissão e já tinha data preenchida, recalcular
          // Se mudou o prazo ou número de parcelas, sempre recalcular
          if (mudouDataEmissao && !mudouParcelas && !mudouPrazo && prevDatas[i]) {
            // Recalcular baseado na nova data de emissão, mantendo a diferença de dias
            const dataAnterior = new Date(prevDatas[i]);
            const dataEmissaoAnteriorDate = new Date(dataEmissaoAnterior);
            const diferencaDias = Math.round((dataAnterior - dataEmissaoAnteriorDate) / (1000 * 60 * 60 * 24));
            const novaData = calcularDataVencimento(dataEmissao, diferencaDias);
            novasDatas.push(novaData);
          } else {
            // Calcular nova data baseado nos dias do prazo
            const dias = diasParcelas[i] !== undefined ? diasParcelas[i] : (diasParcelas[0] || 0) + (30 * i);
            const dataCalculada = calcularDataVencimento(dataEmissao, dias);
            novasDatas.push(dataCalculada);
          }
        }
        
        // Chamar onChange de forma assíncrona após atualizar estado
        if (onChange) {
          setTimeout(() => {
            onChange('datas_vencimento', novasDatas);
            ultimasDatasEnviadasRef.current = novasDatas.join(',');
            isCalculoInternoRef.current = false;
          }, 0);
        }
        
        return novasDatas;
      });
    } else if (mudouParcelas && !dataEmissao) {
      // Se mudou número de parcelas mas não tem data de emissão, apenas ajustar array
      numeroParcelasAnteriorRef.current = novasParcelas;
      prazoAnteriorRef.current = prazo;
      isCalculoInternoRef.current = true;
      
      setDatasVencimento(prevDatas => {
        const novasDatas = [...prevDatas];
        if (novasDatas.length < novasParcelas) {
          while (novasDatas.length < novasParcelas) {
            novasDatas.push('');
          }
        } else if (novasDatas.length > novasParcelas) {
          novasDatas.splice(novasParcelas);
        }
        
        if (onChange) {
          setTimeout(() => {
            onChange('datas_vencimento', novasDatas);
            ultimasDatasEnviadasRef.current = novasDatas.join(',');
            isCalculoInternoRef.current = false;
          }, 0);
        }
        
        return novasDatas;
      });
    } else {
      // Atualizar refs mesmo se não recalcular
      numeroParcelasAnteriorRef.current = novasParcelas;
      dataEmissaoAnteriorRef.current = dataEmissao;
      prazoAnteriorRef.current = prazo;
    }
  }, [pedido.prazo_pagamento_nome, pedido.prazo_pagamento, dataEmissao, onChange]);

  // Atualizar formData quando datas mudarem
  const handleDataVencimentoChange = (index, value) => {
    const novasDatas = [...datasVencimento];
    novasDatas[index] = value;
    setDatasVencimento(novasDatas);
    if (onChange) {
      onChange('datas_vencimento', novasDatas);
    }
  };

  return (
    <FormSection
      icon={FaCreditCard}
      title="Condições de Pagamento"
      description="Informações de pagamento do pedido e datas de vencimento das parcelas."
      isGreenBox={true}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Forma de Pagamento
            </label>
            <p className="text-sm text-gray-900">
              {pedido.forma_pagamento_nome || pedido.forma_pagamento || '-'}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Prazo de Pagamento
            </label>
            <p className="text-sm text-gray-900">
              {pedido.prazo_pagamento_nome || pedido.prazo_pagamento || '-'}
            </p>
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">
            Datas de Vencimento *
          </label>
          <div className="grid grid-cols-6 gap-3">
            {Array.from({ length: numeroParcelas }, (_, index) => (
              <div key={index} className="flex flex-col gap-1">
                <label className="text-xs text-gray-600">
                  Parcela {index + 1}
                </label>
                {isViewMode ? (
                  <p className="text-sm text-gray-900">
                    {datasVencimento[index] 
                      ? new Date(datasVencimento[index]).toLocaleDateString('pt-BR')
                      : '-'}
                  </p>
                ) : (
                  <Input
                    type="date"
                    name={`data_vencimento_${index + 1}`}
                    value={datasVencimento[index] || ''}
                    onChange={(e) => handleDataVencimentoChange(index, e.target.value)}
                    required
                    className="w-full"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </FormSection>
  );
};

export default CondicoesPagamento;

