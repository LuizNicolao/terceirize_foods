import { useState, useEffect, useCallback } from 'react';
import FoodsApiService from '../services/FoodsApiService';

/**
 * Hook para consulta de Unidades de Medida
 * Busca dados do sistema Foods em modo apenas leitura
 */
const useUnidadesMedidaConsulta = () => {
  // Estados principais
  const [unidadesMedida, setUnidadesMedida] = useState([]);
  const [allUnidadesData, setAllUnidadesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});

  // Estados de paginação
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  // Estados de filtros
  const [filters, setFilters] = useState({
    search: ''
  });

  // Estados de conexão
  const [isConnected, setIsConnected] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState(null);

  /**
   * Aplicar paginação no frontend
   */
  const applyFrontendPagination = useCallback((data, currentPage, itemsPerPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = data.slice(startIndex, endIndex);
    
    return {
      data: paginatedData,
      totalPages: Math.ceil(data.length / itemsPerPage),
      totalItems: data.length
    };
  }, []);

  /**
   * Verificar conexão com sistema Foods
   */
  const checkConnection = useCallback(async () => {
    try {
      const result = await FoodsApiService.getUnidadesMedida({ limit: 1 });
      setIsConnected(result.success);
      setConnectionStatus(result);
      return result.success;
    } catch (error) {
      setIsConnected(false);
      setConnectionStatus({ success: false, message: 'Erro de conexão com sistema Foods' });
      return false;
    }
  }, []);

  /**
   * Carregar unidades de medida
   */
  const carregarUnidadesMedida = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Verificar conexão primeiro
      const connected = await checkConnection();
      if (!connected) {
        setError('Não foi possível conectar ao sistema Foods');
        setUnidadesMedida([]);
        return;
      }

      // Buscar todas as unidades de medida (múltiplas requisições se necessário)
      let allData = [];
      let page = 1;
      let hasMore = true;
      const maxPages = 50; // Limite de segurança

      while (hasMore && page <= maxPages) {
        const result = await FoodsApiService.getUnidadesMedida({
          page,
          limit: 100 // Limite máximo por requisição
        });

        if (result.success && result.data && result.data.length > 0) {
          allData = [...allData, ...result.data];
          
          // Verificar se há mais páginas
          if (result.pagination && result.pagination.currentPage < result.pagination.totalPages) {
            page++;
          } else {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      }

      setAllUnidadesData(allData);

      // Aplicar paginação no frontend
      const paginatedResult = applyFrontendPagination(
        allData,
        pagination.currentPage,
        pagination.itemsPerPage
      );

      setUnidadesMedida(paginatedResult.data);
      setPagination(prev => ({
        ...prev,
        totalPages: paginatedResult.totalPages,
        totalItems: paginatedResult.totalItems
      }));

      // Carregar estatísticas
      await calcularEstatisticas(allData);

    } catch (error) {
      console.error('Erro ao carregar unidades de medida:', error);
      setError('Erro ao carregar unidades de medida do sistema Foods');
      setUnidadesMedida([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, checkConnection, applyFrontendPagination]);

  /**
   * Calcular estatísticas
   */
  const calcularEstatisticas = useCallback(async (data = allUnidadesData) => {
    try {
      const stats = {
        total: data.length,
        ativos: data.filter(item => item.status === 1 || item.ativo === 1).length,
        inativos: data.filter(item => item.status === 0 || item.ativo === 0).length,
        ultima_consulta: new Date().toLocaleString('pt-BR')
      };
      setStats(stats);
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
    }
  }, [allUnidadesData]);

  /**
   * Atualizar filtros
   */
  const atualizarFiltros = useCallback((novosFiltros) => {
    setFilters(prev => ({ ...prev, ...novosFiltros }));
    
    // Aplicar filtros nos dados
    let dadosFiltrados = [...allUnidadesData];

    // Filtro de busca
    if (novosFiltros.search || filters.search) {
      const searchTerm = (novosFiltros.search || filters.search).toLowerCase();
      dadosFiltrados = dadosFiltrados.filter(item =>
        item.nome?.toLowerCase().includes(searchTerm) ||
        item.sigla?.toLowerCase().includes(searchTerm) ||
        item.descricao?.toLowerCase().includes(searchTerm)
      );
    }

    // Aplicar paginação
    const paginatedResult = applyFrontendPagination(
      dadosFiltrados,
      1, // Reset para primeira página
      pagination.itemsPerPage
    );

    setUnidadesMedida(paginatedResult.data);
    setPagination(prev => ({
      ...prev,
      currentPage: 1,
      totalPages: paginatedResult.totalPages,
      totalItems: paginatedResult.totalItems
    }));
  }, [allUnidadesData, filters.search, pagination.itemsPerPage, applyFrontendPagination]);

  /**
   * Atualizar paginação
   */
  const atualizarPaginacao = useCallback((novaPaginacao) => {
    setPagination(prev => ({ ...prev, ...novaPaginacao }));
    
    // Aplicar nova paginação nos dados filtrados
    let dadosFiltrados = [...allUnidadesData];

    // Aplicar filtros atuais
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      dadosFiltrados = dadosFiltrados.filter(item =>
        item.nome?.toLowerCase().includes(searchTerm) ||
        item.sigla?.toLowerCase().includes(searchTerm) ||
        item.descricao?.toLowerCase().includes(searchTerm)
      );
    }

    const paginatedResult = applyFrontendPagination(
      dadosFiltrados,
      novaPaginacao.currentPage || pagination.currentPage,
      novaPaginacao.itemsPerPage || pagination.itemsPerPage
    );

    setUnidadesMedida(paginatedResult.data);
    setPagination(prev => ({
      ...prev,
      ...novaPaginacao,
      totalPages: paginatedResult.totalPages,
      totalItems: paginatedResult.totalItems
    }));
  }, [allUnidadesData, filters.search, pagination.currentPage, pagination.itemsPerPage, applyFrontendPagination]);

  /**
   * Limpar filtros
   */
  const limparFiltros = useCallback(() => {
    setFilters({ search: '' });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    
    // Aplicar paginação sem filtros
    const paginatedResult = applyFrontendPagination(
      allUnidadesData,
      1,
      pagination.itemsPerPage
    );

    setUnidadesMedida(paginatedResult.data);
    setPagination(prev => ({
      ...prev,
      totalPages: paginatedResult.totalPages,
      totalItems: paginatedResult.totalItems
    }));
  }, [allUnidadesData, pagination.itemsPerPage, applyFrontendPagination]);

  /**
   * Recarregar dados
   */
  const recarregar = useCallback(() => {
    carregarUnidadesMedida();
  }, [carregarUnidadesMedida]);

  // Carregar dados na montagem do componente
  useEffect(() => {
    carregarUnidadesMedida();
  }, [carregarUnidadesMedida]);

  return {
    // Dados
    unidadesMedida,
    loading,
    error,
    stats,
    pagination,
    filters,
    
    // Ações
    carregarUnidadesMedida,
    atualizarFiltros,
    atualizarPaginacao,
    limparFiltros,
    recarregar,
    
    // Estados de conexão
    isConnected,
    connectionStatus,
    hasError: !!error,
    isEmpty: !loading && unidadesMedida.length === 0
  };
};

export default useUnidadesMedidaConsulta;
