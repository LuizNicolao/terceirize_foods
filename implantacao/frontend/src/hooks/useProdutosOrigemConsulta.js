import { useState, useEffect, useCallback } from 'react';
import FoodsApiService from '../services/FoodsApiService';

/**
 * Hook para consultar produtos origem do sistema Foods
 * Modo apenas leitura - sem operações CRUD
 */
export const useProdutosOrigemConsulta = () => {
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

  // Estados de estatísticas
  const [stats, setStats] = useState({
    total: 0,
    ativos: 0,
    inativos: 0
  });

  // Dados auxiliares para filtros (não utilizados na consulta)
  const grupos = [];
  const subgrupos = [];
  const classes = [];
  const unidadesMedida = [];

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
   * Carregar produtos origem
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

      // Buscar todos os produtos origem com paginação múltipla
      let allProdutos = [];
      let currentPage = 1;
      let hasMorePages = true;
      const maxPages = 50; // Limite de segurança

      while (hasMorePages && currentPage <= maxPages) {
        const result = await FoodsApiService.getProdutosOrigem({
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

      // Aplicar paginação frontend
      const paginatedData = applyFrontendPagination(
        allProdutos,
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
      console.error('Erro ao carregar produtos origem:', error);
      setError(error.message);
      setProdutos([]);
      setAllProdutosData([]);
    } finally {
      setLoading(false);
    }
  }, [checkConnection, applyFrontendPagination, pagination.currentPage, pagination.itemsPerPage]);

  /**
   * Calcular estatísticas dos produtos
   */
  const calcularEstatisticas = useCallback((produtosData) => {
    const total = produtosData.length;
    const ativos = produtosData.filter(produto => produto.status === 1 || produto.status === 'ativo').length;
    const inativos = total - ativos;

    const newStats = {
      total,
      ativos,
      inativos
    };
    
    setStats(newStats);
  }, []);

  /**
   * Atualizar filtros
   */
  const atualizarFiltros = useCallback((novosFiltros) => {
    setFilters(prev => ({ ...prev, ...novosFiltros }));
    
    // Aplicar filtros nos dados
    let dadosFiltrados = allProdutosData;

    // Filtro de busca
    if (novosFiltros.search || filters.search) {
      const searchTerm = (novosFiltros.search || filters.search).toLowerCase();
      dadosFiltrados = dadosFiltrados.filter(produto => 
        produto.nome?.toLowerCase().includes(searchTerm) ||
        produto.codigo?.toLowerCase().includes(searchTerm) ||
        produto.referencia_mercado?.toLowerCase().includes(searchTerm)
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
    if (novosFiltros.grupo_id || filters.grupo_id) {
      const grupoId = novosFiltros.grupo_id || filters.grupo_id;
      if (grupoId) {
        dadosFiltrados = dadosFiltrados.filter(produto => produto.grupo_id == grupoId);
      }
    }

    // Filtro de subgrupo
    if (novosFiltros.subgrupo_id || filters.subgrupo_id) {
      const subgrupoId = novosFiltros.subgrupo_id || filters.subgrupo_id;
      if (subgrupoId) {
        dadosFiltrados = dadosFiltrados.filter(produto => produto.subgrupo_id == subgrupoId);
      }
    }

    // Filtro de classe
    if (novosFiltros.classe_id || filters.classe_id) {
      const classeId = novosFiltros.classe_id || filters.classe_id;
      if (classeId) {
        dadosFiltrados = dadosFiltrados.filter(produto => produto.classe_id == classeId);
      }
    }

    // Aplicar paginação nos dados filtrados
    const paginatedData = applyFrontendPagination(
      dadosFiltrados,
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
  }, [allProdutosData, filters, applyFrontendPagination, pagination.itemsPerPage, calcularEstatisticas]);

  /**
   * Atualizar paginação
   */
  const atualizarPaginacao = useCallback((novaPaginacao) => {
    setPagination(prev => {
      const updatedPagination = { ...prev, ...novaPaginacao };
      
      // Aplicar paginação nos dados
      const paginatedData = applyFrontendPagination(
        allProdutosData,
        updatedPagination.currentPage,
        updatedPagination.itemsPerPage
      );

      setProdutos(paginatedData);

      return updatedPagination;
    });
  }, [allProdutosData, applyFrontendPagination]);

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

    // Aplicar paginação nos dados originais
    const paginatedData = applyFrontendPagination(
      allProdutosData,
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
  }, [allProdutosData, applyFrontendPagination, pagination.itemsPerPage, calcularEstatisticas]);

  /**
   * Carregar dados iniciais
   */
  useEffect(() => {
    carregarProdutos();
  }, []);

  // Funções auxiliares removidas - dados já vêm com nomes do Foods

  /**
   * Recarregar dados
   */
  const recarregar = useCallback(() => {
    carregarProdutos();
  }, [carregarProdutos]);

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

    // Ações
    carregarProdutos,
    atualizarFiltros,
    atualizarPaginacao,
    limparFiltros,
    recarregar,
    checkConnection,

    // Funções auxiliares para obter nomes (os dados já vêm do Foods com os nomes)
    getGrupoName: (produto) => {
      if (!produto) return '-';
      return produto.grupo_nome || '-';
    },
    getSubgrupoName: (produto) => {
      if (!produto) return '-';
      return produto.subgrupo_nome || '-';
    },
    getClasseName: (produto) => {
      if (!produto) return '-';
      return produto.classe_nome || '-';
    },
    getUnidadeMedidaName: (produto) => {
      if (!produto) return '-';
      // Priorizar sigla (KG) ao invés do nome completo (QUILOGRAMA)
      return produto.unidade_medida_sigla || produto.unidade_medida_nome || '-';
    }
  };
};
