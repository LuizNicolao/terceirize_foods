import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import MotoristasService from '../services/motoristas';
import FiliaisService from '../services/filiais';
import { useBaseEntity } from './common/useBaseEntity';
import { useFilters } from './common/useFilters';
import useTableSort from './common/useTableSort';

export const useMotoristas = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('motoristas', MotoristasService, {
    initialItemsPerPage: 20,
    initialFilters: {},
    enableStats: true,
    enableDelete: true
  });

  // Hook de filtros customizados para motoristas
  const customFilters = useFilters({});

  // Hook de busca com debounce

  // Estados específicos dos motoristas
  const [filiais, setFiliais] = useState([]);

  // Estados de estatísticas específicas dos motoristas
  const [estatisticasMotoristas, setEstatisticasMotoristas] = useState({
    total_motoristas: 0,
    motoristas_ativos: 0,
    em_ferias: 0,
    em_licenca: 0
  });

  /**
   * Carrega filiais ativas
   */
  const loadFiliais = useCallback(async () => {
    try {
      const result = await FiliaisService.buscarAtivas();
      if (result.success) {
        setFiliais(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
    }
  }, []);

  /**
   * Calcula estatísticas específicas dos motoristas
   */
  const calculateEstatisticas = useCallback((motoristas) => {
    if (!motoristas || motoristas.length === 0) {
      setEstatisticasMotoristas({
        total_motoristas: 0,
        motoristas_ativos: 0,
        em_ferias: 0,
        em_licenca: 0
      });
      return;
    }

    const total = motoristas.length;
    const ativos = motoristas.filter(m => m.status === 'ativo').length;
    const ferias = motoristas.filter(m => m.status === 'ferias').length;
    const licenca = motoristas.filter(m => m.status === 'licenca').length;

    setEstatisticasMotoristas({
      total_motoristas: total,
      motoristas_ativos: ativos,
      em_ferias: ferias,
      em_licenca: licenca
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
   * Submissão customizada que recarrega dados
   */
  const onSubmitCustom = useCallback(async (formData) => {
    await baseEntity.onSubmit(formData);
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
   * Handlers de exportação
   */
  const handleExportXLSX = useCallback(async () => {
    try {
      await MotoristasService.exportarXLSX();
      toast.success('Exportação XLSX iniciada!');
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      toast.error('Erro ao exportar XLSX');
    }
  }, []);

  const handleExportPDF = useCallback(async () => {
    try {
      await MotoristasService.exportarPDF();
      toast.success('Exportação PDF iniciada!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar PDF');
    }
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    loadFiliais();
  }, [loadFiliais]);

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
    motoristas: baseEntity.items,
    loading: baseEntity.loading,
    
    // Estados de busca
    estatisticas: estatisticasMotoristas, // Usar estatísticas específicas dos motoristas
    
    // Estados de modal (do hook base)
    showModal: baseEntity.showModal,
    viewMode: baseEntity.viewMode,
    editingMotorista: baseEntity.editingItem,
    
    // Estados de exclusão (do hook base)
    showDeleteConfirmModal: baseEntity.showDeleteConfirmModal,
    motoristaToDelete: baseEntity.itemToDelete,
    
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
    
    // Estados específicos dos motoristas
    filiais,
    
    // Ações de modal (do hook base)
    handleAddMotorista: baseEntity.handleAdd,
    handleViewMotorista: baseEntity.handleView,
    handleEditMotorista: baseEntity.handleEdit,
    handleCloseModal: baseEntity.handleCloseModal,
    
    // Ações de paginação (do hook base)
    handlePageChange: baseEntity.handlePageChange,
    handleItemsPerPageChange: baseEntity.handleItemsPerPageChange,
    
    // Ações de filtros
    setSearchTerm: baseEntity.setSearchTerm,
    clearSearch: baseEntity.clearSearch,
    setStatusFilter: customFilters.setStatusFilter,
    
    // Ações de CRUD (customizadas)
    handleSubmit: onSubmitCustom,
    handleDelete: baseEntity.handleDelete,
    handleConfirmDelete: handleDeleteCustom,
    handleCloseDeleteModal: baseEntity.handleCloseDeleteModal,
    
    // Ações de validação (do hook base)
    handleCloseValidationModal: baseEntity.handleCloseValidationModal,
    
    // Ações de exportação
    handleExportXLSX,
    handleExportPDF
  };
};