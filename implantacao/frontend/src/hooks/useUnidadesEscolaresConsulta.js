import { useState, useEffect, useCallback } from 'react';
import FoodsApiService from '../services/FoodsApiService';

/**
 * Hook para consultar unidades escolares do sistema Foods
 * Modo apenas leitura - sem operações CRUD
 */
export const useUnidadesEscolaresConsulta = () => {
  // Estados principais
  const [allUnidadesEscolares, setAllUnidadesEscolares] = useState([]); // Todas as unidades escolares
  const [unidadesEscolares, setUnidadesEscolares] = useState([]); // Unidades escolares da página atual
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados de paginação
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  // Estados de filtros
  const [filters, setFilters] = useState({
    search: '',
    status: 'todos', // todos, ativo, inativo
    cidade: '',
    estado: ''
  });

  // Estados de estatísticas
  const [stats, setStats] = useState({
    total: 0,
    ativos: 0,
    inativos: 0
  });

  // Estados de conexão
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    message: 'Verificando conexão...',
    success: false,
  });

  /**
   * Aplicar paginação no frontend
   */
  const applyFrontendPagination = useCallback((allData, currentPage, itemsPerPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allData.slice(startIndex, endIndex);
  }, []);

  /**
   * Verificar conexão com Foods
   */
  const checkConnection = useCallback(async () => {
    try {
      const result = await FoodsApiService.checkConnection();
      setConnectionStatus(result);
      return result.connected;
    } catch (error) {
      setConnectionStatus({
        success: false,
        connected: false,
        message: 'Erro ao verificar conexão',
        error: error.message
      });
      return false;
    }
  }, []);

  /**
   * Calcular estatísticas localmente
   */
  const calcularEstatisticas = useCallback((unidadesData) => {
    const total = unidadesData.length;
    const ativos = unidadesData.filter(u => u.status === 'ativo' || u.status === 1).length;
    const inativos = unidadesData.filter(u => u.status === 'inativo' || u.status === 0).length;
    
    return { total, ativos, inativos };
  }, []);

  /**
   * Carregar unidades escolares
   */
  const carregarUnidadesEscolares = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Verificar conexão primeiro
      const connected = await checkConnection();
      
      if (!connected) {
        throw new Error('Não foi possível conectar ao sistema Foods');
      }

      // Preparar parâmetros da consulta
      const queryParams = {
        ...filters,
        ...params
      };

      // Remover parâmetros vazios
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === '' || queryParams[key] === 'todos') {
          delete queryParams[key];
        }
      });

      // Buscar todos os dados fazendo múltiplas requisições
      let allUnidadesData = [];
      let page = 1;
      let hasMoreData = true;
      const limit = 100; // Limite máximo permitido pelo Foods

      while (hasMoreData) {
        const result = await FoodsApiService.getUnidadesEscolares({
          ...queryParams,
          page,
          limit
        });

        if (result.success && result.data.length > 0) {
          allUnidadesData = [...allUnidadesData, ...result.data];
          
          // Se retornou menos que o limite, não há mais dados
          if (result.data.length < limit) {
            hasMoreData = false;
          } else {
            page++;
          }
        } else {
          hasMoreData = false;
        }

        // Limite de segurança para evitar loop infinito
        if (page > 50) {
          hasMoreData = false;
        }
      }

      // Simular resultado como se fosse uma única requisição
      const result = {
        success: true,
        data: allUnidadesData,
        pagination: null
      };

      if (result.success) {
        // Garantir que result.data seja sempre um array
        const unidadesData = Array.isArray(result.data) ? result.data : [];
        
        // Sempre aplicar paginação no frontend (como no fornecedores)
        setAllUnidadesEscolares(unidadesData);
        
        const totalItems = unidadesData.length;
        const totalPages = Math.ceil(totalItems / pagination.itemsPerPage) || 1;
        const currentPage = Math.min(pagination.currentPage, totalPages);
        
        // Aplicar paginação
        const paginatedData = applyFrontendPagination(unidadesData, currentPage, pagination.itemsPerPage);
        
        setUnidadesEscolares(paginatedData);
        setPagination(prev => ({
          ...prev,
          totalItems,
          totalPages,
          currentPage
        }));

        // Calcular estatísticas com todos os dados carregados (não apenas da página atual)
        const estatisticas = calcularEstatisticas(unidadesData);
        setStats(estatisticas);
      } else {
        setError(result.message);
        setUnidadesEscolares([]);
      }
    } catch (err) {
      setError(err.message);
      setUnidadesEscolares([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, filters, checkConnection, applyFrontendPagination, calcularEstatisticas]);

  /**
   * Carregar estatísticas
   */
  const carregarEstatisticas = useCallback(async () => {
    // Se temos dados locais, calcular estatísticas localmente
    if (allUnidadesEscolares.length > 0) {
      const estatisticas = calcularEstatisticas(allUnidadesEscolares);
      setStats(estatisticas);
      return;
    }

    // Senão, tentar buscar do backend
    try {
      const result = await FoodsApiService.getUnidadesEscolaresStats();
      
      if (result.success) {
        setStats(result.data || { total: 0, ativos: 0, inativos: 0 });
      }
    } catch (err) {
      // Não definir erro aqui pois não é crítico
    }
  }, [allUnidadesEscolares, calcularEstatisticas]);

  /**
   * Buscar unidade escolar por ID
   */
  const buscarUnidadeEscolarPorId = useCallback(async (id) => {
    try {
      const result = await FoodsApiService.getUnidadeEscolarById(id);
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('Erro ao buscar unidade escolar:', err);
      throw err;
    }
  }, []);

  /**
   * Atualizar filtros
   */
  const atualizarFiltros = useCallback((novosFiltros) => {
    setFilters(prev => ({ ...prev, ...novosFiltros }));
    setPagination(prev => {
      const updatedPagination = { ...prev, currentPage: 1 }; // Reset para primeira página
      
      // Aplicar paginação no frontend com os novos filtros
      const paginatedData = applyFrontendPagination(allUnidadesEscolares, updatedPagination.currentPage, updatedPagination.itemsPerPage);
      setUnidadesEscolares(paginatedData);
      
      return updatedPagination;
    });
  }, [allUnidadesEscolares, applyFrontendPagination]);

  /**
   * Atualizar paginação
   */
  const atualizarPaginacao = useCallback((novaPaginacao) => {
    setPagination(prev => {
      const updatedPagination = { ...prev, ...novaPaginacao };
      
      // Se mudou a página ou itens por página, aplicar paginação no frontend
      if (novaPaginacao.currentPage || novaPaginacao.itemsPerPage) {
        const paginatedData = applyFrontendPagination(allUnidadesEscolares, updatedPagination.currentPage, updatedPagination.itemsPerPage);
        setUnidadesEscolares(paginatedData);
      }
      
      return updatedPagination;
    });
  }, [allUnidadesEscolares, applyFrontendPagination]);

  /**
   * Recarregar dados
   */
  const recarregar = useCallback(() => {
    setFilters({ search: '', status: 'todos', cidade: '', estado: '' });
    setPagination({ currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 20 });
    setAllUnidadesEscolares([]);
    setUnidadesEscolares([]);
    setLoading(true);
    setError(null);
    checkConnection();
    carregarUnidadesEscolares();
    carregarEstatisticas();
  }, [checkConnection, carregarUnidadesEscolares, carregarEstatisticas]);

  // Efeitos
  useEffect(() => {
    carregarUnidadesEscolares();
  }, [carregarUnidadesEscolares]);

  useEffect(() => {
    carregarEstatisticas();
  }, [carregarEstatisticas]);

  // Retornar interface do hook
  return {
    // Dados
    unidadesEscolares,
    stats,
    connectionStatus,
    
    // Estados
    loading,
    error,
    pagination,
    filters,
    
    // Funções
    carregarUnidadesEscolares,
    buscarUnidadeEscolarPorId,
    atualizarFiltros,
    atualizarPaginacao,
    recarregar,
    
    // Estados calculados
    isConnected: connectionStatus.connected,
    hasError: error !== null || !connectionStatus.connected,
    isEmpty: !loading && unidadesEscolares.length === 0 && !(error !== null || !connectionStatus.connected)
  };
};
