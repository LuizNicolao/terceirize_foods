import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import UnidadesService from '../services/unidades';
import api from '../services/api';
import { useBaseEntity } from './common/useBaseEntity';
import { useFilters } from './common/useFilters';
import useTableSort from './common/useTableSort';

export const useUnidades = () => {
  const baseEntity = useBaseEntity('unidades', UnidadesService, {
    initialItemsPerPage: 20,
    initialFilters: {},
    enableStats: true,
    enableDelete: true
  });

  const customFilters = useFilters({});

  // Hook de ordenação híbrida
  const {
    sortedData: unidadesOrdenadas,
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
  
  const [estatisticasUnidades, setEstatisticasUnidades] = useState({
    total_unidades: 0,
    unidades_ativas: 0,
    unidades_inativas: 0
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
      const response = await UnidadesService.listar(params);
      
      if (response.success) {
        await baseEntity.loadData(params);
        
        if (response.statistics) {
          setEstatisticasUnidades({
            total_unidades: response.statistics.total || 0,
            unidades_ativas: response.statistics.ativos || 0,
            unidades_inativas: response.statistics.inativos || 0
          });
        } else {
          const total = response.pagination?.total || response.data?.length || 0;
          const ativos = response.data?.filter(item => item.status === 1).length || 0;
          const inativos = response.data?.filter(item => item.status === 0).length || 0;
          setEstatisticasUnidades({
            total_unidades: total,
            unidades_ativas: ativos,
            unidades_inativas: inativos
          });
        }
      } else {
        toast.error(response.message || 'Erro ao carregar unidades');
      }
    } catch (error) {
      console.error('Erro ao carregar unidades:', error);
      toast.error('Erro ao carregar unidades');
    } finally {
      setLoading(false);
    }
  }, [baseEntity, customFilters]);

  const onSubmitCustom = useCallback(async (data) => {
    const cleanData = {
      ...data,
      nome: data.nome && data.nome.trim() !== '' ? data.nome.trim() : null,
      sigla: data.sigla && data.sigla.trim() !== '' ? data.sigla.trim() : null
    };
    
    await baseEntity.onSubmit(cleanData);
    setEstatisticasUnidades(baseEntity.statistics || { total_unidades: 0, unidades_ativas: 0, unidades_inativas: 0 });
  }, [baseEntity]);

  const handleDeleteCustom = useCallback(async () => {
    await baseEntity.handleConfirmDelete();
    setEstatisticasUnidades(baseEntity.statistics || { total_unidades: 0, unidades_ativas: 0, unidades_inativas: 0 });
  }, [baseEntity]);

  useEffect(() => {
    loadDataWithFilters();
  }, [customFilters.searchTerm, customFilters.statusFilter, customFilters.filters]);
  
  useEffect(() => {
    loadDataWithFilters();
  }, [baseEntity.currentPage, baseEntity.itemsPerPage]);
  
  useEffect(() => {
    setEstatisticasUnidades(baseEntity.statistics || { total_unidades: 0, unidades_ativas: 0, unidades_inativas: 0 });
  }, [baseEntity.statistics]);

  const handleClearFilters = useCallback(() => {
    customFilters.clearFilters();
    baseEntity.handlePageChange(1);
  }, [customFilters, baseEntity]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  }, []);

  const getStatusLabel = useCallback((status) => {
    return status === 1 ? 'Ativo' : 'Inativo';
  }, []);

  return {
    unidades: isSortingLocally ? unidadesOrdenadas : baseEntity.items,
    loading,
    
    // Estados de busca
    estatisticas: estatisticasUnidades,
    showModal: baseEntity.showModal,
    viewMode: baseEntity.viewMode,
    editingUnidade: baseEntity.editingItem,
    unidade: baseEntity.editingItem, // Alias for modal compatibility
    showDeleteConfirmModal: baseEntity.showDeleteConfirmModal,
    unidadeToDelete: baseEntity.itemToDelete,
    currentPage: baseEntity.currentPage,
    totalPages: baseEntity.totalPages,
    totalItems: baseEntity.totalItems,
    itemsPerPage: baseEntity.itemsPerPage,
    searchTerm: baseEntity.searchTerm,
    statusFilter: customFilters.statusFilter,
    validationErrors: baseEntity.validationErrors,
    showValidationModal: baseEntity.showValidationModal,
    handleAddUnidade: baseEntity.handleAdd,
    handleViewUnidade: baseEntity.handleView,
    handleEditUnidade: baseEntity.handleEdit,
    handleCloseModal: baseEntity.handleCloseModal,
    handlePageChange: baseEntity.handlePageChange,
    handleItemsPerPageChange: baseEntity.handleItemsPerPageChange,
    setSearchTerm: baseEntity.setSearchTerm,
    clearSearch: baseEntity.clearSearch,
    setStatusFilter: customFilters.setStatusFilter,
    setItemsPerPage: baseEntity.handleItemsPerPageChange,
    handleClearFilters,
    onSubmit: onSubmitCustom,
    handleSubmitUnidade: onSubmitCustom,
    handleDeleteUnidade: baseEntity.handleDelete,
    handleConfirmDelete: handleDeleteCustom,
    handleCloseDeleteModal: baseEntity.handleCloseDeleteModal,
    handleCloseValidationModal: baseEntity.handleCloseValidationModal,
    formatDate,
    getStatusLabel
  };
};



