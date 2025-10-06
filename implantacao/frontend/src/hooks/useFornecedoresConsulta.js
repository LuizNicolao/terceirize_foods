import { useState, useEffect, useCallback } from 'react';
import FoodsApiService from '../services/FoodsApiService';

/**
 * Hook para consultar fornecedores do sistema Foods
 * Modo apenas leitura - sem operações CRUD
 */
export const useFornecedoresConsulta = () => {
  // Estados principais
  const [allFornecedores, setAllFornecedores] = useState([]); // Todos os fornecedores
  const [fornecedores, setFornecedores] = useState([]); // Fornecedores da página atual
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);

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
    tipo: ''
  });

  // Estados de estatísticas
  const [stats, setStats] = useState({
    total: 0,
    ativos: 0,
    inativos: 0
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
   * Carregar fornecedores
   */
  const carregarFornecedores = useCallback(async (params = {}) => {
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
      let allFornecedoresData = [];
      let page = 1;
      let hasMoreData = true;
      const limit = 100; // Limite máximo permitido pelo Foods

      while (hasMoreData) {
        const result = await FoodsApiService.getFornecedores({
          ...queryParams,
          page,
          limit
        });

        if (result.success && result.data.length > 0) {
          allFornecedoresData = [...allFornecedoresData, ...result.data];
          
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
        data: allFornecedoresData,
        pagination: null
      };

      if (result.success) {
        // Garantir que result.data seja sempre um array
        const fornecedoresData = Array.isArray(result.data) ? result.data : [];
        
        // Atualizar paginação se disponível
        if (result.pagination) {
          // Usar paginação do backend
          setAllFornecedores(fornecedoresData);
          setFornecedores(fornecedoresData);
          setPagination(prev => ({
            ...prev,
            currentPage: result.pagination.currentPage || prev.currentPage,
            totalPages: result.pagination.totalPages || prev.totalPages,
            totalItems: result.pagination.totalItems || fornecedoresData.length || 0
          }));

          // Calcular estatísticas com todos os dados carregados
          const estatisticas = calcularEstatisticas(fornecedoresData);
          setStats(estatisticas);
        } else {
          // Aplicar paginação no frontend
          setAllFornecedores(fornecedoresData);
          
          const totalItems = fornecedoresData.length;
          const totalPages = Math.ceil(totalItems / pagination.itemsPerPage) || 1;
          const currentPage = Math.min(pagination.currentPage, totalPages);
          
          
          // Aplicar paginação
          const paginatedData = applyFrontendPagination(fornecedoresData, currentPage, pagination.itemsPerPage);
          
          setFornecedores(paginatedData);
          setPagination(prev => ({
            ...prev,
            totalItems,
            totalPages,
            currentPage
          }));

          // Calcular estatísticas com todos os dados carregados (não apenas da página atual)
          const estatisticas = calcularEstatisticas(fornecedoresData);
          setStats(estatisticas);
        }
      } else {
        console.error('❌ Erro ao carregar fornecedores:', result.message);
        setError(result.message);
        setFornecedores([]);
      }
    } catch (err) {
      setError(err.message);
      setFornecedores([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, filters, checkConnection]);

  /**
   * Calcular estatísticas localmente
   */
  const calcularEstatisticas = useCallback((fornecedoresData) => {
    const total = fornecedoresData.length;
    const ativos = fornecedoresData.filter(f => f.status === 1).length;
    const inativos = fornecedoresData.filter(f => f.status === 0).length;
    
    return { total, ativos, inativos };
  }, []);

  /**
   * Carregar estatísticas
   */
  const carregarEstatisticas = useCallback(async () => {
    // Se temos dados locais, calcular estatísticas localmente
    if (allFornecedores.length > 0) {
      const estatisticas = calcularEstatisticas(allFornecedores);
      setStats(estatisticas);
      return;
    }

    // Senão, tentar buscar do backend
    try {
      const result = await FoodsApiService.getFornecedoresStats();
      
      if (result.success) {
        setStats(result.data || { total: 0, ativos: 0, inativos: 0 });
      }
    } catch (err) {
      // Não definir erro aqui pois não é crítico
    }
  }, [allFornecedores, calcularEstatisticas]);

  /**
   * Buscar fornecedor por ID
   */
  const buscarFornecedorPorId = useCallback(async (id) => {
    try {
      const result = await FoodsApiService.getFornecedorById(id);
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('Erro ao buscar fornecedor:', err);
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
      const paginatedData = applyFrontendPagination(allFornecedores, updatedPagination.currentPage, updatedPagination.itemsPerPage);
      setFornecedores(paginatedData);
      
      return updatedPagination;
    });
  }, [allFornecedores, applyFrontendPagination]);

  /**
   * Atualizar paginação
   */
  const atualizarPaginacao = useCallback((novaPaginacao) => {
    setPagination(prev => {
      const updatedPagination = { ...prev, ...novaPaginacao };
      
      // Se mudou a página ou itens por página, aplicar paginação no frontend
      if (novaPaginacao.currentPage || novaPaginacao.itemsPerPage) {
        const paginatedData = applyFrontendPagination(allFornecedores, updatedPagination.currentPage, updatedPagination.itemsPerPage);
        setFornecedores(paginatedData);
      }
      
      return updatedPagination;
    });
  }, [allFornecedores, applyFrontendPagination]);

  /**
   * Recarregar dados
   */
  const recarregar = useCallback(() => {
    setFilters({ search: '', status: 'todos', tipo: '' });
    setPagination({ currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 20 });
    setAllFornecedores([]);
    setFornecedores([]);
    setLoading(true);
    setError(null);
    checkConnection();
    carregarFornecedores();
    carregarEstatisticas();
  }, [checkConnection, carregarFornecedores, carregarEstatisticas]);

  // Efeitos
  useEffect(() => {
    carregarFornecedores();
  }, [carregarFornecedores]);

  useEffect(() => {
    carregarEstatisticas();
  }, [carregarEstatisticas]);

  // Retornar interface do hook
  return {
    // Dados
    fornecedores,
    stats,
    connectionStatus,
    
    // Estados
    loading,
    error,
    
    // Paginação
    pagination,
    
    // Filtros
    filters,
    
    // Ações
    carregarFornecedores,
    buscarFornecedorPorId,
    atualizarFiltros,
    atualizarPaginacao,
    recarregar,
    checkConnection,
    
    // Utilitários
    isConnected: connectionStatus?.connected || false,
    hasError: !!error,
    isEmpty: !loading && fornecedores.length === 0
  };
};
