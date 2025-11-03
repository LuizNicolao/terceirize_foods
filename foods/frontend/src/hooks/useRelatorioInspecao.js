/**
 * Hook customizado para Relatório de Inspeção de Recebimento (RIR)
 * Gerencia estado e operações relacionadas a relatórios de inspeção
 */

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import RelatorioInspecaoService from '../services/relatorioInspecao';
import { useBaseEntity } from './common/useBaseEntity';
import { useFilters } from './common/useFilters';

export const useRelatorioInspecao = () => {
  // Hook base para funcionalidades CRUD
  // Desabilitar busca com debounce para ter controle manual
  const baseEntity = useBaseEntity('relatorio-inspecao', RelatorioInspecaoService, {
    initialItemsPerPage: 20,
    initialFilters: {},
    enableStats: true,
    enableDelete: true,
    enableDebouncedSearch: false // Desabilitar para controle manual dos filtros
  });

  // Hook de filtros customizados para RIR
  const customFilters = useFilters({
    status_geral: '',
    data_inicio: '',
    data_fim: ''
  });

  // Estados específicos do RIR
  const [rir, setRir] = useState(null);
  const [grupos, setGrupos] = useState([]);

  /**
   * Carrega dados com filtros customizados
   */
  const loadDataWithFilters = useCallback(async () => {
    const params = {
      ...baseEntity.getPaginationParams(),
      ...customFilters.getFilterParams(),
      search: baseEntity.searchTerm || undefined,
      status_geral: customFilters.filters.status_geral || undefined,
      data_inicio: customFilters.filters.data_inicio || undefined,
      data_fim: customFilters.filters.data_fim || undefined
    };

    // Remover parâmetros vazios
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key];
      }
    });

    await baseEntity.loadData(params);
  }, [baseEntity, customFilters]);

  // Carregar dados quando filtros ou paginação mudam
  useEffect(() => {
    loadDataWithFilters();
  }, [baseEntity.currentPage, baseEntity.itemsPerPage, customFilters.filters.status_geral, customFilters.filters.data_inicio, customFilters.filters.data_fim]);

  /**
   * Buscar RIR por ID (mantido para compatibilidade)
   */
  const buscarRIRPorId = useCallback(async (id) => {
    baseEntity.setLoading(true);
    try {
      const response = await RelatorioInspecaoService.buscarPorId(id);
      
      if (response.success) {
        setRir(response.data);
        return response.data;
      } else {
        toast.error(response.error || 'Erro ao buscar relatório de inspeção');
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar RIR:', error);
      toast.error('Erro ao buscar relatório de inspeção');
      return null;
    } finally {
      baseEntity.setLoading(false);
    }
  }, [baseEntity]);

  /**
   * Criar novo RIR
   */
  const criarRIR = useCallback(async (data) => {
    try {
      const response = await RelatorioInspecaoService.criar(data);
      
      if (response.success) {
        toast.success(response.message || 'Relatório de inspeção criado com sucesso!');
        await loadDataWithFilters(); // Recarregar lista
        return response;
      } else {
        if (response.validationErrors) {
          return response; // Retornar para o componente tratar
        }
        toast.error(response.error || 'Erro ao criar relatório de inspeção');
        return response;
      }
    } catch (error) {
      console.error('Erro ao criar RIR:', error);
      toast.error('Erro ao criar relatório de inspeção');
      return { success: false };
    }
  }, [loadDataWithFilters]);

  /**
   * Atualizar RIR
   */
  const atualizarRIR = useCallback(async (id, data) => {
    try {
      const response = await RelatorioInspecaoService.atualizar(id, data);
      
      if (response.success) {
        toast.success(response.message || 'Relatório de inspeção atualizado com sucesso!');
        await loadDataWithFilters(); // Recarregar lista
        return response;
      } else {
        if (response.validationErrors) {
          return response; // Retornar para o componente tratar
        }
        toast.error(response.error || 'Erro ao atualizar relatório de inspeção');
        return response;
      }
    } catch (error) {
      console.error('Erro ao atualizar RIR:', error);
      toast.error('Erro ao atualizar relatório de inspeção');
      return { success: false };
    }
  }, [loadDataWithFilters]);

  /**
   * Excluir RIR
   */
  const excluirRIR = useCallback(async (id) => {
    try {
      const response = await RelatorioInspecaoService.excluir(id);
      
      if (response.success) {
        toast.success(response.message || 'Relatório de inspeção excluído com sucesso!');
        await loadDataWithFilters(); // Recarregar lista
        return true;
      } else {
        toast.error(response.error || 'Erro ao excluir relatório de inspeção');
        return false;
      }
    } catch (error) {
      console.error('Erro ao excluir RIR:', error);
      toast.error('Erro ao excluir relatório de inspeção');
      return false;
    }
  }, [loadDataWithFilters]);

  /**
   * Buscar produtos do pedido
   */
  const buscarProdutosPedido = useCallback(async (pedidoId) => {
    try {
      const response = await RelatorioInspecaoService.buscarProdutosPedido(pedidoId);
      return response;
    } catch (error) {
      console.error('Erro ao buscar produtos do pedido:', error);
      return { success: false, error: 'Erro ao buscar produtos do pedido' };
    }
  }, []);

  /**
   * Buscar NQA do grupo
   */
  const buscarNQAGrupo = useCallback(async (grupoId) => {
    try {
      const response = await RelatorioInspecaoService.buscarNQAGrupo(grupoId);
      return response;
    } catch (error) {
      console.error('Erro ao buscar NQA do grupo:', error);
      return { success: false, error: 'Erro ao buscar NQA do grupo' };
    }
  }, []);

  /**
   * Buscar plano por lote
   */
  const buscarPlanoPorLote = useCallback(async (nqaId, tamanhoLote) => {
    try {
      const response = await RelatorioInspecaoService.buscarPlanoPorLote(nqaId, tamanhoLote);
      return response;
    } catch (error) {
      console.error('Erro ao buscar plano por lote:', error);
      return { success: false, error: 'Erro ao buscar plano de amostragem' };
    }
  }, []);

  /**
   * Buscar pedidos aprovados
   */
  const buscarPedidosAprovados = useCallback(async () => {
    try {
      const response = await RelatorioInspecaoService.buscarPedidosAprovados();
      return response;
    } catch (error) {
      console.error('Erro ao buscar pedidos aprovados:', error);
      return { success: false, error: 'Erro ao buscar pedidos aprovados' };
    }
  }, []);

  /**
   * Buscar grupos
   */
  const buscarGrupos = useCallback(async () => {
    try {
      const response = await RelatorioInspecaoService.buscarGrupos();
      if (response.success) {
        setGrupos(response.data || []);
      }
      return response;
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      return { success: false, error: 'Erro ao buscar grupos' };
    }
  }, []);

  // Carregar grupos ao montar (apenas uma vez)
  useEffect(() => {
    buscarGrupos();
  }, [buscarGrupos]);

  /**
   * Handle key press para buscar ao pressionar Enter
   */
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      loadDataWithFilters();
    }
  }, [loadDataWithFilters]);

  /**
   * Limpar filtros
   */
  const clearFiltros = useCallback(() => {
    baseEntity.setSearchTerm('');
    customFilters.setFilters({
      status_geral: '',
      data_inicio: '',
      data_fim: ''
    });
  }, [baseEntity, customFilters]);

  /**
   * Atualizar filtros customizados
   */
  const setFiltros = useCallback((filtros) => {
    customFilters.setFilters(prev => ({
      ...prev,
      ...filtros
    }));
  }, [customFilters]);

  return {
    // Estados principais (do hook base)
    rirs: baseEntity.items,
    rir,
    loading: baseEntity.loading,
    
    // Estados de paginação (do hook base)
    pagination: {
      current_page: baseEntity.currentPage,
      total_pages: baseEntity.totalPages,
      total_items: baseEntity.totalItems,
      items_per_page: baseEntity.itemsPerPage
    },
    
    // Estados de estatísticas (do hook base)
    statistics: baseEntity.estatisticas,
    
    // Estados específicos
    grupos,
    filtros: {
      search: baseEntity.searchTerm,
      ...customFilters.filters
    },
    
    // Estados de modal (do hook base)
    showModal: baseEntity.showModal,
    viewMode: baseEntity.viewMode,
    editingRir: baseEntity.editingItem,
    
    // Estados de exclusão (do hook base)
    showDeleteConfirmModal: baseEntity.showDeleteConfirmModal,
    rirToDelete: baseEntity.itemToDelete,
    
    // Estados de validação (do hook base)
    validationErrors: baseEntity.validationErrors,
    showValidationModal: baseEntity.showValidationModal,
    
    // Ações de modal (do hook base)
    handleAddRIR: baseEntity.handleAdd,
    handleViewRIR: baseEntity.handleView,
    handleEditRIR: baseEntity.handleEdit,
    handleCloseModal: baseEntity.handleCloseModal,
    
    // Ações de paginação (do hook base)
    handlePageChange: baseEntity.handlePageChange,
    handleItemsPerPageChange: baseEntity.handleItemsPerPageChange,
    
    // Ações de filtros (do hook base + customizadas)
    setSearchTerm: baseEntity.setSearchTerm,
    handleKeyPress,
    clearFiltros,
    setFiltros,
    
    // Ações CRUD (customizadas)
    carregarRIRs: loadDataWithFilters,
    buscarRIRPorId,
    criarRIR,
    atualizarRIR,
    excluirRIR,
    
    // Ações de exclusão (do hook base)
    handleDeleteRIR: baseEntity.handleDelete,
    handleConfirmDelete: baseEntity.handleConfirmDelete,
    handleCloseDeleteModal: baseEntity.handleCloseDeleteModal,
    
    // Integrações
    buscarProdutosPedido,
    buscarNQAGrupo,
    buscarPlanoPorLote,
    buscarPedidosAprovados,
    buscarGrupos
  };
};
