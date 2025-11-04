/**
 * Hook customizado para Pedidos de Compras
 * Gerencia estado e operações relacionadas a pedidos de compras
 */

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import PedidosComprasService from '../services/pedidosComprasService';
import { useBaseEntity } from './common/useBaseEntity';

export const usePedidosCompras = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('pedidos-compras', PedidosComprasService, {
    initialItemsPerPage: 20,
    initialFilters: {},
    enableStats: true,
    enableDelete: true
  });

  const [statusFilter, setStatusFilter] = useState('');
  const [solicitacoesDisponiveis, setSolicitacoesDisponiveis] = useState([]);

  /**
   * Carrega dados com filtros
   */
  const loadDataWithFilters = useCallback(async () => {
    const params = {
      page: baseEntity.currentPage,
      limit: baseEntity.itemsPerPage,
      search: baseEntity.searchTerm || undefined,
      status: statusFilter || undefined
    };

    await baseEntity.loadData(params);
  }, [baseEntity.currentPage, baseEntity.itemsPerPage, baseEntity.searchTerm, statusFilter, baseEntity.loadData]);

  /**
   * Carregar solicitações disponíveis
   */
  const loadSolicitacoesDisponiveis = useCallback(async () => {
    try {
      const response = await PedidosComprasService.buscarSolicitacoesDisponiveis();
      if (response.success !== false && response.data) {
        setSolicitacoesDisponiveis(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar solicitações disponíveis:', error);
    }
  }, []);

  /**
   * Carregar dados quando filtros mudarem
   */
  useEffect(() => {
    loadDataWithFilters();
  }, [baseEntity.currentPage, baseEntity.itemsPerPage, baseEntity.searchTerm, statusFilter]);

  /**
   * Carregar solicitações disponíveis ao montar
   */
  useEffect(() => {
    loadSolicitacoesDisponiveis();
  }, [loadSolicitacoesDisponiveis]);

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
    setStatusFilter('');
    baseEntity.handlePageChange(1);
  }, [baseEntity]);

  /**
   * Função para obter badge de status
   */
  const getStatusBadge = useCallback((status) => {
    const statusMap = {
      'em_digitacao': { text: 'Em Digitação', color: 'blue' },
      'aprovado': { text: 'Aprovado', color: 'green' },
      'enviado': { text: 'Enviado', color: 'yellow' },
      'confirmado': { text: 'Confirmado', color: 'purple' },
      'em_transito': { text: 'Em Trânsito', color: 'orange' },
      'entregue': { text: 'Entregue', color: 'green' },
      'cancelado': { text: 'Cancelado', color: 'red' },
      'Parcial': { text: 'Parcial', color: 'yellow' },
      'Finalizado': { text: 'Finalizado', color: 'green' }
    };

    return statusMap[status] || { text: status, color: 'gray' };
  }, []);

  /**
   * Visualizar pedido (busca dados completos com itens)
   */
  const handleViewPedidoCompras = useCallback(async (item) => {
    try {
      baseEntity.setLoading(true);
      console.log('🔵 [HOOK] Buscando dados completos do pedido ID:', item.id);
      const response = await PedidosComprasService.buscarPorId(item.id);
      console.log('📦 [HOOK] Resposta do service:', response);
      
      if (response.success && response.data) {
        console.log('✅ [HOOK] Dados completos recebidos:', response.data);
        baseEntity.handleView(response.data);
      } else {
        console.log('❌ [HOOK] Erro ao buscar pedido:', response.error);
        toast.error(response.error || 'Erro ao buscar pedido de compras');
      }
    } catch (error) {
      console.error('❌ [HOOK] Erro ao buscar pedido:', error);
      toast.error('Erro ao carregar dados do pedido');
    } finally {
      baseEntity.setLoading(false);
    }
  }, [baseEntity]);

  /**
   * Editar pedido (busca dados completos com itens)
   */
  const handleEditPedidoCompras = useCallback(async (item) => {
    try {
      baseEntity.setLoading(true);
      console.log('🔵 [HOOK] Buscando dados completos do pedido ID:', item.id);
      const response = await PedidosComprasService.buscarPorId(item.id);
      console.log('📦 [HOOK] Resposta do service:', response);
      
      if (response.success && response.data) {
        console.log('✅ [HOOK] Dados completos recebidos:', response.data);
        baseEntity.handleEdit(response.data);
      } else {
        console.log('❌ [HOOK] Erro ao buscar pedido:', response.error);
        toast.error(response.error || 'Erro ao buscar pedido de compras');
      }
    } catch (error) {
      console.error('❌ [HOOK] Erro ao buscar pedido:', error);
      toast.error('Erro ao carregar dados do pedido');
    } finally {
      baseEntity.setLoading(false);
    }
  }, [baseEntity]);

  return {
    // Estados do baseEntity
    pedidosCompras: baseEntity.items,
    loading: baseEntity.loading,
    showModal: baseEntity.showModal,
    viewMode: baseEntity.viewMode,
    editingPedidoCompras: baseEntity.editingItem,
    showValidationModal: baseEntity.showValidationModal,
    validationErrors: baseEntity.validationErrors,
    showDeleteConfirmModal: baseEntity.showDeleteConfirmModal,
    pedidoComprasToDelete: baseEntity.itemToDelete,
    searchTerm: baseEntity.searchTerm,
    currentPage: baseEntity.currentPage,
    totalPages: baseEntity.totalPages,
    totalItems: baseEntity.totalItems,
    itemsPerPage: baseEntity.itemsPerPage,
    estatisticas: baseEntity.stats,
    solicitacoesDisponiveis,
    statusFilter,
    setStatusFilter,
    handleSubmitPedidoCompras: onSubmitCustom,
    handleDeletePedidoCompras: baseEntity.handleDelete,
    handleConfirmDelete: baseEntity.handleConfirmDelete,
    handleCloseDeleteModal: baseEntity.handleCloseDeleteModal,
    handleAddPedidoCompras: baseEntity.handleAdd,
    handleViewPedidoCompras,
    handleEditPedidoCompras,
    handleCloseModal: baseEntity.handleCloseModal,
    handleCloseValidationModal: baseEntity.handleCloseValidationModal,
    handlePageChange: baseEntity.handlePageChange,
    handleItemsPerPageChange: baseEntity.handleItemsPerPageChange,
    handleClearFilters,
    setSearchTerm: baseEntity.setSearchTerm,
    handleKeyPress: (e) => {
      if (e.key === 'Enter') {
        loadDataWithFilters();
      }
    },
    getStatusBadge,
    loadSolicitacoesDisponiveis
  };
};

