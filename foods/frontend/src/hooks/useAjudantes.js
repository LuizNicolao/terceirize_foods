import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import AjudantesService from '../services/ajudantes';
import FiliaisService from '../services/filiais';
import { useBaseEntity } from './common/useBaseEntity';
import { useFilters } from './common/useFilters';

export const useAjudantes = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('ajudantes', AjudantesService, {
    initialItemsPerPage: 20,
    initialFilters: {},
    enableStats: true,
    enableDelete: true
  });

  // Hook de filtros customizados para ajudantes
  const customFilters = useFilters({});

  // Estados específicos dos ajudantes
  const [filiais, setFiliais] = useState([]);

  // Estados de estatísticas específicas dos ajudantes
  const [estatisticasAjudantes, setEstatisticasAjudantes] = useState({
    total_ajudantes: 0,
    ajudantes_ativos: 0,
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
   * Calcula estatísticas específicas dos ajudantes
   */
  const calculateEstatisticas = useCallback((ajudantes) => {
    if (!ajudantes || ajudantes.length === 0) {
      setEstatisticasAjudantes({
        total_ajudantes: 0,
        ajudantes_ativos: 0,
        em_ferias: 0,
        em_licenca: 0
      });
      return;
    }

    const total = ajudantes.length;
    const ativos = ajudantes.filter(a => a.status === 'ativo').length;
    const ferias = ajudantes.filter(a => a.status === 'ferias').length;
    const licenca = ajudantes.filter(a => a.status === 'licenca').length;

    setEstatisticasAjudantes({
      total_ajudantes: total,
      ajudantes_ativos: ativos,
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
   * Submissão customizada com limpeza de dados
   */
  const onSubmitCustom = useCallback(async (data) => {
    // Limpar campos vazios para evitar problemas de validação
    const cleanData = {
      ...data,
      filial_id: data.filial_id && data.filial_id !== '' ? parseInt(data.filial_id) : null,
      cpf: data.cpf && data.cpf.trim() !== '' ? data.cpf.trim() : null,
      telefone: data.telefone && data.telefone.trim() !== '' ? data.telefone.trim() : null,
      email: data.email && data.email.trim() !== '' ? data.email.trim() : null,
      endereco: data.endereco && data.endereco.trim() !== '' ? data.endereco.trim() : null,
      observacoes: data.observacoes && data.observacoes.trim() !== '' ? data.observacoes.trim() : null
    };

    await baseEntity.onSubmit(cleanData);
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
   * Funções utilitárias
   */
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  }, []);

  const getStatusLabel = useCallback((status) => {
    const statusMap = {
      ativo: 'Ativo',
      inativo: 'Inativo',
      ferias: 'Em Férias',
      licenca: 'Em Licença'
    };
    return statusMap[status] || status;
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
    ajudantes: baseEntity.items,
    loading: baseEntity.loading,
    
    // Estados de busca
    estatisticas: estatisticasAjudantes, // Usar estatísticas específicas dos ajudantes
    
    // Estados de modal (do hook base)
    showModal: baseEntity.showModal,
    viewMode: baseEntity.viewMode,
    editingAjudante: baseEntity.editingItem,
    
    // Estados de exclusão (do hook base)
    showDeleteConfirmModal: baseEntity.showDeleteConfirmModal,
    ajudanteToDelete: baseEntity.itemToDelete,
    
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
    
    // Estados específicos dos ajudantes
    filiais,
    
    // Ações de modal (do hook base)
    handleAddAjudante: baseEntity.handleAdd,
    handleViewAjudante: baseEntity.handleView,
    handleEditAjudante: baseEntity.handleEdit,
    handleCloseModal: baseEntity.handleCloseModal,
    
    // Ações de paginação (do hook base)
    handlePageChange: baseEntity.handlePageChange,
    handleItemsPerPageChange: baseEntity.handleItemsPerPageChange,
    
    // Ações de filtros
    setSearchTerm: baseEntity.setSearchTerm,
    clearSearch: baseEntity.clearSearch,
    setStatusFilter: customFilters.setStatusFilter,
    setItemsPerPage: baseEntity.handleItemsPerPageChange, // Alias para compatibilidade
    
    // Ações de CRUD (customizadas)
    onSubmit: onSubmitCustom,
    handleDeleteAjudante: baseEntity.handleDelete,
    handleConfirmDelete: handleDeleteCustom,
    handleCloseDeleteModal: baseEntity.handleCloseDeleteModal,
    
    // Ações de validação (do hook base)
    handleCloseValidationModal: baseEntity.handleCloseValidationModal,
    
    // Funções utilitárias
    formatDate,
    getStatusLabel
  };
};