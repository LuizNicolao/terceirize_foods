import { useState, useEffect } from 'react';
import { useValidation } from './common/useValidation';
import { useExport } from './common/useExport';
import FaturamentoService from '../services/faturamento';
import toast from 'react-hot-toast';
import { useDebouncedSearch } from './common/useDebouncedSearch';

export const useFaturamento = () => {
  // Hook de busca com debounce
  const debouncedSearch = useDebouncedSearch(500);

  // Estados principais
  const [faturamentos, setFaturamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingFaturamento, setEditingFaturamento] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [estatisticas, setEstatisticas] = useState({
    total_faturamentos: 0,
    faturamentos_mes_atual: 0,
    faturamentos_ano_atual: 0,
    unidades_ativas: 0
  });

  // Estados de paginação e filtros
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [filtros, setFiltros] = useState({
    mes: '',
    ano: new Date().getFullYear(),
    unidade_escolar_id: ''
  });

  // Estados para modais de confirmação
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [faturamentoToDelete, setFaturamentoToDelete] = useState(null);

  // Hook de validação
  const {
    validationErrors,
    showValidationModal,
    handleApiResponse,
    handleCloseValidationModal,
    clearValidationErrors
  } = useValidation();

  // Hook de exportação
  const { handleExportXLSX, handleExportPDF } = useExport(FaturamentoService);

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

  // Carregar faturamentos
  const loadFaturamentos = async (params = {}) => {
    setLoading(true);
    try {
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        ...filtros,
        ...params
      };


      const result = await FaturamentoService.listar(paginationParams);
      
      if (result.success) {
        setFaturamentos(result.data || []);
        
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages || 1);
          setTotalItems(result.pagination.totalItems || result.data.length);
          setCurrentPage(result.pagination.currentPage || 1);
        } else {
          setTotalItems(result.data.length);
          setTotalPages(Math.ceil(result.data.length / itemsPerPage));
        }

        // Atualizar estatísticas
        updateEstatisticas(result.data || []);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao carregar faturamentos');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando dependências mudarem
  useEffect(() => {
    loadFaturamentos();
  }, [currentPage, itemsPerPage, filtros]);

  // Filtrar faturamentos (client-side)
  const filteredFaturamentos = faturamentos.filter(faturamento => {
    const matchesSearch = !debouncedSearch.debouncedSearchTerm || 
      (faturamento.nome_escola && faturamento.nome_escola.toLowerCase().includes(debouncedSearch.debouncedSearchTerm.toLowerCase())) ||
      (faturamento.codigo_teknisa && faturamento.codigo_teknisa.toLowerCase().includes(debouncedSearch.debouncedSearchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  // Funções de CRUD
  const onSubmit = async (data) => {
    try {
      clearFieldError(); // Limpar erros anteriores
      setSaving(true);
      
      let result;
      if (editingFaturamento) {
        result = await FaturamentoService.atualizar(editingFaturamento.id, data);
      } else {
        result = await FaturamentoService.criar(data);
      }

      if (result.success) {
        toast.success(result.message);
        await loadFaturamentos(); // Recarregar lista
        handleCloseModal();
        return true;
      } else {
        if (result.validationErrors) {
          // Tratar erros de validação
          Object.keys(result.validationErrors).forEach(field => {
            validateField(field, result.validationErrors[field][0]);
          });
        } else {
          toast.error(result.error);
        }
        return false;
      }
    } catch (error) {
      console.error('Erro ao salvar faturamento:', error);
      toast.error('Erro ao salvar faturamento');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Abrir modal de confirmação de exclusão
  const handleDeleteFaturamento = (faturamento) => {
    setFaturamentoToDelete(faturamento);
    setShowDeleteConfirmModal(true);
  };

  // Confirmar exclusão
  const confirmDeleteFaturamento = async () => {
    if (!faturamentoToDelete) return;

    try {
      const result = await FaturamentoService.excluir(faturamentoToDelete.id);
      if (result.success) {
        toast.success(result.message);
        await loadFaturamentos(); // Recarregar lista
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao excluir faturamento:', error);
      toast.error('Erro ao excluir faturamento');
    } finally {
      setShowDeleteConfirmModal(false);
      setFaturamentoToDelete(null);
    }
  };

  // Funções de modal
  const handleAddFaturamento = () => {
    setEditingFaturamento(null);
    setViewMode(false);
    setShowModal(true);
  };

  const handleViewFaturamento = async (faturamento) => {
    try {
      // Buscar faturamento completo com detalhes
      const result = await FaturamentoService.buscarPorId(faturamento.id);
      if (result.success) {
        setEditingFaturamento(result.data);
        setViewMode(true);
        setShowModal(true);
      } else {
        toast.error(result.error || 'Erro ao carregar faturamento para visualização');
      }
    } catch (error) {
      toast.error('Erro ao carregar faturamento para visualização');
    }
  };

  const handleEditFaturamento = async (faturamento) => {
    try {
      // Buscar faturamento completo com detalhes
      const result = await FaturamentoService.buscarPorId(faturamento.id);
      if (result.success) {
        setEditingFaturamento(result.data);
        setViewMode(false);
        setShowModal(true);
      } else {
        toast.error(result.error || 'Erro ao carregar faturamento para edição');
      }
    } catch (error) {
      toast.error('Erro ao carregar faturamento para edição');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFaturamento(null);
    setViewMode(false);
    clearFieldError();
  };

  // Funções de paginação
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (itemsPerPage) => {
    setItemsPerPage(itemsPerPage);
    setCurrentPage(1);
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
    debouncedSearch.clearSearch();
    setCurrentPage(1);
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

  // Função para atualizar estatísticas
  const updateEstatisticas = (data) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    const estatisticasCalculadas = {
      total_faturamentos: data.length,
      faturamentos_mes_atual: data.filter(f => f.mes === currentMonth && f.ano === currentYear).length,
      faturamentos_ano_atual: data.filter(f => f.ano === currentYear).length,
      unidades_ativas: new Set(data.map(f => f.unidade_escolar_id)).size
    };
    
    setEstatisticas(estatisticasCalculadas);
  };


  return {
    // Estados
    faturamentos: filteredFaturamentos,
    loading,
    saving,
    showModal,
    editingFaturamento,
    viewMode,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    searchTerm: debouncedSearch.searchTerm,
    isSearching: debouncedSearch.isSearching,
    filtros,
    showDeleteConfirmModal,
    setShowDeleteConfirmModal,
    faturamentoToDelete,
    validationErrors,
    showValidationModal,
    fieldErrors,
    estatisticas,

    // Funções
    loadFaturamentos,
    onSubmit,
    handleDeleteFaturamento,
    confirmDeleteFaturamento,
    handleAddFaturamento,
    handleViewFaturamento,
    handleEditFaturamento,
    handleCloseModal,
    handlePageChange,
    handleItemsPerPageChange,
    setSearchTerm: debouncedSearch.updateSearchTerm,
    clearSearch: debouncedSearch.clearSearch,
    handleFiltroChange,
    clearFiltros,
    formatDate,
    getMonthName,
    getFieldError,
    clearFieldError,
    handleCloseValidationModal,
    handleExportXLSX,
    handleExportPDF
  };
};

export default useFaturamento;
