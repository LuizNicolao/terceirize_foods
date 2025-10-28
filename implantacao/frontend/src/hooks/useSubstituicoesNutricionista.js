import { useState, useEffect, useCallback } from 'react';
import substituicoesNecessidadesService from '../services/substituicoesNecessidades';

/**
 * Hook para gerenciar substituições do nutricionista
 * Status: 'pendente' (criação e edição)
 */
export const useSubstituicoesNutricionista = () => {
  const [necessidades, setNecessidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    grupo: '',
    semana_abastecimento: '',
    semana_consumo: ''
  });

  // Carregar necessidades para substituição (status CONF)
  const carregarNecessidades = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await substituicoesNecessidadesService.listarParaNutricionista(filtros);
      
      if (response.success) {
        // Filtrar apenas necessidades sem substituições (status pendente)
        const necessidadesPendentes = response.data.filter(nec => 
          !nec.substituicoes_existentes || nec.escolas.every(escola => !escola.substituicao)
        );
        setNecessidades(necessidadesPendentes);
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

  // Iniciar ajustes (criar registros iniciais)
  const iniciarAjustes = useCallback(async () => {
    if (!necessidades.length) {
      throw new Error('Nenhuma necessidade encontrada');
    }

    setLoading(true);
    try {
      const resultados = await Promise.allSettled(
        necessidades.map(async (necessidade) => {
          const dados = {
            produto_origem_id: necessidade.codigo_origem,
            produto_origem_nome: necessidade.produto_origem_nome,
            produto_origem_unidade: necessidade.produto_origem_unidade,
            necessidade_id_grupo: necessidade.necessidade_id_grupo,
            semana_abastecimento: necessidade.semana_abastecimento,
            semana_consumo: necessidade.semana_consumo,
            escola_ids: necessidade.escolas.map(escola => ({
              necessidade_id: escola.necessidade_id,
              escola_id: escola.escola_id,
              escola_nome: escola.escola_nome,
              quantidade_origem: escola.quantidade_origem,
              quantidade_generico: escola.quantidade_origem // Usar quantidade original inicialmente
            }))
          };

          return await substituicoesNecessidadesService.salvarSubstituicao(dados);
        })
      );

      const sucessos = resultados.filter(r => r.status === 'fulfilled').length;
      const erros = resultados.filter(r => r.status === 'rejected').length;

      if (erros > 0) {
        throw new Error(`${sucessos} salvos com sucesso, ${erros} falharam`);
      }

      // Recarregar dados após salvar
      await carregarNecessidades();
      
      return { success: true, message: 'Ajustes iniciados com sucesso!' };
    } catch (error) {
      console.error('Erro ao iniciar ajustes:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [necessidades, carregarNecessidades]);

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

  // Liberar para coordenação (mudar status para 'conf')
  const liberarParaCoordenacao = useCallback(async () => {
    if (!necessidades.length) {
      throw new Error('Nenhuma necessidade encontrada');
    }

    setLoading(true);
    try {
      // Buscar todas as substituições pendentes
      const substituicoesPendentes = [];
      necessidades.forEach(necessidade => {
        necessidade.escolas.forEach(escola => {
          if (escola.substituicao) {
            substituicoesPendentes.push(escola.substituicao.id);
          }
        });
      });

      if (substituicoesPendentes.length === 0) {
        throw new Error('Nenhuma substituição pendente encontrada');
      }

      // Atualizar status para 'conf'
      const response = await substituicoesNecessidadesService.liberarParaCoordenacao(substituicoesPendentes);
      
      if (response.success) {
        await carregarNecessidades();
      }
      
      return response;
    } catch (error) {
      console.error('Erro ao liberar para coordenação:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [necessidades, carregarNecessidades]);

  // Atualizar filtros
  const atualizarFiltros = useCallback((novosFiltros) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
  }, []);

  // Carregar dados apenas quando filtros estiverem preenchidos
  useEffect(() => {
    if (filtros.grupo && filtros.semana_abastecimento) {
      carregarNecessidades();
    } else {
      setNecessidades([]);
    }
  }, [filtros, carregarNecessidades]);

  return {
    // Estado
    necessidades,
    loading,
    error,
    filtros,
    
    // Ações
    carregarNecessidades,
    iniciarAjustes,
    salvarAjusteConsolidado,
    salvarAjusteIndividual,
    liberarParaCoordenacao,
    atualizarFiltros
  };
};
