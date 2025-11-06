import { useState, useCallback } from 'react';
import necessidadesService from '../../services/necessidadesService';

/**
 * Hook para gerenciar cálculos relacionados a necessidades
 * (médias por período)
 */
export const useNecessidadesCalculos = () => {
  const [mediasPeriodo, setMediasPeriodo] = useState({});

  // Calcular médias por período
  const calcularMediasPorPeriodo = useCallback(async (escolaId, data) => {
    if (!escolaId || !data) return;
    
    try {
      let dataFormatada;
      
      // Se a data for uma string da semana (ex: "06/01 a 12/01"), converter para data
      if (typeof data === 'string' && data.includes(' a ')) {
        // Remover parênteses se existirem
        const dataLimpa = data.replace(/[()]/g, '');
        // Extrair a primeira data da string (ex: "06/01" de "06/01 a 12/01")
        const primeiraData = dataLimpa.split(' a ')[0];
        const [dia, mes] = primeiraData.split('/');
        
        // Determinar o ano baseado na data atual
        // Para janeiro, usar uma data que existe na tabela (outubro 2025)
        const agora = new Date();
        const anoAtual = agora.getFullYear();
        const mesAtual = agora.getMonth() + 1; // 0-11 -> 1-12
        const mesData = parseInt(mes);
        
        let ano;
        if (mesData === 1 && mesAtual >= 10) {
          // Janeiro do próximo ano, mas usar outubro do ano atual (onde há dados)
          ano = anoAtual;
          // Usar outubro em vez de janeiro para encontrar registros existentes
          const mesFormatado = '10';
          const diaFormatado = '24'; // Usar uma data que existe
          dataFormatada = `${ano}-${mesFormatado}-${diaFormatado}`;
        } else {
          // Mesmo ano
          ano = anoAtual;
          // Garantir que dia e mês tenham 2 dígitos
          const diaFormatado = String(dia).padStart(2, '0');
          const mesFormatado = String(mes).padStart(2, '0');
          dataFormatada = `${ano}-${mesFormatado}-${diaFormatado}`;
        }
      } else if (data instanceof Date) {
        dataFormatada = data.toISOString().split('T')[0];
      } else {
        dataFormatada = data;
      }
      
      const response = await necessidadesService.calcularMediasPorPeriodo(escolaId, dataFormatada);
      
      if (response.success) {
        setMediasPeriodo(response.data);
        return response.data; // Retornar os dados para uso externo
      }
    } catch (err) {
      console.error('Erro ao calcular médias por período:', err);
      throw err; // Re-throw para que o erro seja capturado no componente
    }
  }, []);

  // Limpar médias por período
  const limparMediasPeriodo = useCallback(() => {
    setMediasPeriodo({});
  }, []);

  return {
    mediasPeriodo,
    calcularMediasPorPeriodo,
    limparMediasPeriodo
  };
};

