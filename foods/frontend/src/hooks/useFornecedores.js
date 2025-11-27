import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import FornecedoresService from '../services/fornecedores';
import { useBaseEntity } from './common/useBaseEntity';
import { useFilters } from './common/useFilters';
import useTableSort from './common/useTableSort';
import { useExport } from './common/useExport';
import { useAuditoria } from './common/useAuditoria';

export const useFornecedores = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('fornecedores', FornecedoresService, {
    initialItemsPerPage: 20,
    initialFilters: {},
    enableStats: true,
    enableDelete: true
  });

  // Hook de filtros customizados para fornecedores
  const customFilters = useFilters({});

  // Hook de ordenação híbrida
  const {
    sortedData: fornecedoresOrdenados,
    sortField,
    sortDirection,
    handleSort,
    isSortingLocally
  } = useTableSort({
    data: baseEntity.items,
    threshold: 100,
    totalItems: baseEntity.totalItems
  });

  // Hook de exportação
  const { handleExportXLSX: exportXLSX, handleExportPDF: exportPDF } = useExport(FornecedoresService);

  // Hook de auditoria
  const {
    showAuditModal,
    auditLogs,
    auditLoading,
    auditFilters,
    handleOpenAuditModal,
    handleCloseAuditModal,
    handleApplyAuditFilters,
    handleExportAuditXLSX,
    handleExportAuditPDF,
    setAuditFilters
  } = useAuditoria('fornecedores');

  // Hook de formulário
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Estados específicos dos fornecedores
  const [estatisticasFornecedores, setEstatisticasFornecedores] = useState({
    total_fornecedores: 0,
    fornecedores_ativos: 0,
    com_email: 0,
    com_telefone: 0
  });

  /**
   * Carrega estatísticas específicas dos fornecedores
   */
  const loadEstatisticas = useCallback(async () => {
    try {
      const result = await FornecedoresService.buscarEstatisticas();
      if (result.success) {
        setEstatisticasFornecedores(result.data || {
          total_fornecedores: 0,
          fornecedores_ativos: 0,
          com_email: 0,
          com_telefone: 0
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
      status: customFilters.statusFilter === 'ativo' ? 1 : customFilters.statusFilter === 'inativo' ? 0 : undefined
    };

    await baseEntity.loadData(params);
  }, [baseEntity, customFilters]);

  /**
   * Submissão customizada
   */
  const onSubmitCustom = useCallback(async (data) => {
    await baseEntity.onSubmit(data);
    // Recarregar estatísticas após salvar
    loadEstatisticas();
  }, [baseEntity, loadEstatisticas]);

  /**
   * Exclusão customizada que recarrega dados
   */
  const handleDeleteCustom = useCallback(async () => {
    await baseEntity.handleConfirmDelete();
    // Recarregar estatísticas após excluir
    loadEstatisticas();
  }, [baseEntity, loadEstatisticas]);

  /**
   * Abertura de modal customizada com reset do formulário
   */
  const handleOpenModalCustom = useCallback((fornecedor = null, isView = false) => {
    baseEntity.handleOpenModal(fornecedor, isView);
    
    if (fornecedor) {
      reset(fornecedor);
    } else {
      reset({
        razao_social: '',
        nome_fantasia: '',
        cnpj: '',
        email: '',
        telefone: '',
        cep: '',
        logradouro: '',
        numero: '',
        bairro: '',
        municipio: '',
        uf: '',
        status: 1
      });
    }
  }, [baseEntity, reset]);

  /**
   * Fechamento de modal customizado com reset do formulário
   */
  const handleCloseModalCustom = useCallback(() => {
    baseEntity.handleCloseModal();
    reset();
  }, [baseEntity, reset]);

  /**
   * Exportação customizada com parâmetros de busca
   */
  const handleExportXLSXCustom = useCallback(async () => {
    const params = {
      search: customFilters.searchTerm,
      page: baseEntity.currentPage,
      limit: baseEntity.itemsPerPage
    };
    await exportXLSX(params);
  }, [exportXLSX, customFilters.searchTerm, baseEntity.currentPage, baseEntity.itemsPerPage]);

  const handleExportPDFCustom = useCallback(async () => {
    const params = {
      search: customFilters.searchTerm,
      page: baseEntity.currentPage,
      limit: baseEntity.itemsPerPage
    };
    await exportPDF(params);
  }, [exportPDF, customFilters.searchTerm, baseEntity.currentPage, baseEntity.itemsPerPage]);

  /**
   * Função para recarregar dados
   */
  const reloadData = useCallback(() => {
    loadDataWithFilters();
    loadEstatisticas();
  }, [loadDataWithFilters, loadEstatisticas]);

  // Carregar dados quando filtros mudam
  useEffect(() => {
    loadDataWithFilters();
  }, [customFilters.searchTerm, customFilters.statusFilter, customFilters.filters]);

  // Carregar dados quando paginação muda
  useEffect(() => {
    loadDataWithFilters();
  }, [baseEntity.currentPage, baseEntity.itemsPerPage]);

  // Carregar estatísticas iniciais
  useEffect(() => {
    loadEstatisticas();
  }, [loadEstatisticas]);


  return {
    // Estados principais (usa dados ordenados se ordenação local)
    fornecedores: isSortingLocally ? fornecedoresOrdenados : baseEntity.items,
    loading: baseEntity.loading,
    
    estatisticas: estatisticasFornecedores, // Usar estatísticas específicas dos fornecedores
    
    // Estados de modal (do hook base)
    showModal: baseEntity.showModal,
    viewMode: baseEntity.viewMode,
    editingFornecedor: baseEntity.editingItem,
    
    // Estados de exclusão (do hook base)
    showDeleteConfirmModal: baseEntity.showDeleteConfirmModal,
    fornecedorToDelete: baseEntity.itemToDelete,
    
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
    
    // Estados de ordenação
    sortField,
    sortDirection,
    isSortingLocally,
    
    // Estados específicos dos fornecedores
    searching: baseEntity.isSearching,
    
    // Estados de auditoria (do hook auditoria)
    showAuditModal,
    auditLogs,
    auditLoading,
    auditFilters,
    
    // Estados de formulário
    errors,
    
    // Ações de modal (customizadas)
    handleOpenModal: handleOpenModalCustom,
    handleCloseModal: handleCloseModalCustom,
    
    // Ações de paginação (do hook base)
    handlePageChange: baseEntity.handlePageChange,
    handleItemsPerPageChange: baseEntity.handleItemsPerPageChange,
    
    // Ações de filtros
    handleSearch: baseEntity.setSearchTerm,
    setSearchTerm: baseEntity.setSearchTerm,
    clearSearch: baseEntity.clearSearch,
    handleKeyPress: baseEntity.handleKeyPress,
    setStatusFilter: customFilters.setStatusFilter,
    
    // Ações de CRUD (customizadas)
    onSubmit: onSubmitCustom,
    handleDeleteFornecedor: baseEntity.handleDelete,
    handleConfirmDelete: handleDeleteCustom,
    handleCloseDeleteModal: baseEntity.handleCloseDeleteModal,
    
    // Ações de validação (do hook base)
    handleCloseValidationModal: baseEntity.handleCloseValidationModal,
    
    // Ações de formulário
    register,
    handleSubmit,
    reset,
    
    // Ações de dados
    loadFornecedores: loadDataWithFilters,
    reloadData,
    
    // Ações de auditoria (do hook auditoria)
    handleViewAudit: handleOpenAuditModal,
    handleAuditFilterChange: setAuditFilters,
    handleCloseAuditModal,
    handleApplyAuditFilters,
    handleExportAuditXLSX,
    handleExportAuditPDF,
    
    // Ações de exportação (customizadas)
    handleExportXLSX: handleExportXLSXCustom,
    handleExportPDF: handleExportPDFCustom,
    
    // Ações de ordenação
    handleSort
  };
};