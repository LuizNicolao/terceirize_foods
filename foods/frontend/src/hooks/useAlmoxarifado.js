import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import AlmoxarifadoService from '../services/almoxarifadoService';
import FiliaisService from '../services/filiais';
import CentroCustoService from '../services/centroCusto';
import { useBaseEntity } from './common/useBaseEntity';
import { useFilters } from './common/useFilters';
import useTableSort from './common/useTableSort';

export const useAlmoxarifado = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('almoxarifado', AlmoxarifadoService, {
    initialItemsPerPage: 20,
    initialFilters: { filialFilter: 'todos', centroCustoFilter: 'todos' },
    enableStats: true,
    enableDelete: true
  });

  // Hook de filtros customizados
  const customFilters = useFilters({ filialFilter: 'todos', centroCustoFilter: 'todos' });

  // Estados para dados auxiliares (para os filtros)
  const [filiais, setFiliais] = useState([]);
  const [centrosCusto, setCentrosCusto] = useState([]);
  const [loadingFiliais, setLoadingFiliais] = useState(false);
  const [loadingCentrosCusto, setLoadingCentrosCusto] = useState(false);

  /**
   * Carrega dados com filtros customizados
   */
  const loadDataWithFilters = useCallback(async (customParams = {}) => {
    const params = {
      ...baseEntity.getPaginationParams(),
      ...customFilters.getFilterParams(),
      // Incluir parâmetros de ordenação do baseEntity se disponíveis
      sortField: customParams.sortField !== undefined ? customParams.sortField : baseEntity.sortField || undefined,
      sortDirection: customParams.sortDirection !== undefined ? customParams.sortDirection : baseEntity.sortDirection || undefined,
      ...customParams
    };

    await baseEntity.loadData(params);
  }, [baseEntity, customFilters]);

  // Hook de ordenação híbrida (depois de loadDataWithFilters para poder usá-lo no callback)
  const {
    sortedData: almoxarifadosOrdenados,
    sortField: localSortField,
    sortDirection: localSortDirection,
    handleSort,
    isSortingLocally
  } = useTableSort({
    data: baseEntity.items,
    threshold: 100,
    totalItems: baseEntity.totalItems,
    onBackendSort: (field, direction) => {
      // Atualizar estados de ordenação no baseEntity
      baseEntity.setSortField(field);
      baseEntity.setSortDirection(direction);
      // Recarregar dados com nova ordenação, mantendo filtros customizados
      loadDataWithFilters({ sortField: field, sortDirection: direction });
    }
  });

  // Usar ordenação do baseEntity quando disponível, senão usar local
  const sortField = baseEntity.sortField || localSortField;
  const sortDirection = baseEntity.sortDirection || localSortDirection;

  /**
   * Submissão customizada
   */
  const onSubmitCustom = useCallback(async (data) => {
    await baseEntity.onSubmit(data);
  }, [baseEntity]);

  /**
   * Exclusão customizada que recarrega dados
   */
  const handleDeleteCustom = useCallback(async () => {
    await baseEntity.handleConfirmDelete();
  }, [baseEntity]);

  /**
   * Funções auxiliares
   */
  const handleClearFilters = useCallback(() => {
    customFilters.setSearchTerm('');
    customFilters.setStatusFilter('todos');
    customFilters.updateFilter('filialFilter', 'todos');
    customFilters.updateFilter('centroCustoFilter', 'todos');
    baseEntity.handlePageChange(1);
  }, [customFilters, baseEntity]);

  const getStatusLabel = useCallback((status) => {
    return status === 1 ? 'Ativo' : 'Inativo';
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  }, []);

  /**
   * Visualizar almoxarifado (busca dados completos)
   */
  const handleViewAlmoxarifado = useCallback(async (id) => {
    try {
      baseEntity.setLoading(true);
      const response = await AlmoxarifadoService.buscarPorId(id);
      
      if (response.success && response.data) {
        baseEntity.handleView(response.data);
      } else {
        toast.error(response.message || 'Erro ao buscar almoxarifado');
      }
    } catch (error) {
      console.error('Erro ao buscar almoxarifado:', error);
      toast.error('Erro ao carregar dados do almoxarifado');
    } finally {
      baseEntity.setLoading(false);
    }
  }, [baseEntity]);

  /**
   * Editar almoxarifado (busca dados completos)
   */
  const handleEditAlmoxarifado = useCallback(async (id) => {
    try {
      baseEntity.setLoading(true);
      const response = await AlmoxarifadoService.buscarPorId(id);
      
      if (response.success && response.data) {
        baseEntity.handleEdit(response.data);
      } else {
        toast.error(response.message || 'Erro ao buscar almoxarifado');
      }
    } catch (error) {
      console.error('Erro ao buscar almoxarifado:', error);
      toast.error('Erro ao carregar dados do almoxarifado');
    } finally {
      baseEntity.setLoading(false);
    }
  }, [baseEntity]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      loadDataWithFilters();
    }
  }, [loadDataWithFilters]);

  /**
   * Carrega filiais para o filtro
   */
  const loadFiliais = useCallback(async () => {
    try {
      setLoadingFiliais(true);
      const response = await FiliaisService.buscarAtivas();
      if (response.success) {
        const items = Array.isArray(response.data) ? response.data : [];
        setFiliais(items);
      }
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
      toast.error('Erro ao carregar filiais');
      setFiliais([]);
    } finally {
      setLoadingFiliais(false);
    }
  }, []);

  /**
   * Carrega centros de custo para o filtro
   */
  const loadCentrosCusto = useCallback(async () => {
    try {
      setLoadingCentrosCusto(true);
      const response = await CentroCustoService.buscarAtivos();
      if (response.success) {
        const items = Array.isArray(response.data) ? response.data : [];
        setCentrosCusto(items);
      }
    } catch (error) {
      console.error('Erro ao carregar centros de custo:', error);
      toast.error('Erro ao carregar centros de custo');
      setCentrosCusto([]);
    } finally {
      setLoadingCentrosCusto(false);
    }
  }, []);

  // Carregar dados auxiliares ao montar o componente
  useEffect(() => {
    loadFiliais();
    loadCentrosCusto();
  }, [loadFiliais, loadCentrosCusto]);

  // Carregar dados quando filtros mudam
  useEffect(() => {
    loadDataWithFilters();
  }, [
    customFilters.searchTerm,
    customFilters.statusFilter,
    customFilters.filters.filialFilter,
    customFilters.filters.centroCustoFilter,
    baseEntity.currentPage,
    baseEntity.itemsPerPage
  ]);

  return {
    // Estados principais (do hook base)
    almoxarifados: isSortingLocally ? almoxarifadosOrdenados : baseEntity.items,
    loading: baseEntity.loading,
    
    // Estados de ordenação
    sortField,
    sortDirection,
    isSortingLocally,
    
    // Estados de busca
    estatisticas: baseEntity.estatisticas,
    
    // Estados de modal (do hook base)
    showModal: baseEntity.showModal,
    viewMode: baseEntity.viewMode,
    editingAlmoxarifado: baseEntity.editingItem,
    
    // Estados de exclusão (do hook base)
    showDeleteConfirmModal: baseEntity.showDeleteConfirmModal,
    almoxarifadoToDelete: baseEntity.itemToDelete,
    
    // Estados de paginação (do hook base)
    currentPage: baseEntity.currentPage,
    totalPages: baseEntity.totalPages,
    totalItems: baseEntity.totalItems,
    itemsPerPage: baseEntity.itemsPerPage,
    
    // Estados de filtros
    searchTerm: baseEntity.searchTerm,
    statusFilter: customFilters.statusFilter,
    filialFilter: customFilters.filters.filialFilter,
    centroCustoFilter: customFilters.filters.centroCustoFilter,
    
    // Dados auxiliares para filtros
    filiais,
    centrosCusto,
    loadingFiliais,
    loadingCentrosCusto,
    
    // Estados de validação (do hook base)
    validationErrors: baseEntity.validationErrors,
    showValidationModal: baseEntity.showValidationModal,
    
    // Ações de modal (customizadas para buscar dados completos)
    handleAddAlmoxarifado: baseEntity.handleAdd,
    handleViewAlmoxarifado,
    handleEditAlmoxarifado,
    handleCloseModal: baseEntity.handleCloseModal,
    
    // Ações de paginação (do hook base)
    handlePageChange: baseEntity.handlePageChange,
    handleItemsPerPageChange: baseEntity.handleItemsPerPageChange,
    
    // Ações de filtros
    setSearchTerm: baseEntity.setSearchTerm,
    clearSearch: baseEntity.clearSearch,
    setStatusFilter: customFilters.setStatusFilter,
    setFilialFilter: (value) => customFilters.updateFilter('filialFilter', value),
    setCentroCustoFilter: (value) => customFilters.updateFilter('centroCustoFilter', value),
    setItemsPerPage: baseEntity.handleItemsPerPageChange,
    handleClearFilters,
    handleKeyPress,
    
    // Ações de CRUD (customizadas)
    onSubmit: onSubmitCustom,
    handleDeleteAlmoxarifado: baseEntity.handleDelete,
    handleConfirmDelete: handleDeleteCustom,
    handleCloseDeleteModal: baseEntity.handleCloseDeleteModal,
    
    // Ações de validação (do hook base)
    handleCloseValidationModal: baseEntity.handleCloseValidationModal,

    // Funções utilitárias
    getStatusLabel,
    formatDate,
    
    // Ações de ordenação
    handleSort,
    
    // Função para recarregar dados
    carregarAlmoxarifados: loadDataWithFilters
  };
};

