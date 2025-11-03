import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import ClassesService from '../services/classes';
import SubgruposService from '../services/subgrupos';
import { useBaseEntity } from './common/useBaseEntity';
import useTableSort from './common/useTableSort';

export const useClasses = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('classes', ClassesService, {
    initialItemsPerPage: 20,
    initialFilters: { subgrupoFilter: 'todos' },
    enableStats: true,
    enableDelete: true
  });

  // Hook de ordenação híbrida
  const {
    sortedData: classesOrdenadas,
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
      // Recarregar dados com nova ordenação, passando os valores diretamente
      baseEntity.loadData({ sortField: field, sortDirection: direction });
    }
  });

  // Usar ordenação do baseEntity quando disponível, senão usar local
  const sortField = baseEntity.sortField || localSortField;
  const sortDirection = baseEntity.sortDirection || localSortDirection;

  // Estados de dados auxiliares
  const [subgrupos, setSubgrupos] = useState([]);
  const [loadingSubgrupos, setLoadingSubgrupos] = useState(false);

  // Estatísticas vêm do baseEntity (padrão)

  /**
   * Carrega dados auxiliares (subgrupos)
   */
  const loadAuxiliaryData = useCallback(async () => {
    try {
      setLoadingSubgrupos(true);
      const result = await SubgruposService.buscarAtivos({ limit: 1000 });
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
        subgrupo_id: data.subgrupo_id ? parseInt(data.subgrupo_id) : null,
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
    baseEntity.updateFilter('subgrupoFilter', 'todos');
    baseEntity.handlePageChange(1);
  }, [baseEntity]);

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

  // useEffect removidos - useBaseEntity já gerencia filtros e paginação automaticamente

  // Estatísticas são gerenciadas automaticamente pelo baseEntity

  return {
    // Estados principais (do hook base)
    classes: isSortingLocally ? classesOrdenadas : baseEntity.items,
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
    statusFilter: baseEntity.statusFilter,
    subgrupoFilter: baseEntity.filters.subgrupoFilter,
    
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
    setStatusFilter: baseEntity.setStatusFilter,
    setSubgrupoFilter: (value) => baseEntity.updateFilter('subgrupoFilter', value),
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
    getSubgrupoNome,
    
    // Ações de ordenação
    handleSort
  };
};
