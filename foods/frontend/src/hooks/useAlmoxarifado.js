import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import AlmoxarifadoService from '../services/almoxarifadoService';
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

  // Hook de ordenação híbrida
  const {
    sortedData: almoxarifadosOrdenados,
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
      status: customFilters.statusFilter === 'ativo' ? 1 : customFilters.statusFilter === 'inativo' ? 0 : undefined,
      filial_id: customFilters.filters.filialFilter !== 'todos' ? customFilters.filters.filialFilter : undefined,
      centro_custo_id: customFilters.filters.centroCustoFilter !== 'todos' ? customFilters.filters.centroCustoFilter : undefined
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

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      loadDataWithFilters();
    }
  }, [loadDataWithFilters]);

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
    
    // Estados de validação (do hook base)
    validationErrors: baseEntity.validationErrors,
    showValidationModal: baseEntity.showValidationModal,
    
    // Ações de modal (do hook base)
    handleAddAlmoxarifado: baseEntity.handleAdd,
    handleViewAlmoxarifado: baseEntity.handleView,
    handleEditAlmoxarifado: baseEntity.handleEdit,
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

