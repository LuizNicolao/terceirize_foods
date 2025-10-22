import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import IntoleranciasService from '../services/intolerancias';
import api from '../services/api';
import { useBaseEntity } from './common/useBaseEntity';
import { useFilters } from './common/useFilters';
import useTableSort from './common/useTableSort';

export const useIntolerancias = () => {
  const baseEntity = useBaseEntity('intolerancias', IntoleranciasService, {
    initialItemsPerPage: 20,
    initialFilters: {},
    enableStats: true,
    enableDelete: true
  });

  const customFilters = useFilters({});

  // Hook de ordenação híbrida
  const {
    sortedData: intoleranciasOrdenadas,
    sortField,
    sortDirection,
    handleSort,
    isSortingLocally
  } = useTableSort({
    data: baseEntity.items,
    threshold: 100,
    totalItems: baseEntity.totalItems
  });

  // Hook de busca com debounce
  
  const [loading, setLoading] = useState(false);
  
  const [estatisticasIntolerancias, setEstatisticasIntolerancias] = useState({
    total_intolerancias: 0,
    intolerancias_ativas: 0,
    intolerancias_inativas: 0,
    nomes_unicos: 0
  });

  const loadDataWithFilters = useCallback(async () => {
    const params = {
      ...baseEntity.getPaginationParams(),
      ...customFilters.getFilterParams(),
      search: customFilters.searchTerm || undefined,
      status: customFilters.statusFilter === 'ativo' ? 1 : customFilters.statusFilter === 'inativo' ? 0 : undefined
    };

    setLoading(true);
    try {
      const response = await IntoleranciasService.listar(params);
      
      if (response.success) {
        await baseEntity.loadData(params);
        
        if (response.statistics) {
          setEstatisticasIntolerancias({
            total_intolerancias: response.statistics.total || 0,
            intolerancias_ativas: response.statistics.ativos || 0,
            intolerancias_inativas: response.statistics.inativos || 0,
            nomes_unicos: response.statistics.nomes_unicos || 0
          });
        } else {
          const total = response.pagination?.total || response.data?.length || 0;
          const ativos = response.data?.filter(item => item.status === 1).length || 0;
          const inativos = response.data?.filter(item => item.status === 0).length || 0;
          setEstatisticasIntolerancias({
            total_intolerancias: total,
            intolerancias_ativas: ativos,
            intolerancias_inativas: inativos,
            nomes_unicos: 0
          });
        }
      } else {
        toast.error(response.message || 'Erro ao carregar intolerâncias');
      }
    } catch (error) {
      console.error('Erro ao carregar intolerâncias:', error);
      toast.error('Erro ao carregar intolerâncias');
    } finally {
      setLoading(false);
    }
  }, [baseEntity, customFilters]);

  const onSubmitCustom = useCallback(async (data) => {
    const cleanData = {
      ...data,
      nome: data.nome && data.nome.trim() !== '' ? data.nome.trim() : null
    };
    
    await baseEntity.onSubmit(cleanData);
    setEstatisticasIntolerancias(baseEntity.statistics || { total_intolerancias: 0, intolerancias_ativas: 0, intolerancias_inativas: 0, nomes_unicos: 0 });
  }, [baseEntity]);

  const handleDeleteCustom = useCallback(async () => {
    await baseEntity.handleConfirmDelete();
    setEstatisticasIntolerancias(baseEntity.statistics || { total_intolerancias: 0, intolerancias_ativas: 0, intolerancias_inativas: 0, nomes_unicos: 0 });
  }, [baseEntity]);

  useEffect(() => {
    loadDataWithFilters();
  }, [customFilters.searchTerm, customFilters.statusFilter, customFilters.filters]);
  
  useEffect(() => {
    loadDataWithFilters();
  }, [baseEntity.currentPage, baseEntity.itemsPerPage]);
  
  useEffect(() => {
    setEstatisticasIntolerancias(baseEntity.statistics || { total_intolerancias: 0, intolerancias_ativas: 0, intolerancias_inativas: 0, nomes_unicos: 0 });
  }, [baseEntity.statistics]);

  const handleClearFilters = useCallback(() => {
    customFilters.clearFilters();
    baseEntity.handlePageChange(1);
  }, [customFilters, baseEntity]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  }, []);

  return {
    intolerancias: isSortingLocally ? intoleranciasOrdenadas : baseEntity.items,
    loading,
    
    // Estados de busca
    estatisticas: estatisticasIntolerancias,
    showModal: baseEntity.showModal,
    viewMode: baseEntity.viewMode,
    editingIntolerancia: baseEntity.editingItem,
    intolerancia: baseEntity.editingItem, // Alias for modal compatibility
    showDeleteConfirmModal: baseEntity.showDeleteConfirmModal,
    intoleranciaToDelete: baseEntity.itemToDelete,
    currentPage: baseEntity.currentPage,
    totalPages: baseEntity.totalPages,
    totalItems: baseEntity.totalItems,
    itemsPerPage: baseEntity.itemsPerPage,
    searchTerm: baseEntity.searchTerm,
    statusFilter: customFilters.statusFilter,
    validationErrors: baseEntity.validationErrors,
    showValidationModal: baseEntity.showValidationModal,
    handleAddIntolerancia: baseEntity.handleAdd,
    handleViewIntolerancia: baseEntity.handleView,
    handleEditIntolerancia: baseEntity.handleEdit,
    handleCloseModal: baseEntity.handleCloseModal,
    handlePageChange: baseEntity.handlePageChange,
    handleItemsPerPageChange: baseEntity.handleItemsPerPageChange,
    setSearchTerm: baseEntity.setSearchTerm,
    clearSearch: baseEntity.clearSearch,
    setStatusFilter: customFilters.setStatusFilter,
    setItemsPerPage: baseEntity.handleItemsPerPageChange,
    handleClearFilters,
    onSubmit: onSubmitCustom,
    handleSubmitIntolerancia: onSubmitCustom,
    handleDeleteIntolerancia: baseEntity.handleDelete,
    handleConfirmDelete: handleDeleteCustom,
    handleCloseDeleteModal: baseEntity.handleCloseDeleteModal,
    handleCloseValidationModal: baseEntity.handleCloseValidationModal,
    formatDate,
    
    // Ações de ordenação
    handleSort
  };
};
