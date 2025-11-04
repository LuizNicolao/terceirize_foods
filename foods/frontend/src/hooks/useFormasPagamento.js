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
    initialFilters: {},
    enableStats: true,
    enableDelete: true
  });

  /**
   * Carrega dados com filtros
   */
  const loadDataWithFilters = useCallback(async () => {
    const params = {
      page: baseEntity.currentPage,
      limit: baseEntity.itemsPerPage,
      search: baseEntity.searchTerm || undefined,
      ativo: baseEntity.statusFilter === 'ativo' ? 1 : baseEntity.statusFilter === 'inativo' ? 0 : undefined
    };

    await baseEntity.loadData(params);
  }, [baseEntity.currentPage, baseEntity.itemsPerPage, baseEntity.searchTerm, baseEntity.statusFilter, baseEntity.loadData]);

  /**
   * Carregar dados quando filtros mudarem
   */
  useEffect(() => {
    loadDataWithFilters();
  }, [baseEntity.currentPage, baseEntity.itemsPerPage, baseEntity.searchTerm, baseEntity.statusFilter]);

  /**
   * Submissão customizada
   */
  const onSubmitCustom = useCallback(async (data) => {
    await baseEntity.onSubmit(data);
  }, [baseEntity]);

  /**
   * Limpar filtros
   */
  const handleClearFilters = useCallback(() => {
    baseEntity.clearFilters();
    baseEntity.setSearchTerm('');
    baseEntity.setStatusFilter('todos');
    baseEntity.handlePageChange(1);
  }, [baseEntity]);

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
    statusFilter: baseEntity.statusFilter,
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
    setStatusFilter: baseEntity.setStatusFilter,
    getStatusBadge
  };
};

