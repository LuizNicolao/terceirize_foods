import { useState, useEffect, useCallback } from 'react';
import FoodsApiService from '../services/FoodsApiService';

const useSubgruposConsulta = () => {
  // Estados principais
  const [subgrupos, setSubgrupos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasError, setIsError] = useState(false);

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
    status: 'todos',
    grupo_id: ''
  });

  // Estados de ordenação
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Estados de estatísticas
  const [stats, setStats] = useState({
    total: 0,
    ativos: 0,
    inativos: 0,
    total_produtos: 0
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

  // Função para carregar grupos (dados auxiliares)
  const carregarGrupos = useCallback(async () => {
    try {
      const response = await FoodsApiService.getGrupos();
      if (response.success) {
        setGrupos(response.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    }
  }, []);

  // Função para carregar subgrupos
  const carregarSubgrupos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Verificar conexão primeiro
      const connectionCheck = await FoodsApiService.checkConnection();
      if (!connectionCheck.connected) {
        setIsConnected(false);
        setIsError(true);
        setError(connectionCheck.message);
        setLoading(false);
        return;
      }

      setIsConnected(true);
      setIsError(false);

      // Parâmetros para a API
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...(filters.search && { search: filters.search }),
        ...(filters.status !== 'todos' && { status: filters.status }),
        ...(filters.grupo_id && { grupo_id: filters.grupo_id })
      };

      const response = await FoodsApiService.getSubgrupos(params);
      
      if (response.success) {
        // Aplicar ordenação nos dados recebidos
        const sortedData = applySorting(response.data || [], sortField, sortDirection);
        setSubgrupos(sortedData);
        
        // Atualizar paginação
        if (response.pagination) {
          setPagination(prev => ({
            ...prev,
            totalPages: response.pagination.totalPages || 1,
            totalItems: response.pagination.totalItems || 0
          }));
        }

        // Calcular estatísticas
        const total = response.data?.length || 0;
        const ativos = response.data?.filter(sg => sg.status === 'ativo' || sg.status === 1).length || 0;
        const inativos = response.data?.filter(sg => sg.status === 'inativo' || sg.status === 0).length || 0;
        const totalProdutos = response.data?.reduce((acc, sg) => acc + (sg.total_produtos || 0), 0) || 0;

        setStats({
          total,
          ativos,
          inativos,
          total_produtos: totalProdutos
        });
      } else {
        setError(response.message || 'Erro ao carregar subgrupos');
        setIsError(true);
      }
    } catch (error) {
      console.error('Erro ao carregar subgrupos:', error);
      setError('Erro ao conectar com o sistema Foods');
      setIsError(true);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, filters, sortField, sortDirection, applySorting]);

  // Carregar dados iniciais
  useEffect(() => {
    carregarGrupos();
  }, [carregarGrupos]);

  useEffect(() => {
    carregarSubgrupos();
  }, [carregarSubgrupos]);

  // Funções de atualização
  const atualizarFiltros = useCallback((novosFiltros) => {
    setFilters(prev => ({ ...prev, ...novosFiltros }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const atualizarPaginacao = useCallback((novaPaginacao) => {
    setPagination(prev => ({ ...prev, ...novaPaginacao }));
  }, []);

  const limparFiltros = useCallback(() => {
    setFilters({
      search: '',
      status: 'todos',
      grupo_id: ''
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const recarregar = useCallback(() => {
    carregarSubgrupos();
  }, [carregarSubgrupos]);

  /**
   * Handler para ordenação
   */
  const handleSort = useCallback((field) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    
    // Reaplicar ordenação nos dados atuais
    const sortedData = applySorting(subgrupos, field, newDirection);
    setSubgrupos(sortedData);
  }, [subgrupos, sortField, sortDirection, applySorting]);

  // Funções auxiliares
  const getGrupoNome = useCallback((grupoId) => {
    const grupo = grupos.find(g => g.id === grupoId);
    return grupo ? grupo.nome : 'N/A';
  }, [grupos]);

  const isEmpty = subgrupos.length === 0 && !loading;

  return {
    // Estados principais
    subgrupos,
    grupos,
    loading,
    error,
    isConnected,
    hasError,
    isEmpty,

    // Paginação
    pagination,

    // Filtros
    filters,

    // Ordenação
    sortField,
    sortDirection,

    // Estatísticas
    stats,

    // Funções de atualização
    atualizarFiltros,
    atualizarPaginacao,
    limparFiltros,
    recarregar,
    handleSort,

    // Funções auxiliares
    getGrupoNome
  };
};

export default useSubgruposConsulta;
