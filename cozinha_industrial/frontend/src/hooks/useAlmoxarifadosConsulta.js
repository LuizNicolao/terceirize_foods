import { useState, useEffect, useCallback } from 'react';
import FoodsApiService from '../services/FoodsApiService';

/**
 * Hook para consultar almoxarifados do sistema Foods
 * Modo apenas leitura - sem operações CRUD
 */
export const useAlmoxarifadosConsulta = () => {
  // Estados principais
  const [allAlmoxarifadosData, setAllAlmoxarifadosData] = useState([]); // Todos os almoxarifados
  const [almoxarifados, setAlmoxarifados] = useState([]); // Almoxarifados da página atual
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
    filial_id: '',
    centro_custo_id: ''
  });

  // Estados de ordenação
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Estados de estatísticas
  const [stats, setStats] = useState({
    total: 0,
    ativos: 0,
    inativos: 0
  });

  // Dados auxiliares para filtros (não utilizados na consulta)
  const filiais = [];
  const centrosCusto = [];

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
   * Calcular estatísticas dos almoxarifados
   */
  const calcularEstatisticas = useCallback((almoxarifadosData) => {
    const total = almoxarifadosData.length;
    const ativos = almoxarifadosData.filter(almoxarifado => almoxarifado.status === 1 || almoxarifado.status === 'ativo').length;
    const inativos = total - ativos;

    const newStats = {
      total,
      ativos,
      inativos
    };
    
    setStats(newStats);
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
   * Carregar almoxarifados
   */
  const carregarAlmoxarifados = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Verificar conexão primeiro
      const isConnected = await checkConnection();
      if (!isConnected) {
        throw new Error('Não foi possível conectar com o sistema Foods');
      }

      // Buscar todos os almoxarifados com paginação múltipla
      let allAlmoxarifados = [];
      let currentPage = 1;
      let hasMorePages = true;
      const maxPages = 50; // Limite de segurança

      while (hasMorePages && currentPage <= maxPages) {
        const result = await FoodsApiService.getAlmoxarifados({
          page: currentPage,
          limit: 100 // Limite do backend
        });

        // EXATAMENTE igual ao useProdutosGenericosConsulta
        if (result.success && result.data && result.data.length > 0) {
          allAlmoxarifados = [...allAlmoxarifados, ...result.data];
          hasMorePages = result.data.length === 100;
          currentPage++;
        } else {
          hasMorePages = false;
        }
      }

      // Aplicar filtro para "CD TOLEDO"
      allAlmoxarifados = allAlmoxarifados.filter(almoxarifado => 
        almoxarifado.filial_nome && 
        (almoxarifado.filial_nome.toLowerCase().includes('cd toledo') || 
        almoxarifado.filial_nome.toLowerCase().includes('toledo'))
      );
      
      setAllAlmoxarifadosData(allAlmoxarifados);

      // Aplicar ordenação
      const sortedData = applySorting(allAlmoxarifados, sortField, sortDirection);

      // Aplicar paginação frontend
      const paginatedData = applyFrontendPagination(
        sortedData,
        pagination.currentPage,
        pagination.itemsPerPage
      );

      setAlmoxarifados(paginatedData);

      // Atualizar paginação
      setPagination(prev => ({
        ...prev,
        totalItems: allAlmoxarifados.length,
        totalPages: Math.ceil(allAlmoxarifados.length / prev.itemsPerPage)
      }));

      // Calcular estatísticas
      calcularEstatisticas(allAlmoxarifados);

    } catch (error) {
      setError(error.message);
      setAlmoxarifados([]);
      setAllAlmoxarifadosData([]);
    } finally {
      setLoading(false);
    }
  }, [checkConnection, applyFrontendPagination, applySorting, sortField, sortDirection, pagination.currentPage, pagination.itemsPerPage, calcularEstatisticas]);

  /**
   * Atualizar filtros
   */
  const atualizarFiltros = useCallback((novosFiltros) => {
    setFilters(prev => ({ ...prev, ...novosFiltros }));
    
    // Aplicar filtros nos dados
    let dadosFiltrados = allAlmoxarifadosData;

    // Filtro de busca
    if (novosFiltros.search !== undefined || filters.search !== '') {
      const searchTerm = (novosFiltros.search !== undefined ? novosFiltros.search : filters.search).toLowerCase();
      dadosFiltrados = dadosFiltrados.filter(almoxarifado => 
        almoxarifado.nome?.toLowerCase().includes(searchTerm) ||
        almoxarifado.codigo?.toLowerCase().includes(searchTerm) ||
        almoxarifado.filial_nome?.toLowerCase().includes(searchTerm) ||
        almoxarifado.centro_custo_nome?.toLowerCase().includes(searchTerm)
      );
    }

    // Filtro de status
    const statusFiltro = novosFiltros.status !== undefined ? novosFiltros.status : filters.status;
    if (statusFiltro !== 'todos') {
      dadosFiltrados = dadosFiltrados.filter(almoxarifado => 
        statusFiltro === 'ativo' ? almoxarifado.status === 1 : almoxarifado.status === 0
      );
    }

    // Filtro de filial
    if (novosFiltros.filial_id !== undefined || filters.filial_id !== '') {
      const filialId = novosFiltros.filial_id !== undefined ? novosFiltros.filial_id : filters.filial_id;
      if (filialId && filialId !== 'todos') {
        dadosFiltrados = dadosFiltrados.filter(almoxarifado => almoxarifado.filial_id == filialId);
      }
    }

    // Filtro de centro de custo
    if (novosFiltros.centro_custo_id !== undefined || filters.centro_custo_id !== '') {
      const centroCustoId = novosFiltros.centro_custo_id !== undefined ? novosFiltros.centro_custo_id : filters.centro_custo_id;
      if (centroCustoId && centroCustoId !== 'todos') {
        dadosFiltrados = dadosFiltrados.filter(almoxarifado => almoxarifado.centro_custo_id == centroCustoId);
      }
    }

    // Aplicar ordenação
    const sortedData = applySorting(dadosFiltrados, sortField, sortDirection);
    
    // Aplicar paginação nos dados filtrados
    const paginatedData = applyFrontendPagination(
      sortedData,
      1, // Reset para primeira página
      pagination.itemsPerPage
    );

    setAlmoxarifados(paginatedData);

    // Atualizar paginação
    setPagination(prev => ({
      ...prev,
      currentPage: 1,
      totalItems: dadosFiltrados.length,
      totalPages: Math.ceil(dadosFiltrados.length / prev.itemsPerPage)
    }));

    // Recalcular estatísticas com dados filtrados
    calcularEstatisticas(dadosFiltrados);
  }, [allAlmoxarifadosData, filters, sortField, sortDirection, applyFrontendPagination, applySorting, pagination.itemsPerPage, calcularEstatisticas]);

  /**
   * Atualizar paginação
   */
  const atualizarPaginacao = useCallback((novaPaginacao) => {
    setPagination(prev => {
      const updatedPagination = { ...prev, ...novaPaginacao };
      
      // Aplicar filtros primeiro
      let dadosFiltrados = allAlmoxarifadosData;
      
      // Filtro de busca
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        dadosFiltrados = dadosFiltrados.filter(almoxarifado => 
          almoxarifado.nome?.toLowerCase().includes(searchTerm) ||
          almoxarifado.codigo?.toLowerCase().includes(searchTerm) ||
          almoxarifado.filial_nome?.toLowerCase().includes(searchTerm) ||
          almoxarifado.centro_custo_nome?.toLowerCase().includes(searchTerm)
        );
      }

      // Filtro de status
      if (filters.status !== 'todos') {
        dadosFiltrados = dadosFiltrados.filter(almoxarifado => 
          filters.status === 'ativo' ? almoxarifado.status === 1 : almoxarifado.status === 0
        );
      }

      // Filtro de filial
      if (filters.filial_id && filters.filial_id !== 'todos') {
        dadosFiltrados = dadosFiltrados.filter(almoxarifado => almoxarifado.filial_id == filters.filial_id);
      }

      // Filtro de centro de custo
      if (filters.centro_custo_id && filters.centro_custo_id !== 'todos') {
        dadosFiltrados = dadosFiltrados.filter(almoxarifado => almoxarifado.centro_custo_id == filters.centro_custo_id);
      }

      // Aplicar ordenação
      const sortedData = applySorting(dadosFiltrados, sortField, sortDirection);
      
      // Aplicar paginação nos dados
      const paginatedData = applyFrontendPagination(
        sortedData,
        updatedPagination.currentPage,
        updatedPagination.itemsPerPage
      );

      setAlmoxarifados(paginatedData);

      return updatedPagination;
    });
  }, [allAlmoxarifadosData, filters, sortField, sortDirection, applyFrontendPagination, applySorting]);

  /**
   * Limpar filtros
   */
  const limparFiltros = useCallback(() => {
    setFilters({
      search: '',
      status: 'todos',
      filial_id: '',
      centro_custo_id: ''
    });

    // Aplicar ordenação
    const sortedData = applySorting(allAlmoxarifadosData, sortField, sortDirection);

    // Aplicar paginação nos dados originais
    const paginatedData = applyFrontendPagination(
      sortedData,
      1,
      pagination.itemsPerPage
    );

    setAlmoxarifados(paginatedData);

    // Atualizar paginação
    setPagination(prev => ({
      ...prev,
      currentPage: 1,
      totalItems: allAlmoxarifadosData.length,
      totalPages: Math.ceil(allAlmoxarifadosData.length / prev.itemsPerPage)
    }));

    // Recalcular estatísticas com dados originais
    calcularEstatisticas(allAlmoxarifadosData);
  }, [allAlmoxarifadosData, sortField, sortDirection, applyFrontendPagination, applySorting, pagination.itemsPerPage, calcularEstatisticas]);

  /**
   * Handler para ordenação
   */
  const handleSort = useCallback((field) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    
    // Aplicar filtros primeiro
    let dadosFiltrados = allAlmoxarifadosData;
    
    // Filtro de busca
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      dadosFiltrados = dadosFiltrados.filter(almoxarifado => 
        almoxarifado.nome?.toLowerCase().includes(searchTerm) ||
        almoxarifado.codigo?.toLowerCase().includes(searchTerm) ||
        almoxarifado.filial_nome?.toLowerCase().includes(searchTerm) ||
        almoxarifado.centro_custo_nome?.toLowerCase().includes(searchTerm)
      );
    }

    // Filtro de status
    if (filters.status !== 'todos') {
      dadosFiltrados = dadosFiltrados.filter(almoxarifado => 
        filters.status === 'ativo' ? almoxarifado.status === 1 : almoxarifado.status === 0
      );
    }
    
    // Reaplicar ordenação e paginação nos dados atuais
    const sortedData = applySorting(dadosFiltrados, field, newDirection);
    
    const paginatedData = applyFrontendPagination(sortedData, pagination.currentPage, pagination.itemsPerPage);
    setAlmoxarifados(paginatedData);
    
    // Reset para primeira página ao ordenar
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [allAlmoxarifadosData, sortField, sortDirection, filters, pagination.currentPage, pagination.itemsPerPage, applySorting, applyFrontendPagination]);

  /**
   * Carregar dados iniciais
   */
  useEffect(() => {
    carregarAlmoxarifados();
  }, [carregarAlmoxarifados]);

  /**
   * Recarregar dados
   */
  const recarregar = useCallback(() => {
    carregarAlmoxarifados();
  }, [carregarAlmoxarifados]);

  const getStatusLabel = useCallback((status) => {
    return status === 1 || status === 'ativo' ? 'Ativo' : 'Inativo';
  }, []);

  const formatDate = useCallback((date) => {
    if (!date) return '-';
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('pt-BR');
    } catch (error) {
      return '-';
    }
  }, []);

  return {
    // Estados
    almoxarifados,
    allAlmoxarifadosData,
    loading,
    error,
    connectionStatus,
    pagination,
    filters,
    stats,
    filiais,
    centrosCusto,
    sortField,
    sortDirection,

    // Ações
    carregarAlmoxarifados,
    atualizarFiltros,
    atualizarPaginacao,
    limparFiltros,
    recarregar,
    handleSort,
    checkConnection,

    // Funções auxiliares
    getStatusLabel,
    formatDate
  };
};

