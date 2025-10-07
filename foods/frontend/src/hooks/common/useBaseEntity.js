/**
 * Hook base para entidades CRUD
 * Combina paginação, modais, filtros e validação em um hook reutilizável
 */

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useValidation } from './useValidation';
import { usePagination } from './usePagination';
import { useModal } from './useModal';
import { useFilters } from './useFilters';

export const useBaseEntity = (entityName, service, options = {}) => {
  const {
    initialItemsPerPage = 20,
    initialFilters = {},
    enableStats = true,
    enableDelete = true
  } = options;

  // Hooks base
  const validation = useValidation();
  const pagination = usePagination(initialItemsPerPage);
  const modal = useModal();
  const filters = useFilters(initialFilters);

  // Estados específicos da entidade
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Estados de estatísticas
  const [estatisticas, setEstatisticas] = useState({});

  /**
   * Carrega dados da entidade
   */
  const loadData = useCallback(async (customParams = {}) => {
    setLoading(true);
    try {
      const params = {
        ...pagination.getPaginationParams(),
        ...filters.getFilterParams(),
        ...customParams
      };

      const response = await service.listar(params);

      if (response.success) {
        setItems(response.data);
        pagination.updatePagination(response.pagination);
        
        // Calcular estatísticas se habilitado
        if (enableStats && response.data) {
          const total = response.pagination?.totalItems || response.data.length;
          const ativos = response.data.filter(item => item.status === 1).length;
          const inativos = response.data.filter(item => item.status === 0).length;
          
          setEstatisticas({
            total,
            ativos,
            inativos
          });
        }
      } else {
        toast.error(response.message || `Erro ao carregar ${entityName}`);
      }
    } catch (error) {
      console.error(`Erro ao carregar ${entityName}:`, error);
      toast.error(`Erro ao carregar ${entityName}`);
    } finally {
      setLoading(false);
    }
  }, [entityName, service, pagination, filters, enableStats]);

  /**
   * Submete formulário (criar/editar)
   */
  const onSubmit = useCallback(async (formData) => {
    try {
      let response;
      
      if (modal.editingItem) {
        // Atualizar
        response = await service.atualizar(modal.editingItem.id, formData);
      } else {
        // Criar
        response = await service.criar(formData);
      }

      if (validation.handleApiResponse(response)) {
        return; // Há erros de validação
      }

      if (response.success) {
        toast.success(
          modal.editingItem 
            ? `${entityName} atualizado com sucesso!` 
            : `${entityName} criado com sucesso!`
        );
        modal.handleCloseModal();
        loadData();
      } else {
        toast.error(response.message || `Erro ao salvar ${entityName}`);
      }
    } catch (error) {
      console.error(`Erro ao salvar ${entityName}:`, error);
      toast.error(`Erro ao salvar ${entityName}`);
    }
  }, [entityName, service, modal, validation, loadData]);

  /**
   * Inicia processo de exclusão
   */
  const handleDelete = useCallback((item) => {
    setItemToDelete(item);
    setShowDeleteConfirmModal(true);
  }, []);

  /**
   * Confirma exclusão
   */
  const handleConfirmDelete = useCallback(async () => {
    if (!itemToDelete || !enableDelete) return;

    try {
      const response = await service.excluir(itemToDelete.id);

      if (response.success) {
        toast.success(`${entityName} excluído com sucesso!`);
        setShowDeleteConfirmModal(false);
        setItemToDelete(null);
        loadData();
      } else {
        toast.error(response.message || `Erro ao excluir ${entityName}`);
      }
    } catch (error) {
      console.error(`Erro ao excluir ${entityName}:`, error);
      toast.error(`Erro ao excluir ${entityName}`);
    }
  }, [entityName, service, itemToDelete, enableDelete, loadData]);

  /**
   * Cancela exclusão
   */
  const handleCloseDeleteModal = useCallback(() => {
    setShowDeleteConfirmModal(false);
    setItemToDelete(null);
  }, []);

  /**
   * Carrega dados quando filtros ou paginação mudam
   */
  useEffect(() => {
    console.log('📄 useBaseEntity: useEffect paginação/filtros executado');
    console.log('📄 Página atual:', pagination.currentPage);
    console.log('🔢 Itens por página:', pagination.itemsPerPage);
    console.log('🔍 Termo de busca:', filters.searchTerm);
    console.log('📊 Status filter:', filters.statusFilter);
    loadData();
  }, [pagination.currentPage, pagination.itemsPerPage, filters.searchTerm, filters.statusFilter]);

  /**
   * Carrega dados quando filtros customizados mudam
   */
  useEffect(() => {
    console.log('🚨 useBaseEntity: useEffect filtros customizados executado');
    console.log('🔍 Filtros customizados:', filters.filters);
    console.log('📄 Página atual antes do reset:', pagination.currentPage);
    console.log('🎯 Tem filtros ativos?', filters.hasActiveFilters());
    
    if (filters.hasActiveFilters()) {
      console.log('⚠️ RESETANDO PAGINAÇÃO PARA PÁGINA 1!');
      pagination.resetPagination();
      loadData();
    }
  }, [filters.filters]);

  return {
    // Estados principais
    items,
    loading,
    estatisticas,
    
    // Estados de modal
    showModal: modal.showModal,
    viewMode: modal.viewMode,
    editingItem: modal.editingItem,
    
    // Estados de exclusão
    showDeleteConfirmModal,
    itemToDelete,
    
    // Estados de paginação
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    totalItems: pagination.totalItems,
    itemsPerPage: pagination.itemsPerPage,
    
    // Estados de filtros
    searchTerm: filters.searchTerm,
    statusFilter: filters.statusFilter,
    filters: filters.filters,
    
    // Estados de validação
    validationErrors: validation.validationErrors,
    showValidationModal: validation.showValidationModal,
    
    // Ações de modal
    handleAdd: modal.handleAdd,
    handleView: modal.handleView,
    handleEdit: modal.handleEdit,
    handleOpenModal: modal.handleEdit, // Alias para compatibilidade
    handleCloseModal: modal.handleCloseModal,
    
    // Ações de paginação
    handlePageChange: pagination.handlePageChange,
    handleItemsPerPageChange: pagination.handleItemsPerPageChange,
    
    // Ações de filtros
    setSearchTerm: filters.setSearchTerm,
    setStatusFilter: filters.setStatusFilter,
    updateFilter: filters.updateFilter,
    updateFilters: filters.updateFilters,
    clearFilters: filters.clearFilters,
    
    // Ações de CRUD
    onSubmit,
    handleDelete,
    handleConfirmDelete,
    handleCloseDeleteModal,
    
    // Ações de validação
    handleCloseValidationModal: validation.handleCloseValidationModal,
    clearValidationErrors: validation.clearValidationErrors,
    
    // Ações de dados
    loadData,
    
    // Funções de paginação (do hook pagination)
    getPaginationParams: pagination.getPaginationParams,
    
    // Setters diretos (para casos específicos)
    setItems,
    setLoading,
    setEstatisticas
  };
};
