/**
 * Hook base para funcionalidades CRUD
 * Gerencia estado e operações básicas de entidades
 */

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

export const useBaseEntity = (entityName, service, options = {}) => {
  const {
    initialItemsPerPage = 20,
    initialFilters = {},
    enableStats = true,
    enableDelete = true,
    enableExport = true
  } = options;

  // Estados principais
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewMode, setViewMode] = useState(false);

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(initialFilters);

  // Estados de confirmação
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Estados de validação
  const [validationErrors, setValidationErrors] = useState([]);
  const [showValidationModal, setShowValidationModal] = useState(false);

  // Estados de estatísticas
  const [estatisticas, setEstatisticas] = useState({});

  /**
   * Carrega itens da API
   */
  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        ...filters
      };

      const response = await service.getAll(params);
      setItems(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalItems(response.total || 0);

      if (enableStats && response.estatisticas) {
        setEstatisticas(response.estatisticas);
      }
    } catch (error) {
      console.error(`Erro ao carregar ${entityName}:`, error);
      toast.error(`Erro ao carregar ${entityName}`);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, filters, entityName, enableStats]);

  /**
   * Salva item (cria ou atualiza)
   */
  const saveItem = useCallback(async (itemData) => {
    setSaving(true);
    try {
      let response;
      if (editingItem) {
        response = await service.update(editingItem.id, itemData);
        toast.success(`${entityName} atualizado com sucesso!`);
      } else {
        response = await service.create(itemData);
        toast.success(`${entityName} criado com sucesso!`);
      }

      await loadItems();
      handleCloseModal();
      return response;
    } catch (error) {
      console.error(`Erro ao salvar ${entityName}:`, error);
      
      if (error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
        setShowValidationModal(true);
      } else {
        toast.error(`Erro ao salvar ${entityName}`);
      }
      throw error;
    } finally {
      setSaving(false);
    }
  }, [editingItem, service, entityName, loadItems]);

  /**
   * Remove item
   */
  const deleteItem = useCallback(async (item) => {
    try {
      await service.delete(item.id);
      toast.success(`${entityName} removido com sucesso!`);
      await loadItems();
      handleCloseDeleteModal();
    } catch (error) {
      console.error(`Erro ao remover ${entityName}:`, error);
      toast.error(`Erro ao remover ${entityName}`);
    }
  }, [service, entityName, loadItems]);

  /**
   * Handlers de modal
   */
  const handleAddItem = useCallback(() => {
    setEditingItem(null);
    setViewMode(false);
    setShowModal(true);
  }, []);

  const handleViewItem = useCallback((item) => {
    setEditingItem(item);
    setViewMode(true);
    setShowModal(true);
  }, []);

  const handleEditItem = useCallback((item) => {
    setEditingItem(item);
    setViewMode(false);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingItem(null);
    setViewMode(false);
    setValidationErrors([]);
    setShowValidationModal(false);
  }, []);

  /**
   * Handlers de paginação
   */
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleItemsPerPageChange = useCallback((newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);

  /**
   * Handlers de filtros
   */
  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setSearchTerm('');
    setCurrentPage(1);
  }, [initialFilters]);

  /**
   * Handlers de confirmação
   */
  const handleDeleteItem = useCallback((item) => {
    setItemToDelete(item);
    setShowDeleteConfirmModal(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (itemToDelete) {
      deleteItem(itemToDelete);
    }
  }, [itemToDelete, deleteItem]);

  const handleCloseDeleteModal = useCallback(() => {
    setShowDeleteConfirmModal(false);
    setItemToDelete(null);
  }, []);

  /**
   * Handler de validação
   */
  const handleCloseValidationModal = useCallback(() => {
    setShowValidationModal(false);
    setValidationErrors([]);
  }, []);

  /**
   * Carrega dados quando as dependências mudam
   */
  useEffect(() => {
    loadItems();
  }, [loadItems]);

  return {
    // Estados
    items,
    loading,
    saving,
    showModal,
    editingItem,
    viewMode,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    searchTerm,
    filters,
    showDeleteConfirmModal,
    itemToDelete,
    validationErrors,
    showValidationModal,
    estatisticas,

    // Handlers
    onSubmit: saveItem,
    handleAddItem,
    handleViewItem,
    handleEditItem,
    handleCloseModal,
    handlePageChange,
    handleItemsPerPageChange,
    setSearchTerm,
    handleFilterChange,
    clearFilters,
    handleDeleteItem,
    handleConfirmDelete,
    handleCloseDeleteModal,
    handleCloseValidationModal,
    loadItems
  };
};
