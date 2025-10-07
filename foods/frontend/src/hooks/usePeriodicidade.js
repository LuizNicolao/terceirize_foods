import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import PeriodicidadeService from '../services/periodicidade';
import { useBaseEntity } from './common/useBaseEntity';
import { useFilters } from './common/useFilters';

export const usePeriodicidade = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('periodicidade', PeriodicidadeService, {
    initialItemsPerPage: 25,
    initialFilters: {},
    enableStats: true,
    enableDelete: true
  });

  // Hook de filtros customizados para periodicidade
  const customFilters = useFilters({});


  // Estados de estatísticas específicas da periodicidade
  const [estatisticasPeriodicidade, setEstatisticasPeriodicidade] = useState({
    total_agrupamentos: 0,
    agrupamentos_ativos: 0,
    escolas_vinculadas: 0,
    produtos_vinculados: 0
  });


  /**
   * Carrega estatísticas específicas da periodicidade
   */
  const loadEstatisticasPeriodicidade = useCallback(async () => {
    try {
      const result = await PeriodicidadeService.buscarEstatisticas();
      if (result.success) {
        setEstatisticasPeriodicidade(result.data || {
          total_agrupamentos: 0,
          agrupamentos_ativos: 0,
          escolas_vinculadas: 0,
          produtos_vinculados: 0
        });
      } else {
        console.error('Erro ao carregar estatísticas:', result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }, []);

  /**
   * Carrega dados com filtros customizados
   */
  const loadDataWithFilters = useCallback(async () => {
    const params = {
      page: baseEntity.currentPage,
      limit: baseEntity.itemsPerPage,
      search: customFilters.searchTerm || undefined,
      ativo: customFilters.statusFilter === 'ativo' ? 'true' : customFilters.statusFilter === 'inativo' ? 'false' : undefined
    };

    await baseEntity.loadData(params);
  }, [baseEntity, customFilters]);

  /**
   * Submissão customizada que recarrega estatísticas
   */
  const onSubmitCustom = useCallback(async (formData) => {
    await baseEntity.onSubmit(formData);
    // Recarregar estatísticas após salvar
    await loadEstatisticasPeriodicidade();
  }, [baseEntity, loadEstatisticasPeriodicidade]);

  /**
   * Exclusão customizada que recarrega estatísticas
   */
  const handleDeleteCustom = useCallback(async () => {
    await baseEntity.handleConfirmDelete();
    // Recarregar estatísticas após excluir
    await loadEstatisticasPeriodicidade();
  }, [baseEntity, loadEstatisticasPeriodicidade]);

  /**
   * Edição customizada que busca dados completos do agrupamento
   */
  const handleEditAgrupamentoCustom = useCallback(async (agrupamento) => {
    try {
      // Buscar dados completos do agrupamento (incluindo escolas e produtos vinculados)
      const result = await PeriodicidadeService.buscarAgrupamentoPorId(agrupamento.id);
      if (result.success) {
        baseEntity.handleEdit(result.data);
      } else {
        console.error('Erro ao buscar dados completos do agrupamento:', result.error);
        // Fallback para dados da lista
        baseEntity.handleEdit(agrupamento);
      }
    } catch (error) {
      console.error('Erro ao buscar dados completos do agrupamento:', error);
      // Fallback para dados da lista
      baseEntity.handleEdit(agrupamento);
    }
  }, [baseEntity]);

  /**
   * Visualização customizada que busca dados completos do agrupamento
   */
  const handleViewAgrupamentoCustom = useCallback(async (agrupamento) => {
    try {
      // Buscar dados completos do agrupamento (incluindo escolas e produtos vinculados)
      const result = await PeriodicidadeService.buscarAgrupamentoPorId(agrupamento.id);
      if (result.success) {
        baseEntity.handleView(result.data);
      } else {
        console.error('Erro ao buscar dados completos do agrupamento:', result.error);
        // Fallback para dados da lista
        baseEntity.handleView(agrupamento);
      }
    } catch (error) {
      console.error('Erro ao buscar dados completos do agrupamento:', error);
      // Fallback para dados da lista
      baseEntity.handleView(agrupamento);
    }
  }, [baseEntity]);

  /**
   * Função para recarregar dados
   */
  const reloadData = useCallback(async () => {
    await loadDataWithFilters();
    await loadEstatisticasPeriodicidade();
  }, [loadDataWithFilters, loadEstatisticasPeriodicidade]);

  /**
   * Funções utilitárias
   */
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    loadEstatisticasPeriodicidade();
  }, [loadEstatisticasPeriodicidade]);

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
    agrupamentos: baseEntity.items,
    loading: baseEntity.loading,
    
    estatisticas: estatisticasPeriodicidade, // Usar estatísticas específicas da periodicidade
    
    // Estados de modal (do hook base)
    showModal: baseEntity.showModal,
    viewMode: baseEntity.viewMode,
    editingAgrupamento: baseEntity.editingItem,
    
    // Estados de exclusão (do hook base)
    showDeleteConfirmModal: baseEntity.showDeleteConfirmModal,
    agrupamentoToDelete: baseEntity.itemToDelete,
    
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
    
    // Ações de modal (customizadas)
    handleAddAgrupamento: baseEntity.handleAdd,
    handleViewAgrupamento: handleViewAgrupamentoCustom,
    handleEditAgrupamento: handleEditAgrupamentoCustom,
    handleCloseModal: baseEntity.handleCloseModal,
    
    // Ações de paginação (do hook base)
    handlePageChange: baseEntity.handlePageChange,
    handleItemsPerPageChange: baseEntity.handleItemsPerPageChange,
    
    // Ações de filtros
    setSearchTerm: baseEntity.setSearchTerm,
    clearSearch: baseEntity.clearSearch,
    setStatusFilter: customFilters.setStatusFilter,
    
    // Ações de CRUD (customizadas)
    onSubmit: onSubmitCustom,
    handleDeleteAgrupamento: baseEntity.handleDelete,
    handleConfirmDelete: handleDeleteCustom,
    handleCloseDeleteModal: baseEntity.handleCloseDeleteModal,
    reloadData,
    
    // Ações de validação (do hook base)
    handleCloseValidationModal: baseEntity.handleCloseValidationModal,
    
    // Funções utilitárias
    formatDate
  };
};
