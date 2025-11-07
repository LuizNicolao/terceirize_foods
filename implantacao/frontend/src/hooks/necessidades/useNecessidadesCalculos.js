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
      console.debug('[useNecessidadesCalculos] 🔄 calcularMediasPorPeriodo', {
        escolaId,
        dataRecebida: data
      });

      let dataFormatada = null;

      // Se a data for uma string da semana (ex: "06/01 a 12/01"), converter para data
      if (typeof data === 'string') {
        const dataLimpa = data.replace(/[()]/g, '').trim();

        if (dataLimpa.includes(' a ')) {
          const [inicioRaw, fimRaw] = dataLimpa.split(' a ');
          const [diaInicioStr, mesInicioStr] = inicioRaw.split('/');

          if (diaInicioStr && mesInicioStr) {
            const fimPartes = fimRaw.split('/');
            let anoFimStr = fimPartes.length >= 3 ? fimPartes[2] : '';

            let anoFim = anoFimStr ? parseInt(anoFimStr, 10) : new Date().getFullYear();

            if (!Number.isFinite(anoFim)) {
              anoFim = new Date().getFullYear();
            }

            if (anoFim < 100) {
              anoFim += 2000;
            }

            const mesInicio = parseInt(mesInicioStr, 10);
            const mesFim = fimPartes.length >= 2 ? parseInt(fimPartes[1], 10) : mesInicio;

            let anoInicio = anoFim;
            if (Number.isFinite(mesInicio) && Number.isFinite(mesFim) && mesInicio > mesFim) {
              anoInicio -= 1;
            }

            const diaInicio = parseInt(diaInicioStr, 10);
            const diaFormatado = String(Number.isFinite(diaInicio) ? diaInicio : 1).padStart(2, '0');
            const mesFormatado = String(Number.isFinite(mesInicio) ? mesInicio : 1).padStart(2, '0');

            dataFormatada = `${anoInicio}-${mesFormatado}-${diaFormatado}`;
          }
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(data.trim())) {
          dataFormatada = data.trim();
        } else {
          const tentativa = new Date(data);
          if (!isNaN(tentativa)) {
            dataFormatada = tentativa.toISOString().split('T')[0];
          }
        }
      } else if (data instanceof Date) {
        dataFormatada = data.toISOString().split('T')[0];
      } else {
        dataFormatada = data;
      }
      
      if (!dataFormatada) {
        dataFormatada = new Date().toISOString().split('T')[0];
        console.warn('[useNecessidadesCalculos] ⚠️ dataFormatada vazia, usando fallback para hoje', dataFormatada);
      }

      console.debug('[useNecessidadesCalculos] 📅 dataFormatada', dataFormatada);

      const response = await necessidadesService.calcularMediasPorPeriodo(escolaId, dataFormatada);
      console.debug('[useNecessidadesCalculos] 📥 resposta calcularMediasPorPeriodo', response);
      
      if (response.success) {
        setMediasPeriodo(response.data);
        return response.data; // Retornar os dados para uso externo
      } else {
        console.warn('[useNecessidadesCalculos] ⚠️ resposta sem sucesso para cálculo de médias', {
          escolaId,
          dataFormatada,
          response
        });
      }
    } catch (err) {
      console.error('[useNecessidadesCalculos] ❌ Erro ao calcular médias por período:', err);
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

