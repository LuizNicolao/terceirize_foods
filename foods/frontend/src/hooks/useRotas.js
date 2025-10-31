import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import RotasService from '../services/rotas';
import api from '../services/api';
import { useBaseEntity } from './common/useBaseEntity';
import useTableSort from './common/useTableSort';

export const useRotas = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('rotas', RotasService, {
    initialItemsPerPage: 20,
    initialFilters: { filialFilter: 'todos' },
    enableStats: true,
    enableDelete: true
  });

  // Hook de ordenação híbrida
  const {
    sortedData: rotasOrdenadas,
    sortField,
    sortDirection,
    handleSort,
    isSortingLocally
  } = useTableSort({
    data: baseEntity.items,
    threshold: 100,
    totalItems: baseEntity.totalItems
  });

  // Estados específicos das rotas
  const [filiais, setFiliais] = useState([]);
  const [loadingFiliais, setLoadingFiliais] = useState(false);
  const [tiposRota, setTiposRota] = useState([]);
  const [loadingTiposRota, setLoadingTiposRota] = useState(false);
  const [unidadesEscolares, setUnidadesEscolares] = useState([]);
  const [loadingUnidades, setLoadingUnidades] = useState(false);
  const [showUnidades, setShowUnidades] = useState(false);
  const [totalUnidades, setTotalUnidades] = useState(0);
  
  // Estados para unidades disponíveis por filial
  const [unidadesDisponiveis, setUnidadesDisponiveis] = useState([]);
  const [loadingUnidadesDisponiveis, setLoadingUnidadesDisponiveis] = useState(false);
  const [filialSelecionada, setFilialSelecionada] = useState(null);

  // Estados de estatísticas específicas das rotas
  const [estatisticasRotas, setEstatisticasRotas] = useState({
    total_rotas: 0,
    rotas_ativas: 0,
    rotas_inativas: 0,
    rotas_semanais: 0,
    rotas_quinzenais: 0,
    rotas_mensais: 0,
    rotas_transferencia: 0,
    distancia_total: 0,
    custo_total_diario: 0
  });

  /**
   * Carrega filiais
   */
  const loadFiliais = useCallback(async () => {
    try {
      setLoadingFiliais(true);
      const response = await api.get('/filiais');
      setFiliais(response.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
      setFiliais([]);
      toast.error('Erro ao carregar filiais');
    } finally {
      setLoadingFiliais(false);
    }
  }, []);

  /**
   * Carrega tipos de rota por filial
   */
  const loadTiposRota = useCallback(async (filialId) => {
    console.log('🔍 loadTiposRota chamado com filialId:', filialId);
    
    if (!filialId || filialId === 'todos') {
      console.log('⚠️ FilialId inválido ou "todos", limpando tipos de rota');
      setTiposRota([]);
      return;
    }

    try {
      console.log('📡 Carregando tipos de rota para filial:', filialId);
      setLoadingTiposRota(true);
      const TipoRotaService = (await import('../services/tipoRota')).default;
      const result = await TipoRotaService.buscarPorFilial(filialId);
      
      console.log('📦 Resultado da busca de tipos de rota:', result);
      
      if (result.success) {
        const tipos = result.data || [];
        console.log('✅ Tipos de rota carregados:', tipos.length, 'tipos encontrados');
        tipos.forEach((tipo, idx) => {
          console.log(`   ${idx + 1}. ID: ${tipo.id}, Nome: "${tipo.nome}", Grupo: "${tipo.grupo_nome || 'N/A'}"`);
        });
        setTiposRota(tipos);
      } else {
        console.error('❌ Erro ao carregar tipos de rota:', result.error);
        setTiposRota([]);
        toast.error(result.error || 'Erro ao carregar tipos de rota');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar tipos de rota:', error);
      console.error('   Detalhes:', error.response?.data || error.message);
      setTiposRota([]);
      toast.error('Erro ao carregar tipos de rota');
    } finally {
      setLoadingTiposRota(false);
    }
  }, []);

  /**
   * Carrega estatísticas específicas das rotas
   */
  const loadEstatisticasRotas = useCallback(async () => {
    try {
      const result = await RotasService.buscarEstatisticas();
      if (result.success) {
        const stats = result.data || {};
        setEstatisticasRotas({
          total_rotas: parseInt(stats.total_rotas) || 0,
          rotas_ativas: parseInt(stats.rotas_ativas) || 0,
          rotas_inativas: parseInt(stats.rotas_inativas) || 0,
          rotas_semanais: parseInt(stats.rotas_semanais) || 0,
          rotas_quinzenais: parseInt(stats.rotas_quinzenais) || 0,
          rotas_mensais: parseInt(stats.rotas_mensais) || 0,
          rotas_transferencia: parseInt(stats.rotas_transferencia) || 0,
          distancia_total: parseFloat(stats.distancia_total) || 0,
          custo_total_diario: parseFloat(stats.custo_total_diario) || 0
        });
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }, []);

  /**
   * Carrega unidades escolares de uma rota
   */
  const loadUnidadesEscolares = useCallback(async (rotaId) => {
    try {
      setLoadingUnidades(true);
      
      const result = await RotasService.buscarUnidadesEscolares(rotaId);
      
      if (result.success) {
        setUnidadesEscolares(result.data?.unidades || []);
        setTotalUnidades(result.data?.total || 0);
      } else {
        setUnidadesEscolares([]);
        setTotalUnidades(0);
      }
    } catch (error) {
      console.error('Erro ao carregar unidades escolares:', error);
      setUnidadesEscolares([]);
      setTotalUnidades(0);
    } finally {
      setLoadingUnidades(false);
    }
  }, []);

  /**
   * Carrega unidades escolares disponíveis por filial considerando grupo da rota
   * Regra: Escola só não aparece se já está em uma rota do mesmo grupo
   */
  const loadUnidadesDisponiveisPorFilial = useCallback(async (filialId, grupoId = null, rotaId = null) => {
    if (!filialId) {
      setUnidadesDisponiveis([]);
      setFilialSelecionada(null);
      return;
    }

    try {
      setLoadingUnidadesDisponiveis(true);
      setFilialSelecionada(filialId);
      
      const result = await RotasService.buscarUnidadesDisponiveisParaRota(filialId, grupoId, rotaId);
      
      if (result.success) {
        setUnidadesDisponiveis(result.data || []);
      } else {
        setUnidadesDisponiveis([]);
        toast.error(result.error || 'Erro ao carregar unidades disponíveis');
      }
    } catch (error) {
      console.error('Erro ao carregar unidades disponíveis:', error);
      setUnidadesDisponiveis([]);
      toast.error('Erro ao carregar unidades disponíveis');
    } finally {
      setLoadingUnidadesDisponiveis(false);
    }
  }, []);

  /**
   * Carrega todas as unidades escolares por filial (incluindo as já vinculadas) - para edição
   */
  const loadTodasUnidadesPorFilial = useCallback(async (filialId) => {
    if (!filialId) {
      setUnidadesDisponiveis([]);
      setFilialSelecionada(null);
      return;
    }

    try {
      setLoadingUnidadesDisponiveis(true);
      setFilialSelecionada(filialId);
      
      const result = await api.get(`/unidades-escolares/filial/${filialId}`);
      
      if (result.data.success) {
        setUnidadesDisponiveis(result.data.data || []);
      } else {
        setUnidadesDisponiveis([]);
        toast.error('Erro ao carregar unidades da filial');
      }
    } catch (error) {
      console.error('Erro ao carregar unidades da filial:', error);
      setUnidadesDisponiveis([]);
      toast.error('Erro ao carregar unidades da filial');
    } finally {
      setLoadingUnidadesDisponiveis(false);
    }
  }, []);

  // Função loadDataWithFilters removida - useBaseEntity gerencia automaticamente

  /**
   * Submissão customizada que recarrega estatísticas
   */
  const onSubmitCustom = useCallback(async (formData) => {
    await baseEntity.onSubmit(formData);
    // Recarregar estatísticas após salvar
    await loadEstatisticasRotas();
  }, [baseEntity, loadEstatisticasRotas]);

  /**
   * Exclusão customizada que recarrega estatísticas
   */
  const handleDeleteCustom = useCallback(async () => {
    await baseEntity.handleConfirmDelete();
    // Recarregar estatísticas após excluir
    await loadEstatisticasRotas();
  }, [baseEntity, loadEstatisticasRotas]);

  /**
   * Handlers customizados para modais
   */
  const handleViewRota = useCallback((rota) => {
    baseEntity.handleView(rota);
    // Carregar unidades escolares automaticamente
    loadUnidadesEscolares(rota.id);
  }, [baseEntity, loadUnidadesEscolares]);

  const handleEditRota = useCallback((rota) => {
    baseEntity.handleEdit(rota);
    // Carregar unidades escolares automaticamente
    loadUnidadesEscolares(rota.id);
  }, [baseEntity, loadUnidadesEscolares]);

  const handleCloseModalCustom = useCallback(() => {
    baseEntity.handleCloseModal();
    setShowUnidades(false);
    setUnidadesEscolares([]);
    setTotalUnidades(0);
  }, [baseEntity]);

  /**
   * Funções utilitárias
   */
  const getFilialName = useCallback((filialId) => {
    if (!filialId) return 'N/A';
    const filial = filiais.find(f => f.id === parseInt(filialId));
    return filial ? filial.filial : 'Filial não encontrada';
  }, [filiais]);

  const formatCurrency = useCallback((value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  }, []);

  const formatFrequenciaEntrega = useCallback((tipo) => {
    const tipos = {
      'semanal': 'Semanal',
      'quinzenal': 'Quinzenal',
      'mensal': 'Mensal',
      'transferencia': 'Transferência'
    };
    return tipos[tipo] || tipo;
  }, []);

  const toggleUnidades = useCallback(() => {
    setShowUnidades(!showUnidades);
  }, [showUnidades]);

  // Carregar dados iniciais
  useEffect(() => {
    loadFiliais();
    loadEstatisticasRotas();
  }, [loadFiliais, loadEstatisticasRotas]);

  // useEffect removidos - useBaseEntity já gerencia filtros e paginação automaticamente

  return {
    // Estados principais (usa dados ordenados se ordenação local)
    rotas: isSortingLocally ? rotasOrdenadas : baseEntity.items,
    loading: baseEntity.loading,
    
    // Estados de ordenação
    sortField,
    sortDirection,
    isSortingLocally,
    
    // Estados de busca
    estatisticas: estatisticasRotas, // Usar estatísticas específicas das rotas
    
    // Estados de modal (do hook base)
    showModal: baseEntity.showModal,
    viewMode: baseEntity.viewMode,
    editingRota: baseEntity.editingItem,
    
    // Estados de exclusão (do hook base)
    showDeleteConfirmModal: baseEntity.showDeleteConfirmModal,
    rotaToDelete: baseEntity.itemToDelete,
    
    // Estados de paginação (do hook base)
    currentPage: baseEntity.currentPage,
    totalPages: baseEntity.totalPages,
    totalItems: baseEntity.totalItems,
    itemsPerPage: baseEntity.itemsPerPage,
    
    // Estados de filtros
    searchTerm: baseEntity.searchTerm,
    filialFilter: baseEntity.filters.filialFilter,
    
    // Estados de validação (do hook base)
    validationErrors: baseEntity.validationErrors,
    showValidationModal: baseEntity.showValidationModal,
    
    // Estados específicos das rotas
    filiais,
    loadingFiliais,
    tiposRota,
    loadingTiposRota,
    unidadesEscolares,
    loadingUnidades,
    showUnidades,
    totalUnidades,
    estatisticasRotas,
    
    // Estados para unidades disponíveis por filial
    unidadesDisponiveis,
    loadingUnidadesDisponiveis,
    filialSelecionada,
    
    // Ações de modal (customizadas)
    handleAddRota: baseEntity.handleAdd,
    handleViewRota,
    handleEditRota,
    handleCloseModal: handleCloseModalCustom,
    
    // Ações de paginação (do hook base)
    handlePageChange: baseEntity.handlePageChange,
    handleItemsPerPageChange: baseEntity.handleItemsPerPageChange,
    
    // Ações de filtros
    setSearchTerm: baseEntity.setSearchTerm,
    clearSearch: baseEntity.clearSearch,
    handleKeyPress: baseEntity.handleKeyPress,
    setFilialFilter: (value) => baseEntity.updateFilter('filialFilter', value),
    
    // Ações de CRUD (customizadas)
    onSubmit: onSubmitCustom,
    handleDeleteRota: baseEntity.handleDelete,
    handleConfirmDelete: handleDeleteCustom,
    handleCloseDeleteModal: baseEntity.handleCloseDeleteModal,
    
    // Ações de validação (do hook base)
    handleCloseValidationModal: baseEntity.handleCloseValidationModal,
    
    // Ações específicas das rotas
    toggleUnidades,
    loadUnidadesEscolares,
    loadUnidadesDisponiveisPorFilial,
    loadTodasUnidadesPorFilial,
    loadTiposRota,
    
    // Funções utilitárias
    getFilialName,
    formatCurrency,
    formatFrequenciaEntrega,
    formatTipoRota: formatFrequenciaEntrega, // Mantido para compatibilidade
    
    // Ações de ordenação
    handleSort
  };
};