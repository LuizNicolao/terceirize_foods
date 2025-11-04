/**
 * Hook customizado para Prazos de Pagamento
 * Gerencia estado e operações relacionadas a prazos de pagamento
 */

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import PrazosPagamentoService from '../services/prazosPagamentoService';
import { useBaseEntity } from './common/useBaseEntity';

export const usePrazosPagamento = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('prazos-pagamento', PrazosPagamentoService, {
    initialItemsPerPage: 20,
    initialFilters: { ativoFilter: 'todos' },
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
      ativo: baseEntity.filters?.ativoFilter === 'ativo' ? 1 : baseEntity.filters?.ativoFilter === 'inativo' ? 0 : undefined
    };

    await baseEntity.loadData(params);
  }, [baseEntity.currentPage, baseEntity.itemsPerPage, baseEntity.searchTerm, baseEntity.filters?.ativoFilter, baseEntity.loadData]);

  /**
   * Carregar dados quando filtros mudarem
   */
  useEffect(() => {
    loadDataWithFilters();
  }, [baseEntity.currentPage, baseEntity.itemsPerPage, baseEntity.searchTerm, baseEntity.filters?.ativoFilter]);

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
    baseEntity.updateFilter('ativoFilter', 'todos');
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

  /**
   * Função para calcular e formatar vencimentos
   */
  const calcularVencimentos = useCallback((dias, parcelas, intervaloDias) => {
    if (dias === 0) return 'À vista';
    if (!parcelas || parcelas === 1) return `${dias} dias`;
    if (!intervaloDias) return `${dias} dias`;

    const vencimentos = [];
    for (let i = 0; i < Math.min(parcelas, 5); i++) {
      const diasVenc = dias + (i * intervaloDias);
      vencimentos.push(`${diasVenc}d`);
    }
    const resultado = vencimentos.join(' / ');
    return parcelas > 5 ? `${resultado} ...` : resultado;
  }, []);

  /**
   * Função para formatar parcelas
   */
  const formatarParcelas = useCallback((parcelas) => {
    if (!parcelas || parcelas === 1) return '1x';
    return `${parcelas}x`;
  }, []);

  return {
    // Estados do baseEntity
    prazosPagamento: baseEntity.items,
    loading: baseEntity.loading,
    showModal: baseEntity.showModal,
    viewMode: baseEntity.viewMode,
    editingPrazoPagamento: baseEntity.editingItem,
    showValidationModal: baseEntity.showValidationModal,
    validationErrors: baseEntity.validationErrors,
    showDeleteConfirmModal: baseEntity.showDeleteConfirmModal,
    prazoPagamentoToDelete: baseEntity.itemToDelete,
    searchTerm: baseEntity.searchTerm,
    statusFilter: baseEntity.filters?.ativoFilter || 'todos',
    currentPage: baseEntity.currentPage,
    totalPages: baseEntity.totalPages,
    totalItems: baseEntity.totalItems,
    itemsPerPage: baseEntity.itemsPerPage,
    estatisticas: baseEntity.estatisticas,

    // Handlers do baseEntity
    handleSubmitPrazoPagamento: onSubmitCustom,
    handleDeletePrazoPagamento: baseEntity.handleDelete,
    handleConfirmDelete: baseEntity.handleConfirmDelete,
    handleCloseDeleteModal: baseEntity.handleCloseDeleteModal,
    handleAddPrazoPagamento: baseEntity.handleAdd,
    handleViewPrazoPagamento: baseEntity.handleView,
    handleEditPrazoPagamento: baseEntity.handleEdit,
    handleCloseModal: baseEntity.handleCloseModal,
    handleCloseValidationModal: baseEntity.handleCloseValidationModal,
    handlePageChange: baseEntity.handlePageChange,
    handleItemsPerPageChange: baseEntity.handleItemsPerPageChange,
    handleClearFilters,
    setSearchTerm: baseEntity.setSearchTerm,
    handleKeyPress: baseEntity.handleKeyPress,
    setStatusFilter: (value) => baseEntity.updateFilter('ativoFilter', value),
    getStatusBadge,
    calcularVencimentos,
    formatarParcelas
  };
};

