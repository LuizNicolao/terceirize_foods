import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import ClientesService from '../services/clientes';
import { useBaseEntity } from './common/useBaseEntity';
import { useFilters } from './common/useFilters';

export const useClientes = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('clientes', ClientesService, {
    initialItemsPerPage: 20,
    initialFilters: { ufFilter: 'todos' },
    enableStats: true,
    enableDelete: true
  });

  // Hook de filtros customizados para clientes
  const customFilters = useFilters({ ufFilter: 'todos' });


  // Estados de estatísticas específicas dos clientes
  const [estatisticasClientes, setEstatisticasClientes] = useState({
    total_clientes: 0,
    clientes_ativos: 0,
    com_email: 0,
    com_telefone: 0
  });

  /**
   * Calcula estatísticas específicas dos clientes
   */
  const calculateEstatisticas = useCallback((clientes) => {
    if (!clientes || clientes.length === 0) {
      setEstatisticasClientes({
        total_clientes: 0,
        clientes_ativos: 0,
        com_email: 0,
        com_telefone: 0
      });
      return;
    }

    const total = clientes.length;
    const ativos = clientes.filter(c => c.status === 'ativo').length;
    const comEmail = clientes.filter(c => c.email && c.email.trim() !== '').length;
    const comTelefone = clientes.filter(c => c.telefone && c.telefone.trim() !== '').length;

    setEstatisticasClientes({
      total_clientes: total,
      clientes_ativos: ativos,
      com_email: comEmail,
      com_telefone: comTelefone
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
      status: customFilters.statusFilter === 'ativo' ? 1 : customFilters.statusFilter === 'inativo' ? 0 : undefined,
      uf: customFilters.filters.ufFilter === 'todos' ? undefined : customFilters.filters.ufFilter
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
      razao_social: data.razao_social && data.razao_social.trim() !== '' ? data.razao_social.trim() : null,
      nome_fantasia: data.nome_fantasia && data.nome_fantasia.trim() !== '' ? data.nome_fantasia.trim() : null,
      cnpj: data.cnpj && data.cnpj.trim() !== '' ? data.cnpj.trim() : null,
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

  return {
    // Estados principais (do hook base)
    clientes: baseEntity.items,
    loading: baseEntity.loading,
    
    estatisticas: estatisticasClientes, // Usar estatísticas específicas dos clientes
    
    // Estados de modal (do hook base)
    showModal: baseEntity.showModal,
    viewMode: baseEntity.viewMode,
    editingCliente: baseEntity.editingItem,
    
    // Estados de exclusão (do hook base)
    showDeleteConfirmModal: baseEntity.showDeleteConfirmModal,
    clienteToDelete: baseEntity.itemToDelete,
    
    // Estados de paginação (do hook base)
    currentPage: baseEntity.currentPage,
    totalPages: baseEntity.totalPages,
    totalItems: baseEntity.totalItems,
    itemsPerPage: baseEntity.itemsPerPage,
    
    // Estados de filtros
    searchTerm: baseEntity.searchTerm,
    statusFilter: customFilters.statusFilter,
    ufFilter: customFilters.filters.ufFilter,
    
    // Estados de validação (do hook base)
    validationErrors: baseEntity.validationErrors,
    showValidationModal: baseEntity.showValidationModal,
    
    // Ações de modal (do hook base)
    handleAddCliente: baseEntity.handleAdd,
    handleViewCliente: baseEntity.handleView,
    handleEditCliente: baseEntity.handleEdit,
    handleCloseModal: baseEntity.handleCloseModal,
    
    // Ações de paginação (do hook base)
    handlePageChange: baseEntity.handlePageChange,
    handleItemsPerPageChange: baseEntity.handleItemsPerPageChange,
    
    // Ações de filtros
    setSearchTerm: baseEntity.setSearchTerm,
    clearSearch: baseEntity.clearSearch,
    setStatusFilter: customFilters.setStatusFilter,
    setUfFilter: (value) => customFilters.setFilters(prev => ({ ...prev, ufFilter: value })),
    
    // Ações de CRUD (customizadas)
    onSubmit: onSubmitCustom,
    handleDeleteCliente: baseEntity.handleDelete,
    handleConfirmDelete: handleDeleteCustom,
    handleCloseDeleteModal: baseEntity.handleCloseDeleteModal,
    
    // Ações de validação (do hook base)
    handleCloseValidationModal: baseEntity.handleCloseValidationModal,
    
    // Funções utilitárias
    formatDate
  };
};