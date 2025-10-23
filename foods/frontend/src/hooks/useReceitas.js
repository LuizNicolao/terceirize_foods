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
  const [showPreviewModal, setShowPreviewModal] = useState(false);
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

  // Carregar receitas
  const loadReceitas = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: baseEntity.currentPage,
        limit: baseEntity.itemsPerPage,
        search: baseEntity.searchTerm,
        ...filtros
      };

      const response = await ReceitasService.listar(params);
      
      if (response.success) {
        setReceitas(response.data.receitas || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalItems(response.data.totalItems || 0);
        setEstatisticas(response.data.estatisticas || estatisticas);
      } else {
        console.error('Erro ao carregar receitas:', response.error);
        toast.error(response.error || 'Erro ao carregar receitas');
      }
    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
      toast.error('Erro ao carregar receitas');
    } finally {
      setLoading(false);
    }
  }, [baseEntity.currentPage, baseEntity.itemsPerPage, baseEntity.searchTerm, filtros]);

  // Carregar dados quando os parâmetros mudarem
  useEffect(() => {
    loadReceitas();
  }, [loadReceitas]);

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
        loadReceitas();
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
      console.log('🔍 handlePreviewReceita chamado com:', {
        tem_receita: !!receita,
        tem_refeicoes: !!(receita && receita.refeicoes),
        tem_tabela_bruta: !!(receita && receita.tabela_bruta),
        tem_id: !!(receita && receita.id)
      });

      // Se o receita já tem dados (vem do PDF processado), usar diretamente
      if (receita && (receita.refeicoes || receita.tabela_bruta)) {
        console.log('✅ Abrindo preview com dados do PDF');
        setEditingReceita(receita);
        setShowPreviewModal(true);
        return;
      }

      // Se é um receita existente, buscar do banco
      if (receita && receita.id) {
        console.log('🔍 Buscando receita existente no banco');
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
    setCurrentPage(1);
  };

  const clearFiltros = () => {
    setFiltros({
      mes: '',
      ano: new Date().getFullYear(),
      unidade_escolar_id: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
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
        loadReceitas();
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
    receitas: isSortingLocally ? receitasOrdenadas : receitas,
    loading: baseEntity.loading,
    saving,
    showModal,
    
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
    loadReceitas,
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
    
    // Ações de ordenação
    handleSort
  };
};
