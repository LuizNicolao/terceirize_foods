import { useState, useEffect, useCallback } from 'react';
import FoodsApiService from '../services/FoodsApiService';

export const useFiliaisConsulta = () => {
  // Estados principais
  const [filiais, setFiliais] = useState([]);
  const [allFiliais, setAllFiliais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);

  // Estados de paginação (frontend)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Estados de filtros
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });

  // Estados de estatísticas
  const [stats, setStats] = useState({
    total: 0,
    ativos: 0,
    inativos: 0
  });

  // Utilitários
  const isConnected = connectionStatus?.success || false;
  const hasError = !!error;
  const isEmpty = filiais.length === 0;

  /**
   * Verificar conexão com o sistema Foods
   */
  const checkConnection = useCallback(async () => {
    try {
      const result = await FoodsApiService.checkConnection();
      setConnectionStatus(result);
      return result.success;
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: 'Erro ao verificar conexão',
        error: error.message
      });
      return false;
    }
  }, []);

  /**
   * Aplicar paginação no frontend
   */
  const applyFrontendPagination = useCallback((data, page, itemsPerPage) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, []);

  /**
   * Calcular estatísticas baseadas em todos os dados
   */
  const calcularEstatisticas = useCallback((data) => {
    return {
      total: data.length,
      ativos: data.filter(item => 
        item.status === 'ativo' || item.status === 'Ativa' || item.status === 1
      ).length,
      inativos: data.filter(item => 
        item.status === 'inativo' || item.status === 'Inativa' || item.status === 0
      ).length
    };
  }, []);

  /**
   * Carregar filiais do sistema Foods
   */
  const carregarFiliais = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

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

      // Buscar todas as filiais (múltiplas requisições se necessário)
      let allFiliaisData = [];
      let page = 1;
      const limit = 100; // Limite por requisição
      let hasMore = true;

      while (hasMore && page <= 50) { // Limite de segurança
        const result = await FoodsApiService.getFiliais({
          ...queryParams,
          page,
          limit
        });

        if (result.success && result.data) {
          // Verificar se é uma resposta HATEOAS ou direta
          let items = [];
          if (result.data.items) {
            items = result.data.items;
          } else if (Array.isArray(result.data)) {
            items = result.data;
          } else if (result.data.data) {
            items = result.data.data;
          }

          allFiliaisData = [...allFiliaisData, ...items];

          // Verificar se há mais páginas
          if (items.length < limit) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }
      }

      // Aplicar paginação no frontend
      const paginatedData = applyFrontendPagination(
        allFiliaisData,
        pagination.currentPage,
        pagination.itemsPerPage
      );

      // Calcular estatísticas baseadas em todos os dados
      const estatisticas = calcularEstatisticas(allFiliaisData);

      setAllFiliais(allFiliaisData);
      setFiliais(paginatedData);
      setStats(estatisticas);
      setPagination(prev => ({
        ...prev,
        totalItems: allFiliaisData.length,
        totalPages: Math.ceil(allFiliaisData.length / prev.itemsPerPage)
      }));

    } catch (error) {
      setError(error.message);
      setFiliais([]);
      setAllFiliais([]);
      setStats({ total: 0, ativos: 0, inativos: 0 });
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage, pagination.itemsPerPage, checkConnection, applyFrontendPagination, calcularEstatisticas]);

  /**
   * Carregar estatísticas
   */
  const carregarEstatisticas = useCallback(async () => {
    try {
      const result = await FoodsApiService.getFiliaisStats();
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (error) {
      // Se falhar, usar estatísticas calculadas localmente
      const estatisticas = calcularEstatisticas(allFiliais);
      setStats(estatisticas);
    }
  }, [allFiliais, calcularEstatisticas]);

  /**
   * Buscar filial por ID
   */
  const buscarFilialPorId = useCallback(async (id) => {
    try {
      const result = await FoodsApiService.getFilialById(id);
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.message || 'Filial não encontrada');
    } catch (error) {
      throw new Error(error.message || 'Erro ao buscar filial');
    }
  }, []);

  /**
   * Atualizar filtros
   */
  const atualizarFiltros = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset para primeira página
  }, []);

  /**
   * Atualizar paginação
   */
  const atualizarPaginacao = useCallback((newPagination) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  /**
   * Recarregar dados
   */
  const recarregar = useCallback(() => {
    carregarFiliais();
    carregarEstatisticas();
  }, [carregarFiliais, carregarEstatisticas]);

  // Carregar dados iniciais
  useEffect(() => {
    carregarFiliais();
  }, [carregarFiliais]);

  useEffect(() => {
    carregarEstatisticas();
  }, [carregarEstatisticas]);

  return {
    // Dados
    filiais,
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
    carregarFiliais,
    buscarFilialPorId,
    atualizarFiltros,
    atualizarPaginacao,
    recarregar,
    
    // Utilitários
    isConnected,
    hasError,
    isEmpty
  };
};
