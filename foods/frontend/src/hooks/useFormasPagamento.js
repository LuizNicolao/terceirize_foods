/**
 * Hook customizado para Formas de Pagamento
 * Gerencia estado e operações relacionadas a formas de pagamento
 */

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import FormasPagamentoService from '../services/formasPagamentoService';
import { useBaseEntity } from './common/useBaseEntity';

export const useFormasPagamento = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('formas-pagamento', FormasPagamentoService, {
    initialItemsPerPage: 20,
    initialFilters: { 
      ativoFilter: 'todos'
    },
    enableStats: true,
    enableDelete: true
  });

  // Estados locais
  const [loading, setLoading] = useState(false);

  /**
   * Carrega dados com filtros
   */
  const loadDataWithFilters = useCallback(async () => {
    const params = {
      page: baseEntity.currentPage,
      limit: baseEntity.itemsPerPage,
      search: baseEntity.searchTerm || undefined,
      ativo: baseEntity.filtros.ativoFilter === 'todos' ? undefined : baseEntity.filtros.ativoFilter
    };

    await baseEntity.loadData(params);
  }, [baseEntity]);

  /**
   * Carregar dados quando filtros mudarem
   */
  useEffect(() => {
    loadDataWithFilters();
  }, [baseEntity.currentPage, baseEntity.itemsPerPage, baseEntity.searchTerm, baseEntity.filtros.ativoFilter]);

  /**
   * Submissão customizada
   */
  const onSubmitCustom = useCallback(async (data) => {
    await baseEntity.onSubmit(data);
  }, [baseEntity]);

  /**
   * Handlers de filtros
   */
  const setAtivoFilter = useCallback((value) => {
    baseEntity.setFilter('ativoFilter', value);
    baseEntity.setCurrentPage(1);
  }, [baseEntity]);

  /**
   * Limpar filtros
   */
  const handleClearFilters = useCallback(() => {
    baseEntity.clearFilters();
    baseEntity.setSearchTerm('');
    setAtivoFilter('todos');
    baseEntity.setCurrentPage(1);
  }, [baseEntity, setAtivoFilter]);

  /**
   * Função para obter badge de status
   */
  const getStatusBadge = useCallback((ativo) => {
    if (ativo === 1 || ativo === true) {
      return { text: 'Ativo', color: 'green' };
    }
    return { text: 'Inativo', color: 'gray' };
  }, []);

  return {
    // Estados do baseEntity
    formasPagamento: baseEntity.items,
    loading: baseEntity.loading,
    showModal: baseEntity.showModal,
    viewMode: baseEntity.viewMode,
    editingFormaPagamento: baseEntity.editingItem,
    showValidationModal: baseEntity.showValidationModal,
    validationErrors: baseEntity.validationErrors,
    showDeleteConfirmModal: baseEntity.showDeleteConfirmModal,
    formaPagamentoToDelete: baseEntity.itemToDelete,
    searchTerm: baseEntity.searchTerm,
    ativoFilter: baseEntity.filtros.ativoFilter || 'todos',
    currentPage: baseEntity.currentPage,
    totalPages: baseEntity.totalPages,
    totalItems: baseEntity.totalItems,
    itemsPerPage: baseEntity.itemsPerPage,
    estatisticas: baseEntity.estatisticas,

    // Handlers do baseEntity
    handleSubmitFormaPagamento: onSubmitCustom,
    handleDeleteFormaPagamento: baseEntity.handleDelete,
    handleConfirmDelete: baseEntity.handleConfirmDelete,
    handleCloseDeleteModal: baseEntity.handleCloseDeleteModal,
    handleAddFormaPagamento: baseEntity.handleAdd,
    handleViewFormaPagamento: baseEntity.handleView,
    handleEditFormaPagamento: baseEntity.handleEdit,
    handleCloseModal: baseEntity.handleCloseModal,
    handleCloseValidationModal: baseEntity.handleCloseValidationModal,
    handlePageChange: baseEntity.handlePageChange,
    handleItemsPerPageChange: baseEntity.handleItemsPerPageChange,
    handleClearFilters,
    setSearchTerm: baseEntity.setSearchTerm,
    handleKeyPress: baseEntity.handleKeyPress,
    setAtivoFilter,
    getStatusBadge
  };
};

