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
    sortField: localSortField,
    sortDirection: localSortDirection,
    handleSort,
    isSortingLocally
  } = useTableSort({
    data: baseEntity.items,
    threshold: 50,
    totalItems: baseEntity.totalItems,
    onBackendSort: (field, direction) => {
      // Atualizar estados de ordenação no baseEntity
      baseEntity.setSortField(field);
      baseEntity.setSortDirection(direction);
      // Recarregar dados com nova ordenação
      baseEntity.loadData();
    }
  });

  // Usar ordenação do baseEntity quando disponível, senão usar local
  const sortField = baseEntity.sortField || localSortField;
  const sortDirection = baseEntity.sortDirection || localSortDirection;

  // Estados de dados auxiliares
  const [grupos, setGrupos] = useState([]);
  const [loadingGrupos, setLoadingGrupos] = useState(false);

  // Estatísticas vêm do baseEntity (padrão)

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
    // Estatísticas são gerenciadas automaticamente pelo baseEntity
  }, [baseEntity]);

  /**
   * Exclusão customizada que recarrega dados
   */
  const handleDeleteCustom = useCallback(async () => {
    await baseEntity.handleConfirmDelete();
    // Estatísticas são gerenciadas automaticamente pelo baseEntity
  }, [baseEntity]);

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

  // Estatísticas são gerenciadas automaticamente pelo baseEntity

  return {
    // Estados principais (do hook base)
    subgrupos: isSortingLocally ? subgruposOrdenados : baseEntity.items,
    loading: baseEntity.loading,
    
    // Estados de ordenação
    sortField,
    sortDirection,
    isSortingLocally,
    
    // Estados de busca
    estatisticas: baseEntity.estatisticas, // Usar estatísticas do baseEntity (padrão)
    
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
