import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import CentroCustoService from '../services/centroCusto';
import { useBaseEntity } from './common/useBaseEntity';
import { useFilters } from './common/useFilters';
import useTableSort from './common/useTableSort';

export const useCentroCusto = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('centro_custo', CentroCustoService, {
    initialItemsPerPage: 20,
    initialFilters: {},
    enableStats: true,
    enableDelete: true
  });

  // Hook de filtros customizados
  const customFilters = useFilters({});

  // Hook de ordenação híbrida
  const {
    sortedData: centrosCustoOrdenados,
    sortField,
    sortDirection,
    handleSort,
    isSortingLocally
  } = useTableSort({
    data: baseEntity.items,
    threshold: 100,
    totalItems: baseEntity.totalItems
  });

  /**
   * Carrega dados com filtros customizados
   */
  const loadDataWithFilters = useCallback(async () => {
    const params = {
      ...baseEntity.getPaginationParams(),
      ...customFilters.getFilterParams(),
      search: customFilters.searchTerm || undefined,
      status: customFilters.statusFilter === 'ativo' ? 1 : customFilters.statusFilter === 'inativo' ? 0 : undefined
    };

    await baseEntity.loadData(params);
  }, [baseEntity, customFilters]);

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
    baseEntity.handlePageChange(1);
  }, [customFilters, baseEntity]);

  /**
   * Handle KeyPress para aplicar busca quando Enter é pressionado
   */
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Atualizar o searchTerm do customFilters com o valor do baseEntity
      customFilters.setSearchTerm(baseEntity.searchTerm || '');
      baseEntity.handlePageChange(1); // Reset para primeira página
    }
  }, [baseEntity, customFilters]);

  const getStatusLabel = useCallback((status) => {
    return status === 1 ? 'Ativo' : 'Inativo';
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  }, []);

  /**
   * Visualizar centro de custo (busca dados completos)
   */
  const handleViewCentroCusto = useCallback(async (id) => {
    try {
      baseEntity.setLoading(true);
      const response = await CentroCustoService.buscarPorId(id);
      
      if (response.success && response.data) {
        baseEntity.handleView(response.data);
      } else {
        toast.error(response.message || 'Erro ao buscar centro de custo');
      }
    } catch (error) {
      console.error('Erro ao buscar centro de custo:', error);
      toast.error('Erro ao carregar dados do centro de custo');
    } finally {
      baseEntity.setLoading(false);
    }
  }, [baseEntity]);

  /**
   * Editar centro de custo (busca dados completos)
   */
  const handleEditCentroCusto = useCallback(async (id) => {
    try {
      baseEntity.setLoading(true);
      const response = await CentroCustoService.buscarPorId(id);
      
      if (response.success && response.data) {
        baseEntity.handleEdit(response.data);
      } else {
        toast.error(response.message || 'Erro ao buscar centro de custo');
      }
    } catch (error) {
      console.error('Erro ao buscar centro de custo:', error);
      toast.error('Erro ao carregar dados do centro de custo');
    } finally {
      baseEntity.setLoading(false);
    }
  }, [baseEntity]);

  // Carregar dados quando filtros mudam
  useEffect(() => {
    loadDataWithFilters();
  }, [customFilters.searchTerm, customFilters.statusFilter, customFilters.filters]);

  // Carregar dados quando paginação muda
  useEffect(() => {
    loadDataWithFilters();
  }, [baseEntity.currentPage, baseEntity.itemsPerPage]);

  return {
    // Estados principais (do hook base)
    centrosCusto: isSortingLocally ? centrosCustoOrdenados : baseEntity.items,
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
    editingCentroCusto: baseEntity.editingItem,
    
    // Estados de exclusão (do hook base)
    showDeleteConfirmModal: baseEntity.showDeleteConfirmModal,
    centroCustoToDelete: baseEntity.itemToDelete,
    
    // Estados de paginação (do hook base)
    currentPage: baseEntity.currentPage,
    totalPages: baseEntity.totalPages,
    totalItems: baseEntity.totalItems,
    itemsPerPage: baseEntity.itemsPerPage,
    
    // Estados de filtros
    searchTerm: baseEntity.searchTerm,
    statusFilter: customFilters.statusFilter,
    
    // Estados de validação (do hook base)
    validationErrors: baseEntity.validationErrors,
    showValidationModal: baseEntity.showValidationModal,
    
    // Ações de modal (customizadas para buscar dados completos)
    handleAddCentroCusto: baseEntity.handleAdd,
    handleViewCentroCusto,
    handleEditCentroCusto,
    handleCloseModal: baseEntity.handleCloseModal,
    
    // Ações de paginação (do hook base)
    handlePageChange: baseEntity.handlePageChange,
    handleItemsPerPageChange: baseEntity.handleItemsPerPageChange,
    
    // Ações de filtros
    setSearchTerm: baseEntity.setSearchTerm,
    clearSearch: baseEntity.clearSearch,
    handleKeyPress,
    setStatusFilter: customFilters.setStatusFilter,
    setItemsPerPage: baseEntity.handleItemsPerPageChange,
    handleClearFilters,
    
    // Ações de CRUD (customizadas)
    onSubmit: onSubmitCustom,
    handleDeleteCentroCusto: baseEntity.handleDelete,
    handleConfirmDelete: handleDeleteCustom,
    handleCloseDeleteModal: baseEntity.handleCloseDeleteModal,
    
    // Ações de validação (do hook base)
    handleCloseValidationModal: baseEntity.handleCloseValidationModal,

    // Funções utilitárias
    getStatusLabel,
    formatDate,
    
    // Ações de ordenação
    handleSort
  };
};

