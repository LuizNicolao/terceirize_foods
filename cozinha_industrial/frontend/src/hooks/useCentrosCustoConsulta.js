import { useState, useEffect, useCallback } from 'react';
import FoodsApiService from '../services/FoodsApiService';

/**
 * Hook para consultar centros de custo do sistema Foods
 * Modo apenas leitura - sem operações CRUD
 */
export const useCentrosCustoConsulta = () => {
  // Estados principais
  const [allCentrosCustoData, setAllCentrosCustoData] = useState([]); // Todos os centros de custo
  const [centrosCusto, setCentrosCusto] = useState([]); // Centros de custo da página atual
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
    status: 'todos' // todos, ativo, inativo
  });

  // Estados de ordenação
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Estados de estatísticas
  const [stats, setStats] = useState({
    total: 0,
    ativos: 0,
    inativos: 0,
    filiais_vinculadas: 0
  });

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
  const applyFrontendPagination = useCallback((allData, currentPage, itemsPerPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allData.slice(startIndex, endIndex);
  }, []);

  /**
   * Calcular estatísticas dos centros de custo
   */
  const calcularEstatisticas = useCallback((centrosCustoData) => {
    const total = centrosCustoData.length;
    const ativos = centrosCustoData.filter(cc => cc.status === 1 || cc.status === 'ativo').length;
    const inativos = total - ativos;
    
    // Contar filiais únicas vinculadas
    const filiaisUnicas = new Set(centrosCustoData.map(cc => cc.filial_id).filter(id => id != null));
    const filiaisVinculadas = filiaisUnicas.size;

    const newStats = {
      total,
      ativos,
      inativos,
      filiais_vinculadas: filiaisVinculadas
    };
    
    setStats(newStats);
    return newStats;
  }, []);

  /**
   * Verificar conexão com o sistema Foods
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
   * Carregar todos os centros de custo
   */
  const carregarCentrosCusto = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Verificar conexão primeiro
      const connected = await checkConnection();
      if (!connected) {
        setError('Não foi possível conectar ao sistema Foods');
        setLoading(false);
        return;
      }

      // Buscar todos os dados fazendo múltiplas requisições
      let allCentrosCusto = [];
      let currentPage = 1;
      let hasMorePages = true;
      const maxPages = 50; // Limite de segurança

      while (hasMorePages && currentPage <= maxPages) {
        const result = await FoodsApiService.getCentrosCusto({
          page: currentPage,
          limit: 100 // Limite do backend
        });

        // EXATAMENTE igual ao useAlmoxarifadosConsulta
        if (result.success && result.data && result.data.length > 0) {
          allCentrosCusto = [...allCentrosCusto, ...result.data];
          hasMorePages = result.data.length === 100;
          currentPage++;
        } else {
          hasMorePages = false;
        }
      }

      // Aplicar filtro para "CD TOLEDO"
      allCentrosCusto = allCentrosCusto.filter(centroCusto => 
        centroCusto.filial_nome && 
        (centroCusto.filial_nome.toLowerCase().includes('cd toledo') || 
        centroCusto.filial_nome.toLowerCase().includes('toledo'))
      );
      
      setAllCentrosCustoData(allCentrosCusto);

      // Aplicar ordenação
      const sortedData = applySorting(allCentrosCusto, sortField, sortDirection);

      // Aplicar paginação frontend
      const paginatedData = applyFrontendPagination(
        sortedData,
        pagination.currentPage,
        pagination.itemsPerPage
      );

      setCentrosCusto(paginatedData);

      // Atualizar paginação
      const totalItems = sortedData.length;
      const totalPages = Math.ceil(totalItems / pagination.itemsPerPage) || 1;
      setPagination(prev => ({
        ...prev,
        totalItems,
        totalPages,
        currentPage: Math.min(prev.currentPage, totalPages)
      }));

      // Calcular estatísticas
      calcularEstatisticas(allCentrosCusto);

    } catch (error) {
      setError(error.message);
      setCentrosCusto([]);
      setAllCentrosCustoData([]);
      setStats({ total: 0, ativos: 0, inativos: 0, filiais_vinculadas: 0 });
    } finally {
      setLoading(false);
    }
  }, [sortField, sortDirection, pagination.itemsPerPage, pagination.currentPage, applySorting, applyFrontendPagination, calcularEstatisticas, checkConnection]);

  /**
   * Atualizar filtros
   */
  const atualizarFiltros = useCallback((novosFiltros) => {
    setFilters(prev => ({ ...prev, ...novosFiltros }));
    
    // Aplicar filtros nos dados
    let dadosFiltrados = allCentrosCustoData;

    // Filtro de busca
    if (novosFiltros.search !== undefined || filters.search !== '') {
      const searchTerm = (novosFiltros.search !== undefined ? novosFiltros.search : filters.search).toLowerCase();
      dadosFiltrados = dadosFiltrados.filter(centroCusto => 
        centroCusto.nome?.toLowerCase().includes(searchTerm) ||
        centroCusto.codigo?.toLowerCase().includes(searchTerm) ||
        centroCusto.filial_nome?.toLowerCase().includes(searchTerm) ||
        centroCusto.descricao?.toLowerCase().includes(searchTerm)
      );
    }

    // Filtro de status
    const statusFiltro = novosFiltros.status !== undefined ? novosFiltros.status : filters.status;
    if (statusFiltro !== 'todos') {
      dadosFiltrados = dadosFiltrados.filter(centroCusto => 
        statusFiltro === 'ativo' ? centroCusto.status === 1 : centroCusto.status === 0
      );
    }

    // Aplicar ordenação
    const sortedData = applySorting(dadosFiltrados, sortField, sortDirection);
    
    // Aplicar paginação nos dados filtrados
    const paginatedData = applyFrontendPagination(
      sortedData,
      1, // Reset para primeira página
      pagination.itemsPerPage
    );

    setCentrosCusto(paginatedData);

    // Atualizar paginação
    const totalItems = sortedData.length;
    const totalPages = Math.ceil(totalItems / pagination.itemsPerPage) || 1;
    setPagination(prev => ({
      ...prev,
      totalItems,
      totalPages,
      currentPage: 1
    }));

    // Recalcular estatísticas com dados filtrados
    calcularEstatisticas(dadosFiltrados);
  }, [allCentrosCustoData, filters, sortField, sortDirection, pagination.itemsPerPage, applySorting, applyFrontendPagination, calcularEstatisticas]);

  /**
   * Atualizar paginação
   */
  const atualizarPaginacao = useCallback((novosParametros) => {
    setPagination(prev => ({ ...prev, ...novosParametros }));
    
    // Aplicar filtros nos dados
    let dadosFiltrados = allCentrosCustoData;

    // Filtro de busca
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      dadosFiltrados = dadosFiltrados.filter(centroCusto => 
        centroCusto.nome?.toLowerCase().includes(searchTerm) ||
        centroCusto.codigo?.toLowerCase().includes(searchTerm) ||
        centroCusto.filial_nome?.toLowerCase().includes(searchTerm) ||
        centroCusto.descricao?.toLowerCase().includes(searchTerm)
      );
    }

    // Filtro de status
    if (filters.status !== 'todos') {
      dadosFiltrados = dadosFiltrados.filter(centroCusto => 
        filters.status === 'ativo' ? centroCusto.status === 1 : centroCusto.status === 0
      );
    }

    // Aplicar ordenação
    const sortedData = applySorting(dadosFiltrados, sortField, sortDirection);
    
    // Aplicar paginação
    const currentPage = novosParametros.currentPage || pagination.currentPage;
    const itemsPerPage = novosParametros.itemsPerPage || pagination.itemsPerPage;
    const paginatedData = applyFrontendPagination(sortedData, currentPage, itemsPerPage);

    setCentrosCusto(paginatedData);

    // Atualizar paginação
    const totalItems = sortedData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    setPagination(prev => ({
      ...prev,
      totalItems,
      totalPages,
      currentPage: Math.min(currentPage, totalPages),
      itemsPerPage
    }));
  }, [allCentrosCustoData, filters, sortField, sortDirection, pagination.currentPage, pagination.itemsPerPage, applySorting, applyFrontendPagination]);

  /**
   * Limpar filtros
   */
  const limparFiltros = useCallback(() => {
    setFilters({ search: '', status: 'todos' });
    
    // Aplicar ordenação
    const sortedData = applySorting(allCentrosCustoData, sortField, sortDirection);
    
    // Aplicar paginação
    const paginatedData = applyFrontendPagination(
      sortedData,
      1,
      pagination.itemsPerPage
    );

    setCentrosCusto(paginatedData);

    // Atualizar paginação
    const totalItems = sortedData.length;
    const totalPages = Math.ceil(totalItems / pagination.itemsPerPage) || 1;
    setPagination(prev => ({
      ...prev,
      totalItems,
      totalPages,
      currentPage: 1
    }));

    // Recalcular estatísticas
    calcularEstatisticas(allCentrosCustoData);
  }, [allCentrosCustoData, sortField, sortDirection, pagination.itemsPerPage, applySorting, applyFrontendPagination, calcularEstatisticas]);

  /**
   * Handler de ordenação
   */
  const handleSort = useCallback((field) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
  }, [sortField, sortDirection]);

  /**
   * Recarregar dados
   */
  const recarregar = useCallback(() => {
    carregarCentrosCusto();
  }, [carregarCentrosCusto]);

  /**
   * Funções auxiliares
   */
  const getStatusLabel = useCallback((status) => {
    return status === 1 || status === 'ativo' ? 'Ativo' : 'Inativo';
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return dateString;
    }
  }, []);

  // Carregar dados ao montar o componente
  useEffect(() => {
    carregarCentrosCusto();
  }, [carregarCentrosCusto]);

  return {
    // Estados
    centrosCusto,
    loading,
    error,
    connectionStatus,
    pagination,
    filters,
    stats,
    sortField,
    sortDirection,
    
    // Funções
    atualizarFiltros,
    atualizarPaginacao,
    limparFiltros,
    recarregar,
    handleSort,
    getStatusLabel,
    formatDate
  };
};

