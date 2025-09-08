import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import VeiculosService from '../services/veiculos';
import { useBaseEntity } from './common/useBaseEntity';
import { useFilters } from './common/useFilters';

export const useVeiculos = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('veículos', VeiculosService, {
    initialItemsPerPage: 20,
    initialFilters: { tipoFilter: 'todos' },
    enableStats: true,
    enableDelete: true
  });

  // Hook de filtros customizados para veículos
  const customFilters = useFilters({ tipoFilter: 'todos' });

  // Estados de estatísticas específicas dos veículos
  const [estatisticasVeiculos, setEstatisticasVeiculos] = useState({
    total_veiculos: 0,
    veiculos_ativos: 0,
    em_manutencao: 0,
    total_tipos: 0
  });

  /**
   * Carrega dados com filtros customizados
   */
  const loadDataWithFilters = useCallback(async () => {
    const params = {
      ...baseEntity.getPaginationParams(),
      ...customFilters.getFilterParams(),
      search: customFilters.searchTerm || undefined,
      status: customFilters.statusFilter === 'ativo' ? 1 : customFilters.statusFilter === 'inativo' ? 0 : undefined,
      tipo: customFilters.filters.tipoFilter !== 'todos' ? customFilters.filters.tipoFilter : undefined
    };

    await baseEntity.loadData(params);
  }, [baseEntity, customFilters]);

  /**
   * Calcula estatísticas específicas dos veículos
   */
  const calculateEstatisticas = useCallback((veiculos) => {
    if (!veiculos || veiculos.length === 0) {
      setEstatisticasVeiculos({
        total_veiculos: 0,
        veiculos_ativos: 0,
        em_manutencao: 0,
        total_tipos: 0
      });
      return;
    }

    const total = veiculos.length;
    const ativos = veiculos.filter(v => v.status === 'ativo').length;
    const manutencao = veiculos.filter(v => v.status === 'manutencao').length;
    const tipos = new Set(veiculos.map(v => v.tipo_veiculo)).size;

    setEstatisticasVeiculos({
          total_veiculos: total,
          veiculos_ativos: ativos,
          em_manutencao: manutencao,
          total_tipos: tipos
        });
  }, []);

  /**
   * Submissão customizada que recarrega dados
   */
  const onSubmitCustom = useCallback(async (formData) => {
    await baseEntity.onSubmit(formData);
    // Recalcular estatísticas após salvar
    calculateEstatisticas(baseEntity.items);
  }, [baseEntity, calculateEstatisticas]);

  /**
   * Exclusão customizada que recarrega dados
   */
  const handleDeleteCustom = useCallback(async () => {
    await baseEntity.handleConfirmDelete();
    // Recalcular estatísticas após excluir
    calculateEstatisticas(baseEntity.items);
  }, [baseEntity, calculateEstatisticas]);

  /**
   * Funções utilitárias
   */
  const getStatusLabel = useCallback((status) => {
    const statusLabels = {
      'ativo': 'Ativo',
      'inativo': 'Inativo',
      'manutencao': 'Em Manutenção',
      'aposentado': 'Aposentado'
    };
    return statusLabels[status] || status;
  }, []);

  const getTipoVeiculoLabel = useCallback((tipo) => {
    const tipoLabels = {
      'caminhao': 'Caminhão',
      'van': 'Van',
      'carro': 'Carro',
      'moto': 'Moto',
      'utilitario': 'Utilitário'
    };
    return tipoLabels[tipo] || tipo;
  }, []);

  const getCategoriaLabel = useCallback((categoria) => {
    const categoriaLabels = {
      'leve': 'Leve',
      'medio': 'Médio',
      'pesado': 'Pesado'
    };
    return categoriaLabels[categoria] || categoria;
  }, []);

  const formatCurrency = useCallback((value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  }, []);

  // Carregar dados quando filtros mudam
  useEffect(() => {
    loadDataWithFilters();
  }, [customFilters.searchTerm, customFilters.statusFilter, customFilters.filters]);

  // Carregar dados quando paginação muda
  useEffect(() => {
    loadDataWithFilters();
  }, [baseEntity.currentPage, baseEntity.itemsPerPage]);

  // Recalcular estatísticas quando os dados mudam
  useEffect(() => {
    calculateEstatisticas(baseEntity.items);
  }, [baseEntity.items, calculateEstatisticas]);

  return {
    // Estados principais (do hook base)
    veiculos: baseEntity.items,
    loading: baseEntity.loading,
    estatisticas: estatisticasVeiculos, // Usar estatísticas específicas dos veículos
    
    // Estados de modal (do hook base)
    showModal: baseEntity.showModal,
    viewMode: baseEntity.viewMode,
    editingVeiculo: baseEntity.editingItem,
    
    // Estados de exclusão (do hook base)
    showDeleteConfirmModal: baseEntity.showDeleteConfirmModal,
    veiculoToDelete: baseEntity.itemToDelete,
    
    // Estados de paginação (do hook base)
    currentPage: baseEntity.currentPage,
    totalPages: baseEntity.totalPages,
    totalItems: baseEntity.totalItems,
    itemsPerPage: baseEntity.itemsPerPage,
    
    // Estados de filtros
    searchTerm: customFilters.searchTerm,
    statusFilter: customFilters.statusFilter,
    tipoFilter: customFilters.filters.tipoFilter,
    
    // Estados de validação (do hook base)
    validationErrors: baseEntity.validationErrors,
    showValidationModal: baseEntity.showValidationModal,
    
    // Ações de modal (do hook base)
    handleAddVeiculo: baseEntity.handleAdd,
    handleViewVeiculo: baseEntity.handleView,
    handleEditVeiculo: baseEntity.handleEdit,
    handleCloseModal: baseEntity.handleCloseModal,
    
    // Ações de paginação (do hook base)
    handlePageChange: baseEntity.handlePageChange,
    handleItemsPerPageChange: baseEntity.handleItemsPerPageChange,
    
    // Ações de filtros
    setSearchTerm: customFilters.setSearchTerm,
    setStatusFilter: customFilters.setStatusFilter,
    setTipoFilter: (value) => customFilters.updateFilter('tipoFilter', value),
    
    // Ações de CRUD (customizadas)
    onSubmit: onSubmitCustom,
    handleDeleteVeiculo: baseEntity.handleDelete,
    handleConfirmDelete: handleDeleteCustom,
    handleCloseDeleteModal: baseEntity.handleCloseDeleteModal,
    
    // Ações de validação (do hook base)
    handleCloseValidationModal: baseEntity.handleCloseValidationModal,

    // Funções utilitárias
    getStatusLabel,
    getTipoVeiculoLabel,
    getCategoriaLabel,
    formatCurrency
  };
};