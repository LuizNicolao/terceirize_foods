import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import UnidadesEscolaresService from '../services/unidadesEscolares';
import { useBaseEntity } from './common/useBaseEntity';
import { useFilters } from './common/useFilters';

export const useUnidadesEscolares = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('unidades escolares', UnidadesEscolaresService, {
    initialItemsPerPage: 20,
    initialFilters: { statusFilter: 'todos' },
    enableStats: true,
    enableDelete: true
  });

  // Hook de filtros customizados para unidades escolares
  const customFilters = useFilters({ statusFilter: 'todos' });

  // Estados específicos das unidades escolares
  const [estatisticasUnidades, setEstatisticasUnidades] = useState({
    total_unidades: 0,
    unidades_ativas: 0,
    total_estados: 0,
    total_cidades: 0
  });

  /**
   * Carrega estatísticas específicas das unidades escolares
   */
  const loadEstatisticasUnidades = useCallback(async () => {
    try {
      const result = await UnidadesEscolaresService.getStats();
      if (result.success) {
        setEstatisticasUnidades({
          total_unidades: result.data.total || 0,
          unidades_ativas: result.data.ativas || 0,
          total_estados: result.data.estados || 0,
          total_cidades: result.data.cidades || 0
        });
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas das unidades escolares:', error);
    }
  }, []);

  /**
   * Aplica filtros customizados
   */
  const applyCustomFilters = useCallback((filters) => {
    const params = { ...baseEntity.filters };
    
    if (filters.statusFilter && filters.statusFilter !== 'todos') {
      params.status = filters.statusFilter;
    }
    
    if (filters.cidadeFilter && filters.cidadeFilter !== 'todos') {
      params.cidade = filters.cidadeFilter;
    }
    
    if (filters.estadoFilter && filters.estadoFilter !== 'todos') {
      params.estado = filters.estadoFilter;
    }
    
    if (filters.rotaFilter && filters.rotaFilter !== 'todos') {
      params.rota = filters.rotaFilter;
    }

    baseEntity.setFilters(params);
  }, [baseEntity.filters, baseEntity.setFilters]);

  /**
   * Formata data para exibição
   */
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (error) {
      return dateString;
    }
  }, []);

  /**
   * Formata status para exibição
   */
  const formatStatus = useCallback((status) => {
    if (status === 'ativo' || status === 'ATIVA' || status === 1) return 'Ativo';
    if (status === 'inativo' || status === 'INATIVA' || status === 0) return 'Inativo';
    return status || '-';
  }, []);

  /**
   * Visualização customizada que busca dados completos
   */
  const handleViewCustom = useCallback(async (unidade) => {
    try {
      // Buscar unidade completa
      const result = await UnidadesEscolaresService.getById(unidade.id);
      if (result.success) {
        baseEntity.handleView(result.data);
      } else {
        toast.error('Erro ao carregar dados da unidade escolar');
      }
    } catch (error) {
      console.error('Erro ao buscar unidade escolar:', error);
      toast.error('Erro ao carregar dados da unidade escolar');
    }
  }, [baseEntity]);

  /**
   * Edição customizada que busca dados completos
   */
  const handleEditCustom = useCallback(async (unidade) => {
    try {
      // Buscar unidade completa
      const result = await UnidadesEscolaresService.getById(unidade.id);
      if (result.success) {
        baseEntity.handleEdit(result.data);
      } else {
        toast.error('Erro ao carregar dados da unidade escolar');
      }
    } catch (error) {
      console.error('Erro ao buscar unidade escolar:', error);
      toast.error('Erro ao carregar dados da unidade escolar');
    }
  }, [baseEntity]);

  // Carregar estatísticas quando o hook for inicializado
  useEffect(() => {
    loadEstatisticasUnidades();
  }, [loadEstatisticasUnidades]);

  return {
    // Estados e funções do hook base
    ...baseEntity,
    
    // Mapear os dados corretamente
    unidades: baseEntity.items,
    estatisticas: estatisticasUnidades,
    
    // Estados específicos das unidades escolares
    estatisticasUnidades,
    
    // Estados de modal (mapeados corretamente)
    showModal: baseEntity.showModal,
    viewMode: baseEntity.viewMode,
    editingUnidade: baseEntity.editingItem,
    
    // Funções específicas das unidades escolares
    loadEstatisticasUnidades,
    applyCustomFilters,
    formatDate,
    formatStatus,
    
    // Mapear funções de ação com nomes corretos
    handleAddUnidade: baseEntity.handleAdd,
    handleViewUnidade: handleViewCustom,
    handleEditUnidade: handleEditCustom,
    handleDeleteUnidade: baseEntity.handleDelete,
    handleConfirmDelete: baseEntity.handleConfirmDelete,
    handleCloseDeleteModal: baseEntity.handleCloseDeleteModal,
    unidadeToDelete: baseEntity.itemToDelete,
    
    // Filtros customizados
    ...customFilters
  };
};