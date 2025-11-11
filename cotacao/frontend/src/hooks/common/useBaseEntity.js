import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useValidation } from './useValidation';
import { usePagination } from './usePagination';
import { useModal } from './useModal';
import { useFilters } from './useFilters';
import { useDebouncedSearch } from './useDebouncedSearch';

export const useBaseEntity = (entityName, service, options = {}) => {
  const {
    initialItemsPerPage = 20,
    initialFilters = {},
    enableStats = true,
    enableDelete = true,
    enableDebouncedSearch = true
  } = options;

  const validation = useValidation();
  const pagination = usePagination(initialItemsPerPage);
  const modal = useModal();
  const filters = useFilters(initialFilters);
  const debouncedSearch = enableDebouncedSearch ? useDebouncedSearch(500) : null;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);
  const [estatisticas, setEstatisticas] = useState({});

  const loadData = useCallback(async (customParams = {}) => {
    setLoading(true);
    try {
      const params = {
        ...pagination.getPaginationParams(),
        ...filters.getFilterParams(),
        search: debouncedSearch?.debouncedSearchTerm || filters.searchTerm || undefined,
        sortField: customParams.sortField !== undefined ? customParams.sortField : sortField,
        sortDirection: customParams.sortDirection !== undefined ? customParams.sortDirection : sortDirection,
        ...customParams
      };

      const response = await service.listar(params);

      if (response.success) {
        let dataItems = [];
        let paginationData = response.pagination;

        if (Array.isArray(response.data)) {
          dataItems = response.data;
        } else if (response.data && Array.isArray(response.data[entityName])) {
          dataItems = response.data[entityName];
        }

        setItems(dataItems);
        pagination.updatePagination(paginationData);

        if (enableStats) {
          if (response.statistics) {
            setEstatisticas({
              total: response.statistics.total || 0,
              ativos: response.statistics.ativos || 0,
              inativos: response.statistics.inativos || 0,
              ...response.statistics
            });
          } else if (Array.isArray(response.data)) {
            const total = response.pagination?.total || response.data.length;
            const ativos = response.data.filter((item) => item.status === 'ativo' || item.status === 1).length;
            const inativos = response.data.filter((item) => item.status === 'inativo' || item.status === 0).length;
            setEstatisticas({ total, ativos, inativos });
          }
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
  }, [entityName, service, pagination, filters, enableStats, debouncedSearch?.debouncedSearchTerm, sortField, sortDirection]);

  const onSubmit = useCallback(async (formData) => {
    try {
      let response;

      if (modal.editingItem) {
        response = await service.atualizar(modal.editingItem.id, formData);
      } else {
        response = await service.criar(formData);
      }

      if (validation.handleApiResponse(response)) {
        return;
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

  const handleDelete = useCallback((item) => {
    setItemToDelete(item);
    setShowDeleteConfirmModal(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!itemToDelete || !enableDelete) return;

    try {
      const response = await service.excluir(itemToDelete.id);

      if (response.success) {
        toast.success(response.message || `${entityName} excluído com sucesso!`);
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

  const handleCloseDeleteModal = useCallback(() => {
    setShowDeleteConfirmModal(false);
    setItemToDelete(null);
  }, []);

  useEffect(() => {
    loadData();
  }, [pagination.currentPage, pagination.itemsPerPage, debouncedSearch?.debouncedSearchTerm || filters.searchTerm, filters.statusFilter, filters.filters]);

  return {
    items,
    loading,
    estatisticas,
    showModal: modal.showModal,
    viewMode: modal.viewMode,
    editingItem: modal.editingItem,
    showDeleteConfirmModal,
    itemToDelete,
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    totalItems: pagination.totalItems,
    itemsPerPage: pagination.itemsPerPage,
    searchTerm: debouncedSearch?.searchTerm || filters.searchTerm,
    isSearching: debouncedSearch?.isSearching || false,
    statusFilter: filters.statusFilter,
    filters: filters.filters,
    validationErrors: validation.validationErrors,
    showValidationModal: validation.showValidationModal,
    handleAdd: modal.handleAdd,
    handleView: modal.handleView,
    handleEdit: modal.handleEdit,
    handleCloseModal: modal.handleCloseModal,
    handlePageChange: pagination.handlePageChange,
    handleItemsPerPageChange: pagination.handleItemsPerPageChange,
    setSearchTerm: debouncedSearch?.updateSearchTerm || filters.setSearchTerm,
    clearSearch: debouncedSearch?.clearSearch || (() => filters.setSearchTerm('')),
    handleKeyPress: debouncedSearch?.handleKeyPress || (() => {}),
    setStatusFilter: filters.setStatusFilter,
    updateFilter: filters.updateFilter,
    updateFilters: filters.updateFilters,
    clearFilters: filters.clearFilters,
    onSubmit,
    handleDelete,
    handleConfirmDelete,
    handleCloseDeleteModal,
    handleCloseValidationModal: validation.handleCloseValidationModal,
    clearValidationErrors: validation.clearValidationErrors,
    loadData,
    getPaginationParams: pagination.getPaginationParams,
    setItems,
    setLoading,
    setEstatisticas,
    sortField,
    sortDirection,
    setSortField,
    setSortDirection
  };
};
