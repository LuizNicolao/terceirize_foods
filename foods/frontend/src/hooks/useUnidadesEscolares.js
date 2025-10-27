import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import UnidadesEscolaresService from '../services/unidadesEscolares';
import RotasService from '../services/rotas';
import FiliaisService from '../services/filiais';
import { useBaseEntity } from './common/useBaseEntity';
import useTableSort from './common/useTableSort';

export const useUnidadesEscolares = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('unidades escolares', UnidadesEscolaresService, {
    initialItemsPerPage: 20,
    initialFilters: { rotaFilter: 'todos', filialFilter: 'todos' },
    enableStats: true,
    enableDelete: true
  });


  // Hook de ordenação híbrida
  const {
    sortedData: unidadesOrdenadas,
    sortField,
    sortDirection,
    handleSort,
    isSortingLocally
  } = useTableSort({
    data: baseEntity.items,
    threshold: 100,
    totalItems: baseEntity.totalItems
  });

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
   * Carrega rotas ativas (opcionalmente filtradas por filial)
   */
  const loadRotas = useCallback(async (filialId = null) => {
    try {
      setLoadingRotas(true);
      let result;
      
      if (filialId && filialId !== 'todos') {
        // Buscar rotas de uma filial específica
        result = await RotasService.buscarPorFilial(filialId);
      } else {
        // Buscar todas as rotas ativas
        result = await RotasService.buscarAtivas();
      }
      
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
   * Carrega estatísticas específicas das unidades escolares (com filtros aplicados)
   */
  const loadEstatisticasUnidades = useCallback(async (filtros = {}) => {
    try {
      const params = {
        search: filtros.search || baseEntity.searchTerm || undefined,
        status: filtros.status || baseEntity.statusFilter || undefined,
        estado: filtros.estado || baseEntity.filters.estado || undefined,
        cidade: filtros.cidade || baseEntity.filters.cidade || undefined,
        centro_distribuicao: filtros.centro_distribuicao || baseEntity.filters.centro_distribuicao || undefined,
        rota_id: filtros.rota_id || baseEntity.filters.rotaFilter || undefined,
        filial_id: filtros.filial_id || baseEntity.filters.filialFilter || undefined
      };

      // Remover parâmetros undefined
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === 'todos') {
          delete params[key];
        }
      });

      const result = await UnidadesEscolaresService.buscarEstatisticas(params);
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
  }, [baseEntity.searchTerm, baseEntity.statusFilter, baseEntity.filters]);

  // Funções loadDataWithFilters e loadDataWithRotaFilter removidas
  // useBaseEntity agora gerencia automaticamente os filtros através do getFilterParams

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
    await baseEntity.loadData();
    await loadEstatisticasUnidades();
  }, [baseEntity, loadEstatisticasUnidades]);

  /**
   * Funções utilitárias
   */
  const getRotaName = useCallback((rotaId) => {
    if (!rotaId) return 'N/A';
    const rota = rotas.find(r => r.id === parseInt(rotaId));
    return rota && rota.nome ? rota.nome : 'Rota não encontrada';
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

  // Recarregar estatísticas quando os filtros mudarem
  useEffect(() => {
    loadEstatisticasUnidades();
  }, [baseEntity.searchTerm, baseEntity.statusFilter, baseEntity.filters.rotaFilter, baseEntity.filters.filialFilter, loadEstatisticasUnidades]);

  // useBaseEntity agora gerencia automaticamente os filtros customizados
  // Não é mais necessário useEffect ou override de loadData

  return {
    // Estados principais (usa dados ordenados se ordenação local)
    unidades: isSortingLocally ? unidadesOrdenadas : baseEntity.items,
    loading: baseEntity.loading,
    
    estatisticas: estatisticasUnidades, // Usar estatísticas específicas das unidades escolares
    
    // Estados de modal (do hook base)
    showModal: baseEntity.showModal,
    viewMode: baseEntity.viewMode,
    editingUnidade: baseEntity.editingItem,
    
    // Estados de ordenação
    sortField,
    sortDirection,
    isSortingLocally,
    
    // Estados de exclusão (do hook base)
    showDeleteConfirmModal: baseEntity.showDeleteConfirmModal,
    unidadeToDelete: baseEntity.itemToDelete,
    
    // Estados de paginação (do hook base)
    currentPage: baseEntity.currentPage,
    totalPages: baseEntity.totalPages,
    totalItems: baseEntity.totalItems,
    itemsPerPage: baseEntity.itemsPerPage,
    
    // Estados de filtros
    searchTerm: baseEntity.searchTerm,
    statusFilter: baseEntity.statusFilter,
    rotaFilter: baseEntity.filters.rotaFilter,
    filialFilter: baseEntity.filters.filialFilter,
    
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
    setSearchTerm: baseEntity.setSearchTerm,
    handleKeyPress: baseEntity.handleKeyPress,
    clearSearch: baseEntity.clearSearch,
    setStatusFilter: baseEntity.setStatusFilter,
    setRotaFilter: (value) => baseEntity.updateFilter('rotaFilter', value),
    setFilialFilter: (value) => {
      baseEntity.updateFilter('filialFilter', value);
      // Quando a filial muda, recarregar rotas filtradas por essa filial
      loadRotas(value);
      // Resetar filtro de rota para 'todos' quando mudar a filial
      baseEntity.updateFilter('rotaFilter', 'todos');
    },
    
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
    formatCurrency,
    
    // Ações de ordenação
    handleSort
  };
};