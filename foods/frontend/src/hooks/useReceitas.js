import { useState, useEffect, useCallback } from 'react';
import { useValidation } from './common/useValidation';
import { useExport } from './common/useExport';
import { useBaseEntity } from './common/useBaseEntity';
import useTableSort from './common/useTableSort';
import ReceitasService from '../services/receitas';
import toast from 'react-hot-toast';

export const useReceitas = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('receitas', ReceitasService, {
    initialItemsPerPage: 20,
    enableStats: true,
    enableDelete: true
  });

  // Hook de ordenação híbrida
  const {
    sortedData: receitasOrdenadas,
    sortField,
    sortDirection,
    handleSort,
    isSortingLocally
  } = useTableSort({
    data: baseEntity.items,
    threshold: 100,
    totalItems: baseEntity.totalItems
  });

  // Estados específicos das receitas
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingReceita, setEditingReceita] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [receitaToDelete, setReceitaToDelete] = useState(null);
  const [estatisticas, setEstatisticas] = useState({});
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filtros, setFiltros] = useState({
    mes: '',
    ano: new Date().getFullYear(),
    unidade_escolar_id: ''
  });

  // Hook de validação
  const {
    validationErrors,
    showValidationModal,
    handleApiResponse,
    handleCloseValidationModal,
    clearValidationErrors
  } = useValidation();

  // Hook de exportação
  const { handleExportXLSX, handleExportPDF } = useExport(ReceitasService);

  // Estados para validação de campos
  const [fieldErrors, setFieldErrors] = useState({});

  const validateField = (field, message) => {
    setFieldErrors(prev => ({
      ...prev,
      [field]: message
    }));
  };

  const getFieldError = (field) => {
    return fieldErrors[field] || null;
  };

  const clearFieldError = (field) => {
    if (field) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    } else {
      setFieldErrors({});
    }
  };

  // O baseEntity já gerencia o carregamento automático dos dados

  // Função para submeter formulário
  const onSubmit = async (data) => {
    setSaving(true);
    try {
      let response;
      
      if (editingReceita) {
        response = await ReceitasService.atualizar(editingReceita.id, data);
      } else {
        response = await ReceitasService.criar(data);
      }

      if (response.success) {
        toast.success(response.message || 'Cardápio salvo com sucesso!');
        handleCloseModal();
        baseEntity.loadData();
      } else {
        handleApiResponse(response);
      }
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      toast.error('Erro ao salvar receita');
    } finally {
      setSaving(false);
    }
  };

  // Funções para modais
  const handleAddReceita = () => {
    setEditingReceita(null);
    setViewMode(false);
    setShowModal(true);
  };

  const handleDuplicateReceita = async (receita) => {
    try {
      const result = await ReceitasService.buscarPorId(receita.id);
      if (result.success) {
        // Criar uma cópia da receita sem o ID
        const receitaDuplicada = {
          ...result.data,
          id: undefined,
          unidade_escola_nome: `${result.data.unidade_escola_nome} (Cópia)`,
          criado_em: undefined,
          aprovado_em: undefined,
          aprovado_por: undefined
        };
        setEditingReceita(receitaDuplicada);
        setViewMode(false);
        setShowModal(true);
      } else {
        toast.error(result.error || 'Erro ao carregar receita para duplicar');
      }
    } catch (error) {
      toast.error('Erro ao carregar receita para duplicar');
    }
  };


  const handleViewReceita = async (receita) => {
    try {
      const result = await ReceitasService.buscarPorId(receita.id);
      if (result.success) {
        setEditingReceita(result.data);
        setViewMode(true);
        setShowModal(true);
      } else {
        toast.error(result.error || 'Erro ao carregar receita');
      }
    } catch (error) {
      toast.error('Erro ao carregar receita');
    }
  };

  const handleEditReceita = async (receita) => {
    try {
      const result = await ReceitasService.buscarPorId(receita.id);
      if (result.success) {
        setEditingReceita(result.data);
        setViewMode(false);
        setShowModal(true);
      } else {
        toast.error(result.error || 'Erro ao carregar receita');
      }
    } catch (error) {
      toast.error('Erro ao carregar receita');
    }
  };

  const handlePreviewReceita = async (receita) => {
    try {
      // Se o receita já tem dados (vem do PDF processado), usar diretamente
      if (receita && (receita.refeicoes || receita.tabela_bruta)) {
        setEditingReceita(receita);
        setShowPreviewModal(true);
        return;
      }

      // Se é um receita existente, buscar do banco
      if (receita && receita.id) {
        const result = await ReceitasService.buscarPorId(receita.id);
        if (result.success) {
          setEditingReceita(result.data);
          setShowPreviewModal(true);
        } else {
          toast.error(result.error || 'Erro ao carregar receita');
        }
      }
    } catch (error) {
      console.error('❌ Erro no handlePreviewReceita:', error);
      toast.error('Erro ao carregar receita');
    }
  };


  const handleCloseModal = () => {
    setShowModal(false);
    setEditingReceita(null);
    setViewMode(false);
    clearFieldError();
  };


  const handleClosePreviewModal = () => {
    setShowPreviewModal(false);
    setEditingReceita(null);
  };

  // Funções de upload de PDF
  const handleUploadPDF = () => {
    setShowUploadModal(true);
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
  };

  const handleProcessarPDF = async (dadosProcessados) => {
    try {
      setShowUploadModal(false);

      if (dadosProcessados?.upload?.duplicate) {
        toast(
          `PDF já havia sido processado (upload #${dadosProcessados.upload.uploadId}). Resumo carregado para conferência.`,
          { icon: '⚠️' }
        );
      } else {
        toast.success(
          `PDF processado com sucesso: ${dadosProcessados.resumo?.total_refeicoes ?? dadosProcessados.receitas?.length ?? 0} refeições registradas`
        );
      }

      setEditingReceita(dadosProcessados);
      setShowPreviewModal(true);

      // Recarregar lista para manter consistência com dados existentes
      baseEntity.loadData();
    } catch (error) {
      console.error('Erro ao processar PDF:', error);
      toast.error('Erro ao processar PDF: ' + error.message);
    }
  };


  // Funções de paginação
  const handlePageChange = (page) => {
    baseEntity.setCurrentPage(page);
  };

  const handleItemsPerPageChange = (itemsPerPage) => {
    baseEntity.setItemsPerPage(itemsPerPage);
    baseEntity.setCurrentPage(1);
  };

  // Funções de filtros
  const handleFiltroChange = (filtro, value) => {
    setFiltros(prev => ({
      ...prev,
      [filtro]: value
    }));
    baseEntity.setCurrentPage(1);
  };

  const clearFiltros = () => {
    setFiltros({
      mes: '',
      ano: new Date().getFullYear(),
      unidade_escolar_id: ''
    });
    baseEntity.setSearchTerm('');
    baseEntity.setCurrentPage(1);
  };

  // Funções de exclusão
  const handleDeleteReceita = (receita) => {
    setReceitaToDelete(receita);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteReceita = async () => {
    if (!receitaToDelete) return;

    try {
      const response = await ReceitasService.excluir(receitaToDelete.id);
      
      if (response.success) {
        toast.success('Cardápio excluído com sucesso!');
        baseEntity.loadData();
      } else {
        toast.error(response.error || 'Erro ao excluir receita');
      }
    } catch (error) {
      console.error('Erro ao excluir receita:', error);
      toast.error('Erro ao excluir receita');
    } finally {
      setShowDeleteConfirmModal(false);
      setReceitaToDelete(null);
    }
  };



  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Função para obter nome do mês
  const getMonthName = (month) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1] || '';
  };

  return {
    // Estados
    receitas: isSortingLocally ? receitasOrdenadas : baseEntity.items,
    loading: baseEntity.loading,
    saving,
    showModal,
    showUploadModal,
    
    // Estados de ordenação
    sortField,
    sortDirection,
    isSortingLocally,
    showPreviewModal,
    editingReceita,
    viewMode,
    currentPage: baseEntity.currentPage,
    totalPages: baseEntity.totalPages,
    totalItems: baseEntity.totalItems,
    itemsPerPage: baseEntity.itemsPerPage,
    filtros,
    showDeleteConfirmModal,
    setShowDeleteConfirmModal,
    receitaToDelete,
    validationErrors,
    showValidationModal,
    fieldErrors,
    estatisticas,

    // Funções
    onSubmit,
    handleDeleteReceita,
    confirmDeleteReceita,
    handleAddReceita,
    handleDuplicateReceita,
    handleViewReceita,
    handleEditReceita,
    handlePreviewReceita,
    handleCloseModal,
    handleClosePreviewModal,
    handlePageChange,
    handleItemsPerPageChange,
    setSearchTerm: baseEntity.setSearchTerm,
    clearSearch: baseEntity.clearSearch,
    handleKeyPress: baseEntity.handleKeyPress,
    handleFiltroChange,
    clearFiltros,
    formatDate,
    getMonthName,
    getFieldError,
    clearFieldError,
    handleCloseValidationModal,
    handleExportXLSX,
    handleExportPDF,
    
    // Funções de upload de PDF
    handleUploadPDF,
    handleCloseUploadModal,
    handleProcessarPDF,
    
    // Ações de ordenação
    handleSort
  };
};
