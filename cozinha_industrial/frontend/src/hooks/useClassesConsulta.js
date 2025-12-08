import { useState, useEffect, useCallback } from 'react';
import FoodsApiService from '../services/FoodsApiService';

const useClassesConsulta = () => {
  // Estados principais
  const [classes, setClasses] = useState([]);
  const [subgrupos, setSubgrupos] = useState([]);
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
    subgrupo_id: ''
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

  // Função para carregar subgrupos (dados auxiliares)
  const carregarSubgrupos = useCallback(async () => {
    try {
      const response = await FoodsApiService.getSubgrupos();
      if (response.success) {
        setSubgrupos(response.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar subgrupos:', error);
    }
  }, []);

  // Função para carregar classes
  const carregarClasses = useCallback(async () => {
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
        ...(filters.subgrupo_id && { subgrupo_id: filters.subgrupo_id })
      };

      const response = await FoodsApiService.getClasses(params);
      
      if (response.success) {
        // Aplicar ordenação nos dados recebidos
        const sortedData = applySorting(response.data || [], sortField, sortDirection);
        setClasses(sortedData);
        
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
        const ativos = response.data?.filter(c => c.status === 'ativo' || c.status === 1).length || 0;
        const inativos = response.data?.filter(c => c.status === 'inativo' || c.status === 0).length || 0;
        const totalProdutos = response.data?.reduce((acc, c) => acc + (c.total_produtos || 0), 0) || 0;

        setStats({
          total,
          ativos,
          inativos,
          total_produtos: totalProdutos
        });
      } else {
        setError(response.message || 'Erro ao carregar classes');
        setIsError(true);
      }
    } catch (error) {
      console.error('Erro ao carregar classes:', error);
      setError('Erro ao conectar com o sistema Foods');
      setIsError(true);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, filters, sortField, sortDirection, applySorting]);

  // Carregar dados iniciais
  useEffect(() => {
    carregarSubgrupos();
  }, [carregarSubgrupos]);

  useEffect(() => {
    carregarClasses();
  }, [carregarClasses]);

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
      subgrupo_id: ''
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const recarregar = useCallback(() => {
    carregarClasses();
  }, [carregarClasses]);

  /**
   * Handler para ordenação
   */
  const handleSort = useCallback((field) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    
    // Reaplicar ordenação nos dados atuais
    const sortedData = applySorting(classes, field, newDirection);
    setClasses(sortedData);
  }, [classes, sortField, sortDirection, applySorting]);

  // Funções auxiliares
  const getSubgrupoNome = useCallback((subgrupoId) => {
    const subgrupo = subgrupos.find(sg => sg.id === subgrupoId);
    return subgrupo ? subgrupo.nome : 'N/A';
  }, [subgrupos]);

  const isEmpty = classes.length === 0 && !loading;

  return {
    // Estados principais
    classes,
    subgrupos,
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
    getSubgrupoNome
  };
};

export default useClassesConsulta;
