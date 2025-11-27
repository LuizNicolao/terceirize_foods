/**
 * Hook customizado para Pedidos de Compras
 * Gerencia estado e operações relacionadas a pedidos de compras
 */

import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import toast from 'react-hot-toast';
import PedidosComprasService from '../services/pedidosComprasService';
import { useBaseEntity } from './common/useBaseEntity';
import PedidosComprasPrint from '../components/pedidos-compras/PedidosComprasPrint';

export const usePedidosCompras = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('pedidos-compras', PedidosComprasService, {
    initialItemsPerPage: 20,
    initialFilters: {},
    enableStats: true,
    enableDelete: true,
    enableDebouncedSearch: true
  });

  const [statusFilter, setStatusFilter] = useState('');
  const [solicitacoesDisponiveis, setSolicitacoesDisponiveis] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loadingBatch, setLoadingBatch] = useState(false);

  /**
   * Carrega dados com filtros
   * Não passa 'search' nos params quando enableDebouncedSearch está ativo,
   * pois o useBaseEntity já gerencia isso internamente
   */
  const loadDataWithFilters = useCallback(async () => {
    const params = {
      status: statusFilter || undefined
    };

    await baseEntity.loadData(params);
  }, [statusFilter, baseEntity.currentPage, baseEntity.itemsPerPage, baseEntity.loadData]);

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
   * Não inclui baseEntity.searchTerm nas dependências porque o useBaseEntity
   * já gerencia a busca com debounce internamente
   */
  useEffect(() => {
    loadDataWithFilters();
  }, [baseEntity.currentPage, baseEntity.itemsPerPage, statusFilter]);

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
    // Normalizar status para minúsculo para garantir consistência
    const normalizedStatus = status ? status.toLowerCase() : '';
    
    const statusMap = {
      'em_digitacao': { text: 'Em Digitação', color: 'blue' },
      'aprovado': { text: 'Aprovado', color: 'green' },
      'enviado': { text: 'Enviado', color: 'yellow' },
      'confirmado': { text: 'Confirmado', color: 'purple' },
      'em_transito': { text: 'Em Trânsito', color: 'orange' },
      'entregue': { text: 'Entregue', color: 'green' },
      'cancelado': { text: 'Cancelado', color: 'red' },
      'parcial': { text: 'Parcial', color: 'yellow' },
      'finalizado': { text: 'Finalizado', color: 'green' }
    };

    return statusMap[normalizedStatus] || { text: status || 'Desconhecido', color: 'gray' };
  }, []);

  /**
   * Seleção de itens
   */
  const handleSelectAll = useCallback((checked) => {
    if (checked) {
      setSelectedIds(baseEntity.items.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  }, [baseEntity.items]);

  const handleSelectItem = useCallback((id, checked) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(itemId => itemId !== id));
    }
  }, []);

  /**
   * Ações em lote
   */
  const handleAprovarLote = useCallback(async () => {
    if (selectedIds.length === 0) return;
    
    setLoadingBatch(true);
    try {
      const response = await PedidosComprasService.aprovarPedidosEmLote(selectedIds);
      if (response.success) {
        toast.success(response.message || 'Pedidos aprovados com sucesso!');
        setSelectedIds([]);
        await loadDataWithFilters();
      } else {
        toast.error(response.error || 'Erro ao aprovar pedidos');
      }
    } catch (error) {
      console.error('Erro ao aprovar pedidos:', error);
      toast.error('Erro ao aprovar pedidos');
    } finally {
      setLoadingBatch(false);
    }
  }, [selectedIds, loadDataWithFilters]);

  const handleReabrirLote = useCallback(async () => {
    if (selectedIds.length === 0) return;
    
    setLoadingBatch(true);
    try {
      const response = await PedidosComprasService.reabrirPedidosEmLote(selectedIds);
      if (response.success) {
        toast.success(response.message || 'Pedidos reabertos com sucesso!');
        setSelectedIds([]);
        await loadDataWithFilters();
      } else {
        toast.error(response.error || 'Erro ao reabrir pedidos');
      }
    } catch (error) {
      console.error('Erro ao reabrir pedidos:', error);
      toast.error('Erro ao reabrir pedidos');
    } finally {
      setLoadingBatch(false);
    }
  }, [selectedIds, loadDataWithFilters]);

  /**
   * Visualizar pedido (busca dados completos com itens)
   */
  const handleViewPedidoCompras = useCallback(async (item) => {
    try {
      baseEntity.setLoading(true);
      const response = await PedidosComprasService.buscarPorId(item.id);
      
      if (response.success && response.data) {
        baseEntity.handleView(response.data);
      } else {
        toast.error(response.error || 'Erro ao buscar pedido de compras');
      }
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
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
      const response = await PedidosComprasService.buscarPorId(item.id);
      
      if (response.success && response.data) {
        baseEntity.handleEdit(response.data);
      } else {
        toast.error(response.error || 'Erro ao buscar pedido de compras');
      }
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      toast.error('Erro ao carregar dados do pedido');
    } finally {
      baseEntity.setLoading(false);
    }
  }, [baseEntity]);

  /**
   * Imprimir pedido de compras
   */
  const handlePrintPedidoCompras = useCallback(async (item) => {
    try {
      const pedidoId = typeof item === 'object' ? item.id : item;
      const response = await PedidosComprasService.buscarPorId(pedidoId);
      
      if (response && response.success && response.data) {
        const pedidoCompras = response.data;
        
        // Criar container para impressão na mesma página
        const printContainer = document.createElement('div');
        printContainer.id = 'print-container-pedido';
        printContainer.style.cssText = `
          position: fixed;
          top: -9999px;
          left: -9999px;
          width: 210mm;
          min-height: 297mm;
          background: white;
          z-index: 9999;
        `;
        document.body.appendChild(printContainer);
        
        // Criar estilo para esconder o resto da página durante impressão
        const printStyle = document.createElement('style');
        printStyle.id = 'print-style-pedido';
        printStyle.textContent = `
          @media print {
            @page {
              size: A4;
              margin: 0mm;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              width: 210mm !important;
              height: 297mm !important;
              overflow: hidden !important;
            }
            body > *:not(#print-container-pedido) {
              display: none !important;
              visibility: hidden !important;
            }
            header, nav, footer, .navbar, .sidebar, .menu, button, .no-print {
              display: none !important;
              visibility: hidden !important;
            }
            #print-container-pedido {
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 210mm !important;
              margin: 0 !important;
              padding: 15mm !important;
              box-sizing: border-box !important;
              background: white !important;
            }
          }
        `;
        document.head.appendChild(printStyle);
        
        // Renderizar componente
        const root = ReactDOM.createRoot(printContainer);
        root.render(React.createElement(PedidosComprasPrint, { pedidoCompras }));
        
        // Aguardar renderização e então imprimir
        setTimeout(() => {
          window.print();
          
          // Limpar após impressão
          const cleanup = () => {
            root.unmount();
            if (printContainer.parentNode) {
              printContainer.parentNode.removeChild(printContainer);
            }
            const styleEl = document.getElementById('print-style-pedido');
            if (styleEl) {
              styleEl.parentNode.removeChild(styleEl);
            }
            window.removeEventListener('afterprint', cleanup);
          };
          
          window.addEventListener('afterprint', cleanup);
          
          // Fallback: limpar após 5 segundos se afterprint não disparar
          setTimeout(cleanup, 5000);
        }, 100);
      } else {
        toast.error('Erro ao buscar dados do pedido para impressão');
      }
    } catch (error) {
      console.error('Erro ao imprimir pedido:', error);
      toast.error('Erro ao imprimir pedido');
    }
  }, []);

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
    estatisticas: baseEntity.estatisticas,
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
    handlePrintPedidoCompras,
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
    loadSolicitacoesDisponiveis,
    // Seleção e ações em lote
    selectedIds,
    handleSelectAll,
    handleSelectItem,
    handleAprovarLote,
    handleReabrirLote,
    loadingBatch
  };
};

