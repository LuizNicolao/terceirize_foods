/**
 * Hook customizado para Templates de PDF
 * Gerencia estado e operações relacionadas a templates de PDF
 */

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import PdfTemplatesService from '../services/pdfTemplatesService';
import { useBaseEntity } from './common/useBaseEntity';

export const usePdfTemplates = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('pdf-templates', PdfTemplatesService, {
    initialItemsPerPage: 20,
    enableStats: false,
    enableDelete: true,
    enableDebouncedSearch: false
  });

  // Estados locais
  const [loading, setLoading] = useState(false);
  const [telasDisponiveis, setTelasDisponiveis] = useState([]);

  /**
   * Carregar telas disponíveis
   */
  const carregarTelasDisponiveis = useCallback(async () => {
    try {
      const response = await PdfTemplatesService.listarTelasDisponiveis();
      if (response.success) {
        setTelasDisponiveis(response.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar telas disponíveis:', error);
    }
  }, []);

  /**
   * Carregar dados com filtros
   */
  const loadDataWithFilters = useCallback(async () => {
    const params = {
      ...baseEntity.getPaginationParams(),
      search: baseEntity.searchTerm || undefined
    };

    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key];
      }
    });

    await baseEntity.loadData(params);
  }, [baseEntity]);

  // Carregar dados quando paginação ou busca mudam
  useEffect(() => {
    loadDataWithFilters();
  }, [baseEntity.currentPage, baseEntity.itemsPerPage]);

  // Carregar telas disponíveis na inicialização
  useEffect(() => {
    carregarTelasDisponiveis();
  }, [carregarTelasDisponiveis]);

  /**
   * Visualizar template (busca dados completos)
   */
  const handleViewTemplate = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await PdfTemplatesService.buscarPorId(id);
      if (response.success) {
        baseEntity.handleView(response.data);
      } else {
        toast.error(response.message || 'Erro ao buscar template');
      }
    } catch (error) {
      console.error('Erro ao buscar template:', error);
      toast.error('Erro ao carregar dados do template');
    } finally {
      setLoading(false);
    }
  }, [baseEntity]);

  /**
   * Editar template (busca dados completos)
   */
  const handleEditTemplate = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await PdfTemplatesService.buscarPorId(id);
      if (response.success) {
        baseEntity.handleEdit(response.data);
      } else {
        toast.error(response.message || 'Erro ao buscar template');
      }
    } catch (error) {
      console.error('Erro ao buscar template:', error);
      toast.error('Erro ao carregar dados do template');
    } finally {
      setLoading(false);
    }
  }, [baseEntity]);

  /**
   * Handle key press para buscar ao pressionar Enter
   */
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      loadDataWithFilters();
    }
  }, [loadDataWithFilters]);

  return {
    // Estados principais
    templates: baseEntity.items,
    loading,
    
    // Estados de modal
    showModal: baseEntity.showModal,
    viewMode: baseEntity.viewMode,
    editingTemplate: baseEntity.editingItem,
    
    // Estados de exclusão
    showDeleteConfirmModal: baseEntity.showDeleteConfirmModal,
    templateToDelete: baseEntity.itemToDelete,
    
    // Estados de paginação
    currentPage: baseEntity.currentPage,
    totalPages: baseEntity.totalPages,
    totalItems: baseEntity.totalItems,
    itemsPerPage: baseEntity.itemsPerPage,
    
    // Estados de busca
    searchTerm: baseEntity.searchTerm,
    
    // Estados de validação
    validationErrors: baseEntity.validationErrors,
    showValidationModal: baseEntity.showValidationModal,
    
    // Estados auxiliares
    telasDisponiveis,
    
    // Ações de modal
    handleAddTemplate: baseEntity.handleAdd,
    handleViewTemplate,
    handleEditTemplate,
    handleCloseModal: baseEntity.handleCloseModal,
    
    // Ações de paginação
    handlePageChange: baseEntity.handlePageChange,
    handleItemsPerPageChange: baseEntity.handleItemsPerPageChange,
    
    // Ações de busca
    setSearchTerm: baseEntity.setSearchTerm,
    handleKeyPress,
    
    // Ações de CRUD
    handleSubmitTemplate: baseEntity.onSubmit,
    handleDeleteTemplate: baseEntity.handleDelete,
    handleConfirmDelete: baseEntity.handleConfirmDelete,
    handleCloseDeleteModal: baseEntity.handleCloseDeleteModal,
    
    // Ações de validação
    handleCloseValidationModal: baseEntity.handleCloseValidationModal
  };
};

