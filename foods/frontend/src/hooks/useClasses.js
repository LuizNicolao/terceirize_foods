import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import ClassesService from '../services/classes';
import SubgruposService from '../services/subgrupos';
import { useBaseEntity } from './common/useBaseEntity';
import { useFilters } from './common/useFilters';

export const useClasses = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('classes', ClassesService, {
    initialItemsPerPage: 20,
    initialFilters: {},
    enableStats: true,
    enableDelete: true
  });

  // Hook de filtros customizados para classes
  const customFilters = useFilters({});

  // Hook de busca com debounce

  // Estados de dados auxiliares
  const [subgrupos, setSubgrupos] = useState([]);
  const [loadingSubgrupos, setLoadingSubgrupos] = useState(false);

  // Estados de estatísticas específicas das classes
  const [estatisticasClasses, setEstatisticasClasses] = useState({
    total_classes: 0,
    classes_ativas: 0,
    classes_inativas: 0,
    produtos_total: 0
  });

  /**
   * Calcula estatísticas específicas das classes
   */
  const calculateEstatisticas = useCallback((classes) => {
    if (!classes || classes.length === 0) {
      setEstatisticasClasses({
        total_classes: 0,
        classes_ativas: 0,
        classes_inativas: 0,
        produtos_total: 0
      });
      return;
    }

    const total = classes.length;
    const ativas = classes.filter(c => c.status === 'ativo').length;
    const inativas = classes.filter(c => c.status === 'inativo').length;
    const produtos = classes.reduce((acc, classe) => acc + (classe.total_produtos || 0), 0);

    setEstatisticasClasses({
          total_classes: total,
          classes_ativas: ativas,
          classes_inativas: inativas,
          produtos_total: produtos
        });
  }, []);

  /**
   * Carrega dados auxiliares (subgrupos)
   */
  const loadAuxiliaryData = useCallback(async () => {
    try {
      setLoadingSubgrupos(true);
      const result = await SubgruposService.buscarAtivos();
      if (result.success) {
        setSubgrupos(result.data || []);
      } else {
        toast.error('Erro ao carregar subgrupos');
      }
    } catch (error) {
      toast.error('Erro ao carregar subgrupos');
    } finally {
      setLoadingSubgrupos(false);
    }
  }, []);

  /**
   * Carrega dados com filtros customizados
   */
  const loadDataWithFilters = useCallback(async () => {
    const params = {
      ...baseEntity.getPaginationParams(),
      ...customFilters.getFilterParams(),
      search: customFilters.searchTerm || undefined,
      status: customFilters.statusFilter === 'ativo' ? 'ativo' : customFilters.statusFilter === 'inativo' ? 'inativo' : undefined,
      subgrupo_id: customFilters.subgrupoFilter === 'todos' ? undefined : customFilters.subgrupoFilter
    };

    await baseEntity.loadData(params);
  }, [baseEntity, customFilters]);

  /**
   * Submissão customizada
   */
  const onSubmitCustom = useCallback(async (data) => {
    // Limpar e normalizar dados antes de enviar
      const cleanData = {
        ...data,
        nome: data.nome && data.nome.trim() !== '' ? data.nome.trim() : null,
        descricao: data.descricao && data.descricao.trim() !== '' ? data.descricao.trim() : null,
        subgrupo_id: data.subgrupo_id ? parseInt(data.subgrupo_id) : null,
      status: data.status === '1' || data.status === 'Ativo' ? 'ativo' : 'inativo'
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
   * Funções auxiliares
   */
  const handleClearFilters = useCallback(() => {
    customFilters.setSearchTerm('');
    customFilters.setStatusFilter('todos');
    customFilters.setSubgrupoFilter('todos');
    baseEntity.setCurrentPage(1);
  }, [customFilters, baseEntity]);

  const getStatusLabel = useCallback((status) => {
    return status === 'ativo' ? 'Ativo' : 'Inativo';
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  }, []);

  const getSubgrupoNome = useCallback((subgrupoId) => {
    const subgrupo = subgrupos.find(s => s.id === subgrupoId);
    return subgrupo ? subgrupo.nome : 'N/A';
  }, [subgrupos]);

  // Carregar dados auxiliares na inicialização
  useEffect(() => {
    loadAuxiliaryData();
  }, [loadAuxiliaryData]);

  // Carregar dados quando filtros mudam
  useEffect(() => {
    loadDataWithFilters();
  }, [customFilters.searchTerm, customFilters.statusFilter, customFilters.subgrupoFilter, customFilters.filters]);

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
    classes: baseEntity.items,
    loading: baseEntity.loading,
    
    // Estados de busca
    estatisticas: estatisticasClasses, // Usar estatísticas específicas das classes
    
    // Estados de modal (do hook base)
    showModal: baseEntity.showModal,
    viewMode: baseEntity.viewMode,
    editingClasse: baseEntity.editingItem,
    
    // Estados de exclusão (do hook base)
    showDeleteConfirmModal: baseEntity.showDeleteConfirmModal,
    classeToDelete: baseEntity.itemToDelete,
    
    // Estados de paginação (do hook base)
    currentPage: baseEntity.currentPage,
    totalPages: baseEntity.totalPages,
    totalItems: baseEntity.totalItems,
    itemsPerPage: baseEntity.itemsPerPage,
    
    // Estados de filtros
    searchTerm: baseEntity.searchTerm,
    statusFilter: customFilters.statusFilter,
    subgrupoFilter: customFilters.subgrupoFilter,
    
    // Estados de validação (do hook base)
    validationErrors: baseEntity.validationErrors,
    showValidationModal: baseEntity.showValidationModal,
    
    // Estados de dados auxiliares
    subgrupos: Array.isArray(subgrupos) ? subgrupos : [],
    loadingSubgrupos,
    
    // Ações de modal (do hook base)
    handleAddClasse: baseEntity.handleAdd,
    handleViewClasse: baseEntity.handleView,
    handleEditClasse: baseEntity.handleEdit,
    handleCloseModal: baseEntity.handleCloseModal,
    
    // Ações de paginação (do hook base)
    handlePageChange: baseEntity.handlePageChange,
    handleItemsPerPageChange: baseEntity.handleItemsPerPageChange,
    
    // Ações de filtros
    setSearchTerm: baseEntity.setSearchTerm,
    clearSearch: baseEntity.clearSearch,
    handleKeyPress: baseEntity.handleKeyPress,
    setStatusFilter: customFilters.setStatusFilter,
    setSubgrupoFilter: customFilters.setSubgrupoFilter,
    setItemsPerPage: baseEntity.handleItemsPerPageChange, // Alias para compatibilidade
    handleClearFilters,
    
    // Ações de CRUD (customizadas)
    onSubmit: onSubmitCustom,
    handleDeleteClasse: baseEntity.handleDelete,
    handleConfirmDelete: handleDeleteCustom,
    handleCloseDeleteModal: baseEntity.handleCloseDeleteModal,
    
    // Ações de validação (do hook base)
    handleCloseValidationModal: baseEntity.handleCloseValidationModal,

    // Funções utilitárias
    getStatusLabel,
    formatDate,
    getSubgrupoNome
  };
};
