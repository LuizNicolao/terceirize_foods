import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import MarcasService from '../services/marcas';
import api from '../services/api';
import { useBaseEntity } from './common/useBaseEntity';
import { useFilters } from './common/useFilters';

export const useMarcas = () => {
  const baseEntity = useBaseEntity('marcas', MarcasService, {
    initialItemsPerPage: 20,
    initialFilters: {},
    enableStats: true,
    enableDelete: true
  });

  const customFilters = useFilters({});
  
  const [loading, setLoading] = useState(false);
  
  const [estatisticasMarcas, setEstatisticasMarcas] = useState({
    total_marcas: 0,
    marcas_ativas: 0,
    marcas_inativas: 0
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
      const response = await MarcasService.listar(params);
      
      if (response.success) {
        await baseEntity.loadData(params);
        
        if (response.statistics) {
          setEstatisticasMarcas({
            total_marcas: response.statistics.total || 0,
            marcas_ativas: response.statistics.ativos || 0,
            marcas_inativas: response.statistics.inativos || 0
          });
        } else {
          const total = response.pagination?.total || response.data?.length || 0;
          const ativos = response.data?.filter(item => item.status === 1).length || 0;
          const inativos = response.data?.filter(item => item.status === 0).length || 0;
          setEstatisticasMarcas({
            total_marcas: total,
            marcas_ativas: ativos,
            marcas_inativas: inativos
          });
        }
      } else {
        toast.error(response.message || 'Erro ao carregar marcas');
      }
    } catch (error) {
      console.error('Erro ao carregar marcas:', error);
      toast.error('Erro ao carregar marcas');
    } finally {
      setLoading(false);
    }
  }, [baseEntity, customFilters]);

  const onSubmitCustom = useCallback(async (data) => {
    const cleanData = {
      ...data,
      marca: data.marca && data.marca.trim() !== '' ? data.marca.trim() : null,
      fabricante: data.fabricante && data.fabricante.trim() !== '' ? data.fabricante.trim() : null
    };
    
    await baseEntity.onSubmit(cleanData);
    setEstatisticasMarcas(baseEntity.statistics || { total_marcas: 0, marcas_ativas: 0, marcas_inativas: 0 });
  }, [baseEntity]);

  const handleDeleteCustom = useCallback(async () => {
    await baseEntity.handleConfirmDelete();
    setEstatisticasMarcas(baseEntity.statistics || { total_marcas: 0, marcas_ativas: 0, marcas_inativas: 0 });
  }, [baseEntity]);

  useEffect(() => {
    loadDataWithFilters();
  }, [customFilters.searchTerm, customFilters.statusFilter, customFilters.filters]);
  
  useEffect(() => {
    loadDataWithFilters();
  }, [baseEntity.currentPage, baseEntity.itemsPerPage]);
  
  useEffect(() => {
    setEstatisticasMarcas(baseEntity.statistics || { total_marcas: 0, marcas_ativas: 0, marcas_inativas: 0 });
  }, [baseEntity.statistics]);

  const handleClearFilters = useCallback(() => {
    customFilters.clearFilters();
    baseEntity.setCurrentPage(1);
  }, [customFilters, baseEntity]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  }, []);

  const getStatusLabel = useCallback((status) => {
    return status === 1 ? 'Ativo' : 'Inativo';
  }, []);

  return {
    marcas: baseEntity.items,
    loading,
    estatisticas: estatisticasMarcas,
    showModal: baseEntity.showModal,
    viewMode: baseEntity.viewMode,
    editingMarca: baseEntity.editingItem,
    marca: baseEntity.editingItem, // Alias for modal compatibility
    showDeleteConfirmModal: baseEntity.showDeleteConfirmModal,
    marcaToDelete: baseEntity.itemToDelete,
    currentPage: baseEntity.currentPage,
    totalPages: baseEntity.totalPages,
    totalItems: baseEntity.totalItems,
    itemsPerPage: baseEntity.itemsPerPage,
    searchTerm: customFilters.searchTerm,
    statusFilter: customFilters.statusFilter,
    validationErrors: baseEntity.validationErrors,
    showValidationModal: baseEntity.showValidationModal,
    handleAddMarca: baseEntity.handleAdd,
    handleViewMarca: baseEntity.handleView,
    handleEditMarca: baseEntity.handleEdit,
    handleCloseModal: baseEntity.handleCloseModal,
    handlePageChange: baseEntity.handlePageChange,
    handleItemsPerPageChange: baseEntity.handleItemsPerPageChange,
    setSearchTerm: customFilters.setSearchTerm,
    setStatusFilter: customFilters.setStatusFilter,
    setItemsPerPage: baseEntity.handleItemsPerPageChange,
    handleClearFilters,
    onSubmit: onSubmitCustom,
    handleSubmitMarca: onSubmitCustom,
    handleDeleteMarca: baseEntity.handleDelete,
    handleConfirmDelete: handleDeleteCustom,
    handleCloseDeleteModal: baseEntity.handleCloseDeleteModal,
    handleCloseValidationModal: baseEntity.handleCloseValidationModal,
    formatDate,
    getStatusLabel
  };
};
