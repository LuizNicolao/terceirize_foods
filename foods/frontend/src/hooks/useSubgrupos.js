import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import SubgruposService from '../services/subgrupos';
import GruposService from '../services/grupos';
import { useBaseEntity } from './common/useBaseEntity';
import { useFilters } from './common/useFilters';

export const useSubgrupos = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('subgrupos', SubgruposService, {
    initialItemsPerPage: 20,
    initialFilters: {},
    enableStats: true,
    enableDelete: true
  });

  // Hook de filtros customizados para subgrupos
  const customFilters = useFilters({});

  // Hook de busca com debounce
  const debouncedSearch = useDebouncedSearch(500);

  // Estados de dados auxiliares
  const [grupos, setGrupos] = useState([]);
  const [loadingGrupos, setLoadingGrupos] = useState(false);

  // Estados de estatísticas específicas dos subgrupos
  const [estatisticasSubgrupos, setEstatisticasSubgrupos] = useState({
    total_subgrupos: 0,
    subgrupos_ativos: 0,
    subgrupos_inativos: 0,
    produtos_total: 0
  });

  /**
   * Calcula estatísticas específicas dos subgrupos
   */
  const calculateEstatisticas = useCallback((subgrupos) => {
    if (!subgrupos || subgrupos.length === 0) {
      setEstatisticasSubgrupos({
        total_subgrupos: 0,
        subgrupos_ativos: 0,
        subgrupos_inativos: 0,
        produtos_total: 0
      });
      return;
    }

    const total = subgrupos.length;
    const ativos = subgrupos.filter(sg => sg.status === 'ativo').length;
    const inativos = subgrupos.filter(sg => sg.status === 'inativo').length;
    const produtos = subgrupos.reduce((acc, subgrupo) => acc + (subgrupo.total_produtos || 0), 0);

    setEstatisticasSubgrupos({
      total_subgrupos: total,
      subgrupos_ativos: ativos,
      subgrupos_inativos: inativos,
      produtos_total: produtos
    });
  }, []);

  /**
   * Carrega dados auxiliares (grupos)
   */
  const loadAuxiliaryData = useCallback(async () => {
    try {
      setLoadingGrupos(true);
      const result = await GruposService.buscarAtivos();
      if (result.success) {
        setGrupos(result.data || []);
      }
    } catch (error) {
      toast.error('Erro ao carregar grupos');
    } finally {
      setLoadingGrupos(false);
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
      grupo_id: customFilters.grupoFilter === 'todos' ? undefined : customFilters.grupoFilter
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
      grupo_id: data.grupo_id ? parseInt(data.grupo_id) : null,
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
    customFilters.setGrupoFilter('todos');
    baseEntity.setCurrentPage(1);
  }, [customFilters, baseEntity]);

  const getStatusLabel = useCallback((status) => {
    return status === 'ativo' ? 'Ativo' : 'Inativo';
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  }, []);

  const getGrupoNome = useCallback((grupoId) => {
    const grupo = grupos.find(g => g.id === grupoId);
    return grupo ? grupo.nome : 'N/A';
  }, [grupos]);

  // Carregar dados auxiliares na inicialização
  useEffect(() => {
    loadAuxiliaryData();
  }, [loadAuxiliaryData]);

  // Carregar dados quando filtros mudam
  useEffect(() => {
    loadDataWithFilters();
  }, [customFilters.searchTerm, customFilters.statusFilter, customFilters.grupoFilter, customFilters.filters]);

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
    subgrupos: baseEntity.items,
    loading: baseEntity.loading,
    
    // Estados de busca
    searchTerm: debouncedSearch.searchTerm,
    isSearching: debouncedSearch.isSearching,
    estatisticas: estatisticasSubgrupos, // Usar estatísticas específicas dos subgrupos
    
    // Estados de modal (do hook base)
    showModal: baseEntity.showModal,
    viewMode: baseEntity.viewMode,
    editingSubgrupo: baseEntity.editingItem,
    
    // Estados de exclusão (do hook base)
    showDeleteConfirmModal: baseEntity.showDeleteConfirmModal,
    subgrupoToDelete: baseEntity.itemToDelete,
    
    // Estados de paginação (do hook base)
    currentPage: baseEntity.currentPage,
    totalPages: baseEntity.totalPages,
    totalItems: baseEntity.totalItems,
    itemsPerPage: baseEntity.itemsPerPage,
    
    // Estados de filtros
    searchTerm: customFilters.searchTerm,
    statusFilter: customFilters.statusFilter,
    grupoFilter: customFilters.grupoFilter,
    
    // Estados de validação (do hook base)
    validationErrors: baseEntity.validationErrors,
    showValidationModal: baseEntity.showValidationModal,
    
    // Estados de dados auxiliares
    grupos: Array.isArray(grupos) ? grupos : [],
    loadingGrupos,
    
    // Ações de modal (do hook base)
    handleAddSubgrupo: baseEntity.handleAdd,
    handleViewSubgrupo: baseEntity.handleView,
    handleEditSubgrupo: baseEntity.handleEdit,
    handleCloseModal: baseEntity.handleCloseModal,
    
    // Ações de paginação (do hook base)
    handlePageChange: baseEntity.handlePageChange,
    handleItemsPerPageChange: baseEntity.handleItemsPerPageChange,
    
    // Ações de filtros
    setSearchTerm: debouncedSearch.updateSearchTerm,
    clearSearch: debouncedSearch.clearSearch,
    setStatusFilter: customFilters.setStatusFilter,
    setGrupoFilter: customFilters.setGrupoFilter,
    setItemsPerPage: baseEntity.handleItemsPerPageChange, // Alias para compatibilidade
    handleClearFilters,
    
    // Ações de CRUD (customizadas)
    onSubmit: onSubmitCustom,
    handleDeleteSubgrupo: baseEntity.handleDelete,
    handleConfirmDelete: handleDeleteCustom,
    handleCloseDeleteModal: baseEntity.handleCloseDeleteModal,
    
    // Ações de validação (do hook base)
    handleCloseValidationModal: baseEntity.handleCloseValidationModal,
    
    // Funções utilitárias
    getStatusLabel,
    formatDate,
    getGrupoNome
  };
};
