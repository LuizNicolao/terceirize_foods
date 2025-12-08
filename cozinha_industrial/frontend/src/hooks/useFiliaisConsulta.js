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

  // Estados de ordenação
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Estados de estatísticas
  const [stats, setStats] = useState({
    total_filiais: 0,
    filiais_ativas: 0,
    filiais_inativas: 0,
    com_cnpj: 0
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
   * Aplicar ordenação nos dados
   */
  const applySorting = useCallback((data, field, direction) => {
    if (!field) return data;

    const sortedData = [...data].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];

      // Tratar valores nulos/undefined
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';

      // Converter para string se necessário para comparação
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (direction === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return sortedData;
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
      total_filiais: data.length,
      filiais_ativas: data.filter(item => 
        item.status === 'ativo' || item.status === 'Ativa' || item.status === 1
      ).length,
      filiais_inativas: data.filter(item => 
        item.status === 'inativo' || item.status === 'Inativa' || item.status === 0
      ).length,
      com_cnpj: data.filter(item => item.cnpj && item.cnpj.trim() !== '').length
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

      // Filtrar apenas a filial "CD TOLEDO"
      // O campo que contém o nome da filial é 'filial'
      allFiliaisData = allFiliaisData.filter(filial => {
        if (filial.filial) {
          const filialNome = filial.filial.toLowerCase().trim();
          // Verificar se contém "cd toledo" ou apenas "toledo" (caso o nome seja apenas "TOLEDO")
          return filialNome.includes('cd toledo') || 
                 filialNome === 'toledo' ||
                 filialNome.includes('toledo');
        }
        // Se não tiver informação de filial, não incluir
        return false;
      });

      // Aplicar ordenação
      const sortedData = applySorting(allFiliaisData, sortField, sortDirection);

      // Aplicar paginação no frontend
      const paginatedData = applyFrontendPagination(
        sortedData,
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
      setStats({ total_filiais: 0, filiais_ativas: 0, filiais_inativas: 0, com_cnpj: 0 });
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage, pagination.itemsPerPage, sortField, sortDirection, checkConnection, applyFrontendPagination, applySorting, calcularEstatisticas]);

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
    setPagination(prev => {
      const updatedPagination = { ...prev, currentPage: 1 }; // Reset para primeira página
      
      // Aplicar ordenação e paginação no frontend com os novos filtros
      const sortedData = applySorting(allFiliais, sortField, sortDirection);
      const paginatedData = applyFrontendPagination(sortedData, updatedPagination.currentPage, updatedPagination.itemsPerPage);
      setFiliais(paginatedData);
      
      return updatedPagination;
    });
  }, [allFiliais, sortField, sortDirection, applyFrontendPagination, applySorting]);

  /**
   * Atualizar paginação
   */
  const atualizarPaginacao = useCallback((newPagination) => {
    setPagination(prev => {
      const updatedPagination = { ...prev, ...newPagination };
      
      // Se mudou a página ou itens por página, aplicar ordenação e paginação no frontend
      if (newPagination.currentPage || newPagination.itemsPerPage) {
        const sortedData = applySorting(allFiliais, sortField, sortDirection);
        const paginatedData = applyFrontendPagination(sortedData, updatedPagination.currentPage, updatedPagination.itemsPerPage);
        setFiliais(paginatedData);
      }
      
      return updatedPagination;
    });
  }, [allFiliais, sortField, sortDirection, applyFrontendPagination, applySorting]);

  /**
   * Handler para ordenação
   */
  const handleSort = useCallback((field) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    
    // Reaplicar ordenação e paginação nos dados atuais
    const sortedData = applySorting(allFiliais, field, newDirection);
    setAllFiliais(sortedData);
    
    const paginatedData = applyFrontendPagination(sortedData, pagination.currentPage, pagination.itemsPerPage);
    setFiliais(paginatedData);
    
    // Reset para primeira página ao ordenar
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [allFiliais, sortField, sortDirection, pagination.currentPage, pagination.itemsPerPage, applySorting, applyFrontendPagination]);

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
    
    // Ordenação
    sortField,
    sortDirection,
    
    // Ações
    carregarFiliais,
    buscarFilialPorId,
    atualizarFiltros,
    atualizarPaginacao,
    recarregar,
    handleSort,
    
    // Utilitários
    isConnected,
    hasError,
    isEmpty
  };
};
