import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import UnidadesEscolaresService from '../services/unidadesEscolares';
import RotasService from '../services/rotas';
import FiliaisService from '../services/filiais';
import { useBaseEntity } from './common/useBaseEntity';
import { useFilters } from './common/useFilters';

export const useUnidadesEscolares = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('unidades escolares', UnidadesEscolaresService, {
    initialItemsPerPage: 20,
    initialFilters: { rotaFilter: 'todos' },
    enableStats: true,
    enableDelete: true
  });

  // Hook de filtros customizados para unidades escolares
  const customFilters = useFilters({ rotaFilter: 'todos' });

  // Estados específicos das unidades escolares
  const [rotas, setRotas] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [loadingRotas, setLoadingRotas] = useState(false);
  const [loadingFiliais, setLoadingFiliais] = useState(false);

  // Estados de estatísticas específicas das unidades escolares
  const [estatisticasUnidades, setEstatisticasUnidades] = useState({
    total_unidades: 0,
    unidades_ativas: 0,
    total_estados: 0,
    total_cidades: 0
  });

  /**
   * Carrega rotas ativas
   */
  const loadRotas = useCallback(async () => {
    try {
      setLoadingRotas(true);
      const result = await RotasService.buscarAtivas();
      if (result.success) {
        setRotas(result.data || []);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar rotas:', error);
      setRotas([]);
      toast.error('Erro ao carregar rotas');
    } finally {
      setLoadingRotas(false);
    }
  }, []);

  /**
   * Carrega filiais ativas
   */
  const loadFiliais = useCallback(async () => {
    try {
      setLoadingFiliais(true);
      const result = await FiliaisService.buscarAtivas();
      if (result.success) {
        setFiliais(result.data || []);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
      setFiliais([]);
      toast.error('Erro ao carregar filiais');
    } finally {
      setLoadingFiliais(false);
    }
  }, []);

  /**
   * Carrega estatísticas específicas das unidades escolares
   */
  const loadEstatisticasUnidades = useCallback(async () => {
    try {
      const result = await UnidadesEscolaresService.buscarEstatisticas();
      if (result.success) {
        setEstatisticasUnidades(result.data || {
          total_unidades: 0,
          unidades_ativas: 0,
          total_estados: 0,
          total_cidades: 0
        });
      } else {
        console.error('Erro ao carregar estatísticas:', result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }, []);

  /**
   * Carrega dados com filtros customizados
   */
  const loadDataWithFilters = useCallback(async () => {
    const params = {
      ...baseEntity.getPaginationParams(),
      ...customFilters.getFilterParams(),
      search: customFilters.searchTerm || undefined,
      status: customFilters.statusFilter === 'ativo' ? 1 : customFilters.statusFilter === 'inativo' ? 0 : undefined,
      rota: customFilters.filters.rotaFilter !== 'todos' ? customFilters.filters.rotaFilter : undefined
    };

    await baseEntity.loadData(params);
  }, [baseEntity, customFilters]);

  /**
   * Submissão customizada que recarrega estatísticas
   */
  const onSubmitCustom = useCallback(async (formData) => {
    await baseEntity.onSubmit(formData);
    // Recarregar estatísticas após salvar
    await loadEstatisticasUnidades();
  }, [baseEntity, loadEstatisticasUnidades]);

  /**
   * Exclusão customizada que recarrega estatísticas
   */
  const handleDeleteCustom = useCallback(async () => {
    await baseEntity.handleConfirmDelete();
    // Recarregar estatísticas após excluir
    await loadEstatisticasUnidades();
  }, [baseEntity, loadEstatisticasUnidades]);

  /**
   * Função para recarregar dados
   */
  const reloadData = useCallback(async () => {
    await loadDataWithFilters();
    await loadEstatisticasUnidades();
  }, [loadDataWithFilters, loadEstatisticasUnidades]);

  /**
   * Funções utilitárias
   */
  const getRotaName = useCallback((rotaId) => {
    if (!rotaId) return 'N/A';
    const rota = rotas.find(r => r.id === parseInt(rotaId));
    return rota ? rota.nome : 'Rota não encontrada';
  }, [rotas]);

  const formatCurrency = useCallback((value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    loadRotas();
    loadFiliais();
    loadEstatisticasUnidades();
  }, [loadRotas, loadFiliais, loadEstatisticasUnidades]);

  // Carregar dados quando filtros mudam
  useEffect(() => {
    loadDataWithFilters();
  }, [customFilters.searchTerm, customFilters.statusFilter, customFilters.filters, loadDataWithFilters]);

  // Carregar dados quando paginação muda
  useEffect(() => {
    loadDataWithFilters();
  }, [baseEntity.currentPage, baseEntity.itemsPerPage, loadDataWithFilters]);

  return {
    // Estados principais (do hook base)
    unidades: baseEntity.items,
    loading: baseEntity.loading,
    estatisticas: estatisticasUnidades, // Usar estatísticas específicas das unidades escolares
    
    // Estados de modal (do hook base)
    showModal: baseEntity.showModal,
    viewMode: baseEntity.viewMode,
    editingUnidade: baseEntity.editingItem,
    
    // Estados de exclusão (do hook base)
    showDeleteConfirmModal: baseEntity.showDeleteConfirmModal,
    unidadeToDelete: baseEntity.itemToDelete,
    
    // Estados de paginação (do hook base)
    currentPage: baseEntity.currentPage,
    totalPages: baseEntity.totalPages,
    totalItems: baseEntity.totalItems,
    itemsPerPage: baseEntity.itemsPerPage,
    
    // Estados de filtros
    searchTerm: customFilters.searchTerm,
    statusFilter: customFilters.statusFilter,
    rotaFilter: customFilters.filters.rotaFilter,
    
    // Estados de validação (do hook base)
    validationErrors: baseEntity.validationErrors,
    showValidationModal: baseEntity.showValidationModal,
    
    // Estados específicos das unidades escolares
    rotas,
    filiais,
    loadingRotas,
    loadingFiliais,
    
    // Ações de modal (do hook base)
    handleAddUnidade: baseEntity.handleAdd,
    handleViewUnidade: baseEntity.handleView,
    handleEditUnidade: baseEntity.handleEdit,
    handleCloseModal: baseEntity.handleCloseModal,
    
    // Ações de paginação (do hook base)
    handlePageChange: baseEntity.handlePageChange,
    handleItemsPerPageChange: baseEntity.handleItemsPerPageChange,
    
    // Ações de filtros
    setSearchTerm: customFilters.setSearchTerm,
    setStatusFilter: customFilters.setStatusFilter,
    setRotaFilter: (value) => customFilters.updateFilter('rotaFilter', value),
    
    // Ações de CRUD (customizadas)
    onSubmit: onSubmitCustom,
    handleDeleteUnidade: baseEntity.handleDelete,
    handleConfirmDelete: handleDeleteCustom,
    handleCloseDeleteModal: baseEntity.handleCloseDeleteModal,
    reloadData,
    
    // Ações de validação (do hook base)
    handleCloseValidationModal: baseEntity.handleCloseValidationModal,
    
    // Funções utilitárias
    getRotaName,
    formatCurrency
  };
};