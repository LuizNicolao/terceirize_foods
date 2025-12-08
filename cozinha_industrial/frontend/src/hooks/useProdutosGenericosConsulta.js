import { useState, useEffect, useCallback } from 'react';
import FoodsApiService from '../services/FoodsApiService';

/**
 * Hook para consultar produtos genéricos do sistema Foods
 * Modo apenas leitura - sem operações CRUD
 */
export const useProdutosGenericosConsulta = () => {
  // Estados principais
  const [allProdutosData, setAllProdutosData] = useState([]); // Todos os produtos
  const [produtos, setProdutos] = useState([]); // Produtos da página atual
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
    grupo_id: '',
    subgrupo_id: '',
    classe_id: ''
  });

  // Estados de ordenação
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Estados de estatísticas
  const [stats, setStats] = useState({
    total_produtos_genericos: 0,
    produtos_ativos: 0,
    produtos_inativos: 0,
    total_produtos_vinculados: 0,
    produtos_padrao: 0,
    com_produto_origem: 0
  });

  // Dados auxiliares para filtros (não utilizados na consulta)
  const grupos = [];
  const subgrupos = [];
  const classes = [];
  const unidadesMedida = [];
  const produtosOrigem = [];

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
   * Calcular estatísticas dos produtos genéricos
   */
  const calcularEstatisticas = useCallback((produtosData) => {
    const total = produtosData.length;
    const ativos = produtosData.filter(produto => produto.status === 1 || produto.status === 'ativo').length;
    const inativos = total - ativos;
    const comProdutosVinculados = produtosData.filter(produto => produto.total_produtos > 0).length;
    const produtosPadrao = produtosData.filter(produto => produto.produto_padrao === 'Sim' || produto.produto_padrao === 1).length;
    const comProdutoOrigem = produtosData.filter(produto => produto.produto_origem_id).length;

    const newStats = {
      total_produtos_genericos: total,
      produtos_ativos: ativos,
      produtos_inativos: inativos,
      total_produtos_vinculados: comProdutosVinculados,
      produtos_padrao: produtosPadrao,
      com_produto_origem: comProdutoOrigem
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
   * Carregar produtos genéricos
   */
  const carregarProdutos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Verificar conexão primeiro
      const isConnected = await checkConnection();
      if (!isConnected) {
        throw new Error('Não foi possível conectar com o sistema Foods');
      }

      // Buscar todos os produtos genéricos com paginação múltipla
      let allProdutos = [];
      let currentPage = 1;
      let hasMorePages = true;
      const maxPages = 50; // Limite de segurança

      while (hasMorePages && currentPage <= maxPages) {
        const result = await FoodsApiService.getProdutosGenericos({
          page: currentPage,
          limit: 100 // Limite do backend
        });

        if (result.success && result.data && result.data.length > 0) {
          allProdutos = [...allProdutos, ...result.data];
          hasMorePages = result.data.length === 100;
          currentPage++;
        } else {
          hasMorePages = false;
        }
      }

      setAllProdutosData(allProdutos);

      // Aplicar ordenação
      const sortedData = applySorting(allProdutos, sortField, sortDirection);

      // Aplicar paginação frontend
      const paginatedData = applyFrontendPagination(
        sortedData,
        pagination.currentPage,
        pagination.itemsPerPage
      );

      setProdutos(paginatedData);

      // Atualizar paginação
      setPagination(prev => ({
        ...prev,
        totalItems: allProdutos.length,
        totalPages: Math.ceil(allProdutos.length / prev.itemsPerPage)
      }));

      // Calcular estatísticas
      calcularEstatisticas(allProdutos);

    } catch (error) {
      console.error('Erro ao carregar produtos genéricos:', error);
      setError(error.message);
      setProdutos([]);
      setAllProdutosData([]);
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
    let dadosFiltrados = allProdutosData;

    // Filtro de busca
    if (novosFiltros.search !== undefined || filters.search !== '') {
      const searchTerm = (novosFiltros.search !== undefined ? novosFiltros.search : filters.search).toLowerCase();
      dadosFiltrados = dadosFiltrados.filter(produto => 
        produto.nome?.toLowerCase().includes(searchTerm) ||
        produto.codigo?.toLowerCase().includes(searchTerm)
      );
    }

    // Filtro de status
    const statusFiltro = novosFiltros.status !== undefined ? novosFiltros.status : filters.status;
    if (statusFiltro !== 'todos') {
      dadosFiltrados = dadosFiltrados.filter(produto => 
        statusFiltro === 'ativo' ? produto.status === 1 : produto.status === 0
      );
    }

    // Filtro de grupo
    if (novosFiltros.grupo_id !== undefined || filters.grupo_id !== '') {
      const grupoId = novosFiltros.grupo_id !== undefined ? novosFiltros.grupo_id : filters.grupo_id;
      if (grupoId) {
        dadosFiltrados = dadosFiltrados.filter(produto => produto.grupo_id == grupoId);
      }
    }

    // Filtro de subgrupo
    if (novosFiltros.subgrupo_id !== undefined || filters.subgrupo_id !== '') {
      const subgrupoId = novosFiltros.subgrupo_id !== undefined ? novosFiltros.subgrupo_id : filters.subgrupo_id;
      if (subgrupoId) {
        dadosFiltrados = dadosFiltrados.filter(produto => produto.subgrupo_id == subgrupoId);
      }
    }

    // Filtro de classe
    if (novosFiltros.classe_id !== undefined || filters.classe_id !== '') {
      const classeId = novosFiltros.classe_id !== undefined ? novosFiltros.classe_id : filters.classe_id;
      if (classeId) {
        dadosFiltrados = dadosFiltrados.filter(produto => produto.classe_id == classeId);
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

    setProdutos(paginatedData);

    // Atualizar paginação
    setPagination(prev => ({
      ...prev,
      currentPage: 1,
      totalItems: dadosFiltrados.length,
      totalPages: Math.ceil(dadosFiltrados.length / prev.itemsPerPage)
    }));

    // Recalcular estatísticas com dados filtrados
    calcularEstatisticas(dadosFiltrados);
  }, [allProdutosData, filters, sortField, sortDirection, applyFrontendPagination, applySorting, pagination.itemsPerPage, calcularEstatisticas]);

  /**
   * Atualizar paginação
   */
  const atualizarPaginacao = useCallback((novaPaginacao) => {
    setPagination(prev => {
      const updatedPagination = { ...prev, ...novaPaginacao };
      
      // Aplicar filtros primeiro
      let dadosFiltrados = allProdutosData;
      
      // Filtro de busca
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        dadosFiltrados = dadosFiltrados.filter(produto => 
          produto.nome?.toLowerCase().includes(searchTerm) ||
          produto.codigo?.toLowerCase().includes(searchTerm)
        );
      }

      // Filtro de status
      if (filters.status !== 'todos') {
        dadosFiltrados = dadosFiltrados.filter(produto => 
          filters.status === 'ativo' ? produto.status === 1 : produto.status === 0
        );
      }

      // Aplicar ordenação
      const sortedData = applySorting(dadosFiltrados, sortField, sortDirection);
      
      // Aplicar paginação nos dados
      const paginatedData = applyFrontendPagination(
        sortedData,
        updatedPagination.currentPage,
        updatedPagination.itemsPerPage
      );

      setProdutos(paginatedData);

      return updatedPagination;
    });
  }, [allProdutosData, filters, sortField, sortDirection, applyFrontendPagination, applySorting]);

  /**
   * Limpar filtros
   */
  const limparFiltros = useCallback(() => {
    setFilters({
      search: '',
      status: 'todos',
      grupo_id: '',
      subgrupo_id: '',
      classe_id: ''
    });

    // Aplicar ordenação
    const sortedData = applySorting(allProdutosData, sortField, sortDirection);

    // Aplicar paginação nos dados originais
    const paginatedData = applyFrontendPagination(
      sortedData,
      1,
      pagination.itemsPerPage
    );

    setProdutos(paginatedData);

    // Atualizar paginação
    setPagination(prev => ({
      ...prev,
      currentPage: 1,
      totalItems: allProdutosData.length,
      totalPages: Math.ceil(allProdutosData.length / prev.itemsPerPage)
    }));

    // Recalcular estatísticas com dados originais
    calcularEstatisticas(allProdutosData);
  }, [allProdutosData, sortField, sortDirection, applyFrontendPagination, applySorting, pagination.itemsPerPage, calcularEstatisticas]);

  /**
   * Handler para ordenação
   */
  const handleSort = useCallback((field) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    
    // Aplicar filtros primeiro
    let dadosFiltrados = allProdutosData;
    
    // Filtro de busca
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      dadosFiltrados = dadosFiltrados.filter(produto => 
        produto.nome?.toLowerCase().includes(searchTerm) ||
        produto.codigo?.toLowerCase().includes(searchTerm)
      );
    }

    // Filtro de status
    if (filters.status !== 'todos') {
      dadosFiltrados = dadosFiltrados.filter(produto => 
        filters.status === 'ativo' ? produto.status === 1 : produto.status === 0
      );
    }
    
    // Reaplicar ordenação e paginação nos dados atuais
    const sortedData = applySorting(dadosFiltrados, field, newDirection);
    
    const paginatedData = applyFrontendPagination(sortedData, pagination.currentPage, pagination.itemsPerPage);
    setProdutos(paginatedData);
    
    // Reset para primeira página ao ordenar
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [allProdutosData, sortField, sortDirection, filters, pagination.currentPage, pagination.itemsPerPage, applySorting, applyFrontendPagination]);

  /**
   * Carregar dados iniciais
   */
  useEffect(() => {
    carregarProdutos();
  }, []);

  /**
   * Recarregar dados
   */
  const recarregar = useCallback(() => {
    carregarProdutos();
  }, [carregarProdutos]);

  // Funções auxiliares para obter nomes (retornam os dados que já vêm do Foods)
  const getGrupoName = useCallback((grupoId) => {
    if (!grupoId) return '-';
    const produto = allProdutosData.find(p => p.grupo_id === grupoId);
    return produto?.grupo_nome || '-';
  }, [allProdutosData]);

  const getSubgrupoName = useCallback((subgrupoId) => {
    if (!subgrupoId) return '-';
    const produto = allProdutosData.find(p => p.subgrupo_id === subgrupoId);
    return produto?.subgrupo_nome || '-';
  }, [allProdutosData]);

  const getClasseName = useCallback((classeId) => {
    if (!classeId) return '-';
    const produto = allProdutosData.find(p => p.classe_id === classeId);
    return produto?.classe_nome || '-';
  }, [allProdutosData]);

  const getProdutoOrigemName = useCallback((produtoOrigemId) => {
    if (!produtoOrigemId) return '-';
    const produto = allProdutosData.find(p => p.produto_origem_id === produtoOrigemId);
    if (produto?.produto_origem_codigo && produto?.produto_origem_nome) {
      return `${produto.produto_origem_codigo} - ${produto.produto_origem_nome}`;
    }
    return produto?.produto_origem_nome || '-';
  }, [allProdutosData]);

  const getUnidadeMedidaName = useCallback((unidadeId) => {
    if (!unidadeId) return '-';
    const produto = allProdutosData.find(p => p.unidade_medida_id === unidadeId);
    return produto?.unidade_medida_nome || '-';
  }, [allProdutosData]);

  const getUnidadeMedidaSigla = useCallback((unidadeId) => {
    if (!unidadeId) return '-';
    const produto = allProdutosData.find(p => p.unidade_medida_id === unidadeId);
    return produto?.unidade_medida_sigla || '-';
  }, [allProdutosData]);

  const getStatusLabel = useCallback((status) => {
    return status === 1 || status === 'ativo' ? 'Ativo' : 'Inativo';
  }, []);

  const getStatusColor = useCallback((status) => {
    return status === 1 || status === 'ativo' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
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
    produtos,
    allProdutosData,
    loading,
    error,
    connectionStatus,
    pagination,
    filters,
    stats,
    grupos,
    subgrupos,
    classes,
    unidadesMedida,
    produtosOrigem,
    sortField,
    sortDirection,

    // Ações
    carregarProdutos,
    atualizarFiltros,
    atualizarPaginacao,
    limparFiltros,
    recarregar,
    handleSort,
    checkConnection,

    // Funções auxiliares
    getGrupoName,
    getSubgrupoName,
    getClasseName,
    getProdutoOrigemName,
    getUnidadeMedidaName,
    getUnidadeMedidaSigla,
    getStatusLabel,
    getStatusColor,
    formatDate
  };
};

