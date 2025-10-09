import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import FiliaisService from '../services/filiais';
import { useBaseEntity } from './common/useBaseEntity';
import { useFilters } from './common/useFilters';
import useTableSort from './common/useTableSort';

export const useFiliais = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('filiais', FiliaisService, {
    initialItemsPerPage: 20,
    initialFilters: {},
    enableStats: true,
    enableDelete: true
  });

  // Hook de filtros customizados para filiais
  const customFilters = useFilters({});

  // Hook de ordenação híbrida
  const {
    sortedData: filiaisOrdenadas,
    sortField,
    sortDirection,
    handleSort,
    isSortingLocally
  } = useTableSort({
    data: baseEntity.items,
    threshold: 100,
    totalItems: baseEntity.totalItems
  });

  // Hook de busca com debounce

  // Estados de estatísticas específicas das filiais
  const [estatisticasFiliais, setEstatisticasFiliais] = useState({
    total_filiais: 0,
    filiais_ativas: 0,
    filiais_inativas: 0,
    com_cnpj: 0
  });

  /**
   * Calcula estatísticas específicas das filiais
   */
  const calculateEstatisticas = useCallback((filiais) => {
    if (!filiais || filiais.length === 0) {
      setEstatisticasFiliais({
        total_filiais: 0,
        filiais_ativas: 0,
        filiais_inativas: 0,
        com_cnpj: 0
      });
      return;
    }

    const total = filiais.length;
    const ativas = filiais.filter(f => f.status === 1).length;
    const inativas = filiais.filter(f => f.status === 0).length;
    const comCnpj = filiais.filter(f => f.cnpj && f.cnpj.trim() !== '').length;

    setEstatisticasFiliais({
      total_filiais: total,
      filiais_ativas: ativas,
      filiais_inativas: inativas,
      com_cnpj: comCnpj
    });
  }, []);

  /**
   * Carrega dados com filtros customizados
   */
  const loadDataWithFilters = useCallback(async () => {
    const params = {
      ...baseEntity.getPaginationParams(),
      ...customFilters.getFilterParams(),
      search: customFilters.searchTerm || undefined,
      status: customFilters.statusFilter === 'ativo' ? 1 : customFilters.statusFilter === 'inativo' ? 0 : undefined
    };

    await baseEntity.loadData(params);
  }, [baseEntity, customFilters]);

  /**
   * Submissão customizada com limpeza de dados
   */
  const onSubmitCustom = useCallback(async (data) => {
    // Limpar campos vazios para evitar problemas de validação
    const cleanData = {
      ...data,
      codigo_filial: data.codigo_filial && data.codigo_filial.trim() !== '' ? data.codigo_filial.trim() : null,
      cnpj: data.cnpj && data.cnpj.trim() !== '' ? data.cnpj.trim() : null,
      filial: data.filial && data.filial.trim() !== '' ? data.filial.trim() : null,
      razao_social: data.razao_social && data.razao_social.trim() !== '' ? data.razao_social.trim() : null,
      email: data.email && data.email.trim() !== '' ? data.email.trim() : null,
      telefone: data.telefone && data.telefone.trim() !== '' ? data.telefone.trim() : null
    };

    await baseEntity.onSubmit(cleanData);
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
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
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

  // Recarregar dados quando busca mudar
  useEffect(() => {
    baseEntity.loadData();
  }, [baseEntity.searchTerm]);

  return {
    // Estados principais (do hook base)
    filiais: isSortingLocally ? filiaisOrdenadas : baseEntity.items,
    loading: baseEntity.loading,
    
    // Estados de ordenação
    sortField,
    sortDirection,
    isSortingLocally,
    
    // Estados de busca
    estatisticas: estatisticasFiliais, // Usar estatísticas específicas das filiais
    
    // Estados de modal (do hook base)
    showModal: baseEntity.showModal,
    viewMode: baseEntity.viewMode,
    editingFilial: baseEntity.editingItem,
    
    // Estados de exclusão (do hook base)
    showDeleteConfirmModal: baseEntity.showDeleteConfirmModal,
    filialToDelete: baseEntity.itemToDelete,
    
    // Estados de paginação (do hook base)
    currentPage: baseEntity.currentPage,
    totalPages: baseEntity.totalPages,
    totalItems: baseEntity.totalItems,
    itemsPerPage: baseEntity.itemsPerPage,
    
    // Estados de filtros
    searchTerm: baseEntity.searchTerm,
    statusFilter: customFilters.statusFilter,
    
    // Estados de validação (do hook base)
    validationErrors: baseEntity.validationErrors,
    showValidationModal: baseEntity.showValidationModal,
    
    // Ações de modal (do hook base)
    handleAddFilial: baseEntity.handleAdd,
    handleViewFilial: baseEntity.handleView,
    handleEditFilial: baseEntity.handleEdit,
    handleCloseModal: baseEntity.handleCloseModal,
    
    // Ações de paginação (do hook base)
    handlePageChange: baseEntity.handlePageChange,
    handleItemsPerPageChange: baseEntity.handleItemsPerPageChange,
    
    // Ações de filtros
    setSearchTerm: baseEntity.setSearchTerm,
    clearSearch: baseEntity.clearSearch,
    setStatusFilter: customFilters.setStatusFilter,
    
    // Ações de CRUD (customizadas)
    onSubmit: onSubmitCustom,
    handleDeleteFilial: baseEntity.handleDelete,
    handleConfirmDelete: handleDeleteCustom,
    handleCloseDeleteModal: baseEntity.handleCloseDeleteModal,
    
    // Ações de validação (do hook base)
    handleCloseValidationModal: baseEntity.handleCloseValidationModal,
    
    // Funções utilitárias
    formatDate,
    
    // Ações de ordenação
    handleSort
  };
};