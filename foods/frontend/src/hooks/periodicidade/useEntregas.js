import { useState, useEffect, useCallback } from 'react';
import EntregasService from '../../services/entregas';
import FeriadosService from '../../services/feriadosService';

/**
 * Hook para gerenciar entregas do banco de dados
 */
export const useEntregas = (agrupamentoId, mes, ano) => {
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carregar entregas do banco
  const carregarEntregas = useCallback(async () => {
    if (!agrupamentoId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await EntregasService.listarEntregas(agrupamentoId, mes, ano);
      
      if (response.success) {
        // Converter dados do banco para formato do frontend
        const entregasFormatadas = await Promise.all(
          response.data.map(async (entrega) => {
            // DEBUG: Log da data que vem do banco
            console.log('🔍 [DEBUG] useEntregas - Data do banco:', entrega.data_entrega);
            console.log('🔍 [DEBUG] useEntregas - Tipo da data:', typeof entrega.data_entrega);
            
            // Converter data_entrega (string) para Date object - CORRIGINDO TIMEZONE
            // Usar parsing manual para evitar problemas de timezone
            const [year, month, day] = entrega.data_entrega.split('-');
            const dataEntrega = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            
            // DEBUG: Log da data convertida
            console.log('🔍 [DEBUG] useEntregas - Data convertida:', dataEntrega);
            console.log('🔍 [DEBUG] useEntregas - Data convertida (ISO):', dataEntrega.toISOString());
            console.log('🔍 [DEBUG] useEntregas - Data convertida (local):', dataEntrega.toLocaleDateString());
            
            const entregaFormatada = {
              id: entrega.id,
              date: dataEntrega,
              type: entrega.tipo_entrega,
              status: entrega.status || 'scheduled',
              observacoes: entrega.observacoes,
              agrupamento_id: entrega.agrupamento_id,
              agrupamento_nome: entrega.agrupamento_nome,
              criado_em: entrega.criado_em,
              atualizado_em: entrega.atualizado_em,
              schools: 0, // Será preenchido com dados do agrupamento
              products: 0, // Será preenchido com dados do agrupamento
              conflicts: []
            };

            // Verificar se é feriado
            const feriado = await FeriadosService.isFeriado(entregaFormatada.date);
            if (feriado) {
              entregaFormatada.status = 'conflict';
              entregaFormatada.feriado = feriado;
              entregaFormatada.dataAlternativa = getDataAlternativa(entregaFormatada.date);
              entregaFormatada.conflicts = [{
                date: entregaFormatada.date,
                deliveries: [entregaFormatada],
                type: 'holiday',
                message: `⚠️ Feriado: ${feriado.name} - Verificar se entrega será realizada`,
                feriado: feriado,
                dataAlternativa: entregaFormatada.dataAlternativa
              }];
            }

            return entregaFormatada;
          })
        );

        setEntregas(entregasFormatadas);
      }
    } catch (err) {
      console.error('❌ Erro ao carregar entregas:', err);
      setError('Erro ao carregar entregas do banco de dados');
    } finally {
      setLoading(false);
    }
  }, [agrupamentoId, mes, ano]);

  // Função auxiliar para calcular data alternativa
  const getDataAlternativa = (date) => {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay;
  };

  // Carregar entregas quando o hook for montado ou dependências mudarem
  useEffect(() => {
    carregarEntregas();
  }, [carregarEntregas]);

  return {
    entregas,
    setEntregas,
    loading,
    error,
    carregarEntregas
  };
};
