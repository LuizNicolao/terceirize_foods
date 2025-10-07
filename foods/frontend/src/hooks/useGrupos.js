import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import GruposService from '../services/grupos';
import { useBaseEntity } from './common/useBaseEntity';
import { useFilters } from './common/useFilters';
import { useDebouncedSearch } from './common/useDebouncedSearch';

export const useGrupos = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('grupos', GruposService, {
    initialItemsPerPage: 20,
    initialFilters: {},
    enableStats: true,
    enableDelete: true
  });

  // Hook de filtros customizados para grupos
  const customFilters = useFilters({});

  // Hook de busca com debounce
  const debouncedSearch = useDebouncedSearch(500);

  // Estados de estatísticas específicas dos grupos
  const [estatisticasGrupos, setEstatisticasGrupos] = useState({
    total_grupos: 0,
    grupos_ativos: 0,
    grupos_inativos: 0,
    subgrupos_total: 0
  });

  /**
   * Calcula estatísticas específicas dos grupos
   */
  const calculateEstatisticas = useCallback((grupos) => {
    if (!grupos || grupos.length === 0) {
      setEstatisticasGrupos({
        total_grupos: 0,
        grupos_ativos: 0,
        grupos_inativos: 0,
        subgrupos_total: 0
      });
      return;
    }

    const total = grupos.length;
    const ativos = grupos.filter(g => g.status === 'ativo').length;
    const inativos = grupos.filter(g => g.status === 'inativo').length;
    const subgrupos = grupos.reduce((acc, grupo) => acc + (grupo.subgrupos_count || 0), 0);

    setEstatisticasGrupos({
          total_grupos: total,
          grupos_ativos: ativos,
          grupos_inativos: inativos,
          subgrupos_total: subgrupos
        });
  }, []);

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
    // Recalcular estatísticas após salvar
    calculateEstatisticas(baseEntity.items);
  }, [baseEntity, calculateEstatisticas]);

  /**
   * Exclusão customizada que recarrega dados
   */
  const handleDeleteCustom = useCallback(async () => {
    await baseEntity.handleConfirmDelete();
    // Recalcular estatísticas após excluir
    calculateEstatisticas(baseEntity.items);
  }, [baseEntity, calculateEstatisticas]);

  /**
   * Funções auxiliares
   */
  const handleClearFilters = useCallback(() => {
    customFilters.setSearchTerm('');
    customFilters.setStatusFilter('todos');
    baseEntity.setCurrentPage(1);
  }, [customFilters, baseEntity]);

  const getStatusLabel = useCallback((status) => {
    return status === 'ativo' ? 'Ativo' : 'Inativo';
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  }, []);

  // Carregar dados quando filtros mudam
  useEffect(() => {
    loadDataWithFilters();
  }, [customFilters.searchTerm, customFilters.statusFilter, customFilters.filters]);

  // Carregar dados quando paginação muda
  useEffect(() => {
    loadDataWithFilters();
  }, [baseEntity.currentPage, baseEntity.itemsPerPage]);

  // Recalcular estatísticas quando os dados mudam
  useEffect(() => {
    calculateEstatisticas(baseEntity.items);
  }, [baseEntity.items, calculateEstatisticas]);

  return {
    // Estados principais (do hook base)
    grupos: baseEntity.items,
    loading: baseEntity.loading,
    
    // Estados de busca
    searchTerm: debouncedSearch.searchTerm,
    isSearching: debouncedSearch.isSearching,
    estatisticas: estatisticasGrupos, // Usar estatísticas específicas dos grupos
    
    // Estados de modal (do hook base)
    showModal: baseEntity.showModal,
    viewMode: baseEntity.viewMode,
    editingGrupo: baseEntity.editingItem,
    
    // Estados de exclusão (do hook base)
    showDeleteConfirmModal: baseEntity.showDeleteConfirmModal,
    grupoToDelete: baseEntity.itemToDelete,
    
    // Estados de paginação (do hook base)
    currentPage: baseEntity.currentPage,
    totalPages: baseEntity.totalPages,
    totalItems: baseEntity.totalItems,
    itemsPerPage: baseEntity.itemsPerPage,
    
    // Estados de filtros
    searchTerm: customFilters.searchTerm,
    statusFilter: customFilters.statusFilter,
    
    // Estados de validação (do hook base)
    validationErrors: baseEntity.validationErrors,
    showValidationModal: baseEntity.showValidationModal,
    
    // Ações de modal (do hook base)
    handleAddGrupo: baseEntity.handleAdd,
    handleViewGrupo: baseEntity.handleView,
    handleEditGrupo: baseEntity.handleEdit,
    handleCloseModal: baseEntity.handleCloseModal,
    
    // Ações de paginação (do hook base)
    handlePageChange: baseEntity.handlePageChange,
    handleItemsPerPageChange: baseEntity.handleItemsPerPageChange,
    
    // Ações de filtros
    setSearchTerm: debouncedSearch.updateSearchTerm,
    clearSearch: debouncedSearch.clearSearch,
    setStatusFilter: customFilters.setStatusFilter,
    setItemsPerPage: baseEntity.handleItemsPerPageChange, // Alias para compatibilidade
    handleClearFilters,
    
    // Ações de CRUD (customizadas)
    onSubmit: onSubmitCustom,
    handleDeleteGrupo: baseEntity.handleDelete,
    handleConfirmDelete: handleDeleteCustom,
    handleCloseDeleteModal: baseEntity.handleCloseDeleteModal,
    
    // Ações de validação (do hook base)
    handleCloseValidationModal: baseEntity.handleCloseValidationModal,

    // Funções utilitárias
    getStatusLabel,
    formatDate
  };
};
