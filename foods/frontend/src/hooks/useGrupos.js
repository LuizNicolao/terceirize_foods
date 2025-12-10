import { useCallback, useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import GruposService from '../services/grupos';
import { useBaseEntity } from './common/useBaseEntity';
import useTableSort from './common/useTableSort';

export const useGrupos = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('grupos', GruposService, {
    initialItemsPerPage: 20,
    initialFilters: {},
    enableStats: true,
    enableDelete: true
  });

  // Hook de ordenação híbrida
  const {
    sortedData: gruposOrdenados,
    sortField: localSortField,
    sortDirection: localSortDirection,
    handleSort,
    isSortingLocally
  } = useTableSort({
    data: baseEntity.items,
    threshold: 100,
    totalItems: baseEntity.totalItems
  });

  // Usar ordenação do baseEntity quando disponível, senão usar local
  const sortField = baseEntity.sortField || localSortField;
  const sortDirection = baseEntity.sortDirection || localSortDirection;

  // Estatísticas vêm do baseEntity (padrão)

  /**
   * Submissão customizada
   */
  const onSubmitCustom = useCallback(async (data) => {
    await baseEntity.onSubmit(data);
    // Estatísticas são gerenciadas automaticamente pelo baseEntity
  }, [baseEntity]);

  /**
   * Exclusão customizada que recarrega dados
   */
  const handleDeleteCustom = useCallback(async () => {
    await baseEntity.handleConfirmDelete();
    // Estatísticas são gerenciadas automaticamente pelo baseEntity
  }, [baseEntity]);

  // Estado para filtro de tipo
  const [tipoFilter, setTipoFilter] = useState('');

  // Carregar dados quando tipoFilter mudar (usando ref para evitar dependência circular)
  useEffect(() => {
    if (baseEntity.loadData) {
      const params = {
        tipo: tipoFilter || undefined
      };
      // Usar setTimeout para garantir que a mudança seja processada corretamente
      const timeoutId = setTimeout(() => {
        baseEntity.loadData(params);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [tipoFilter]);

  // Extrair tipos únicos dos grupos
  const tiposDisponiveis = useMemo(() => {
    const tipos = new Set();
    baseEntity.items.forEach(grupo => {
      if (grupo.tipo) {
        tipos.add(grupo.tipo);
      }
    });
    return Array.from(tipos).sort().map(tipo => ({
      value: tipo,
      label: tipo
    }));
  }, [baseEntity.items]);

  /**
   * Funções auxiliares
   */
  const handleClearFilters = useCallback(() => {
    baseEntity.clearSearch();
    baseEntity.setStatusFilter('todos');
    setTipoFilter('');
    baseEntity.handlePageChange(1);
  }, [baseEntity]);

  const getStatusLabel = useCallback((status) => {
    return status === 'ativo' ? 'Ativo' : 'Inativo';
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  }, []);

  // useEffect removidos - useBaseEntity já gerencia filtros e paginação automaticamente

  // Estatísticas são gerenciadas automaticamente pelo baseEntity

  /**
   * Visualizar grupo - busca dados completos do backend
   */
  const handleViewGrupoCustom = useCallback(async (idOrItem) => {
    try {
      // Se já for um objeto completo, usar diretamente
      if (idOrItem && typeof idOrItem === 'object' && idOrItem.id) {
        baseEntity.handleView(idOrItem);
        return;
      }

      // Caso contrário, buscar do backend
      const id = typeof idOrItem === 'object' ? idOrItem.id : idOrItem;
      const response = await GruposService.buscarPorId(id);
      
      if (response.success && response.data) {
        baseEntity.handleView(response.data);
      } else {
        toast.error(response.message || 'Erro ao buscar grupo');
      }
    } catch (error) {
      console.error('Erro ao buscar grupo:', error);
      toast.error('Erro ao buscar grupo');
    }
  }, [baseEntity]);

  /**
   * Editar grupo - busca dados completos do backend
   */
  const handleEditGrupoCustom = useCallback(async (idOrItem) => {
    try {
      // Se já for um objeto completo, usar diretamente
      if (idOrItem && typeof idOrItem === 'object' && idOrItem.id) {
        baseEntity.handleEdit(idOrItem);
        return;
      }

      // Caso contrário, buscar do backend
      const id = typeof idOrItem === 'object' ? idOrItem.id : idOrItem;
      const response = await GruposService.buscarPorId(id);
      
      if (response.success && response.data) {
        baseEntity.handleEdit(response.data);
      } else {
        toast.error(response.message || 'Erro ao buscar grupo');
      }
    } catch (error) {
      console.error('Erro ao buscar grupo:', error);
      toast.error('Erro ao buscar grupo');
    }
  }, [baseEntity]);

  return {
    // Estados principais (do hook base)
    grupos: isSortingLocally ? gruposOrdenados : baseEntity.items,
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
    searchTerm: baseEntity.searchTerm,
    statusFilter: baseEntity.statusFilter,
    tipoFilter,
    setTipoFilter,
    tiposDisponiveis,
    
    // Estados de validação (do hook base)
    validationErrors: baseEntity.validationErrors,
    showValidationModal: baseEntity.showValidationModal,
    
    // Ações de modal (customizadas para buscar dados completos)
    handleAddGrupo: baseEntity.handleAdd,
    handleViewGrupo: handleViewGrupoCustom,
    handleEditGrupo: handleEditGrupoCustom,
    handleCloseModal: baseEntity.handleCloseModal,
    
    // Ações de paginação (do hook base)
    handlePageChange: baseEntity.handlePageChange,
    handleItemsPerPageChange: baseEntity.handleItemsPerPageChange,
    
    // Ações de filtros
    setSearchTerm: baseEntity.setSearchTerm,
    clearSearch: baseEntity.clearSearch,
    handleKeyPress: baseEntity.handleKeyPress,
    setStatusFilter: baseEntity.setStatusFilter,
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
    formatDate,
    
    // Ações de ordenação
    handleSort
  };
};
