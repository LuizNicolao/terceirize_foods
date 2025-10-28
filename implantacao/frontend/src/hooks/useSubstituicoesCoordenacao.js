import { useState, useEffect, useCallback } from 'react';
import substituicoesNecessidadesService from '../services/substituicoesNecessidades';

/**
 * Hook para gerenciar substituições da coordenação
 * Status: 'conf' (aprovação e edição final)
 */
export const useSubstituicoesCoordenacao = () => {
  const [necessidades, setNecessidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    grupo: '',
    semana_abastecimento: '',
    semana_consumo: ''
  });

  // Carregar necessidades para coordenação (status CONF)
  const carregarNecessidades = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await substituicoesNecessidadesService.listarParaCoordenacao(filtros);
      
      if (response.success) {
        // Filtrar apenas necessidades com substituições (status conf)
        const necessidadesCoordenacao = response.data.filter(nec => 
          nec.substituicoes_existentes && nec.escolas.some(escola => escola.substituicao)
        );
        setNecessidades(necessidadesCoordenacao);
      } else {
        setError(response.message || 'Erro ao carregar necessidades');
      }
    } catch (err) {
      console.error('Erro ao carregar necessidades:', err);
      setError('Erro ao carregar necessidades');
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  // Salvar ajuste consolidado
  const salvarAjusteConsolidado = useCallback(async (dados) => {
    try {
      const response = await substituicoesNecessidadesService.salvarSubstituicao(dados);
      
      if (response.success) {
        await carregarNecessidades();
      }
      
      return response;
    } catch (error) {
      console.error('Erro ao salvar ajuste consolidado:', error);
      throw error;
    }
  }, [carregarNecessidades]);

  // Salvar ajuste individual
  const salvarAjusteIndividual = useCallback(async (dados) => {
    try {
      const response = await substituicoesNecessidadesService.salvarSubstituicao(dados);
      
      if (response.success) {
        await carregarNecessidades();
      }
      
      return response;
    } catch (error) {
      console.error('Erro ao salvar ajuste individual:', error);
      throw error;
    }
  }, [carregarNecessidades]);

  // Aprovar substituição
  const aprovarSubstituicao = useCallback(async (substituicaoId) => {
    try {
      const response = await substituicoesNecessidadesService.aprovarSubstituicao(substituicaoId);
      
      if (response.success) {
        await carregarNecessidades();
      }
      
      return response;
    } catch (error) {
      console.error('Erro ao aprovar substituição:', error);
      throw error;
    }
  }, [carregarNecessidades]);

  // Aprovar todas as substituições
  const aprovarTodas = useCallback(async () => {
    if (!necessidades.length) {
      throw new Error('Nenhuma necessidade encontrada');
    }

    setLoading(true);
    try {
      // Buscar todas as substituições conf
      const substituicoesConf = [];
      necessidades.forEach(necessidade => {
        necessidade.escolas.forEach(escola => {
          if (escola.substituicao) {
            substituicoesConf.push(escola.substituicao.id);
          }
        });
      });

      if (substituicoesConf.length === 0) {
        throw new Error('Nenhuma substituição encontrada');
      }

      // Aprovar todas
      const resultados = await Promise.allSettled(
        substituicoesConf.map(id => substituicoesNecessidadesService.aprovarSubstituicao(id))
      );

      const sucessos = resultados.filter(r => r.status === 'fulfilled').length;
      const erros = resultados.filter(r => r.status === 'rejected').length;

      if (erros > 0) {
        throw new Error(`${sucessos} aprovadas com sucesso, ${erros} falharam`);
      }

      await carregarNecessidades();
      
      return { success: true, message: 'Todas as substituições foram aprovadas!' };
    } catch (error) {
      console.error('Erro ao aprovar todas:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [necessidades, carregarNecessidades]);

  // Rejeitar substituição
  const rejeitarSubstituicao = useCallback(async (substituicaoId) => {
    try {
      const response = await substituicoesNecessidadesService.rejeitarSubstituicao(substituicaoId);
      
      if (response.success) {
        await carregarNecessidades();
      }
      
      return response;
    } catch (error) {
      console.error('Erro ao rejeitar substituição:', error);
      throw error;
    }
  }, [carregarNecessidades]);

  // Atualizar filtros
  const atualizarFiltros = useCallback((novosFiltros) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    carregarNecessidades();
  }, [carregarNecessidades]);

  return {
    // Estado
    necessidades,
    loading,
    error,
    filtros,
    
    // Ações
    carregarNecessidades,
    salvarAjusteConsolidado,
    salvarAjusteIndividual,
    aprovarSubstituicao,
    aprovarTodas,
    rejeitarSubstituicao,
    atualizarFiltros
  };
};
