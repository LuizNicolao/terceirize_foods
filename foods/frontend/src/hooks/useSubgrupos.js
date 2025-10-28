import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import SubgruposService from '../services/subgrupos';
import GruposService from '../services/grupos';
import { useBaseEntity } from './common/useBaseEntity';
import useTableSort from './common/useTableSort';

export const useSubgrupos = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('subgrupos', SubgruposService, {
    initialItemsPerPage: 20,
    initialFilters: { grupoFilter: 'todos' },
    enableStats: true,
    enableDelete: true
  });

  // Hook de ordenação híbrida
  const {
    sortedData: subgruposOrdenados,
    sortField,
    sortDirection,
    handleSort,
    isSortingLocally
  } = useTableSort({
    data: baseEntity.items,
    threshold: 100,
    totalItems: baseEntity.totalItems
  });

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
      const result = await GruposService.buscarAtivos({ limit: 1000 });
      if (result.success) {
        setGrupos(result.data || []);
      }
    } catch (error) {
      toast.error('Erro ao carregar grupos');
    } finally {
      setLoadingGrupos(false);
    }
  }, []);

  // Função loadDataWithFilters removida - useBaseEntity gerencia automaticamente

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
      status: data.status
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
    baseEntity.clearSearch();
    baseEntity.setStatusFilter('todos');
    baseEntity.updateFilter('grupoFilter', 'todos');
    baseEntity.handlePageChange(1);
  }, [baseEntity]);

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

  // useEffect removidos - useBaseEntity já gerencia filtros e paginação automaticamente

  // Recalcular estatísticas quando os dados mudam
  useEffect(() => {
    calculateEstatisticas(baseEntity.items);
  }, [baseEntity.items, calculateEstatisticas]);

  return {
    // Estados principais (do hook base)
    subgrupos: isSortingLocally ? subgruposOrdenados : baseEntity.items,
    loading: baseEntity.loading,
    
    // Estados de ordenação
    sortField,
    sortDirection,
    isSortingLocally,
    
    // Estados de busca
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
    searchTerm: baseEntity.searchTerm,
    statusFilter: baseEntity.statusFilter,
    grupoFilter: baseEntity.filters.grupoFilter,
    
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
    setSearchTerm: baseEntity.setSearchTerm,
    clearSearch: baseEntity.clearSearch,
    handleKeyPress: baseEntity.handleKeyPress,
    setStatusFilter: baseEntity.setStatusFilter,
    setGrupoFilter: (value) => baseEntity.updateFilter('grupoFilter', value),
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
    getGrupoNome,
    
    // Ações de ordenação
    handleSort
  };
};
