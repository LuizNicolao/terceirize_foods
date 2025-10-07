import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import PeriodosRefeicaoService from '../services/periodosRefeicao';
import FiliaisService from '../services/filiais';
import { useValidation } from './common/useValidation';

export const usePeriodosRefeicao = () => {
  // Hook de busca com debounce
  const debouncedSearch = useDebouncedSearch(500);

  // Hook de validação universal
  const {
    validationErrors,
    showValidationModal,
    handleApiResponse,
    handleCloseValidationModal,
    clearValidationErrors
  } = useValidation();

  // Estados de validação local
  const [fieldErrors, setFieldErrors] = useState({});

  // Estados principais
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingPeriodo, setEditingPeriodo] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [periodoToDelete, setPeriodoToDelete] = useState(null);

  // Estados de filtros e paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Estados de estatísticas
  const [estatisticas, setEstatisticas] = useState({
    total_periodos: 0,
    periodos_ativos: 0,
    periodos_inativos: 0,
    filiais_vinculadas: 0
  });

  // Carregar períodos de refeição
  const loadPeriodos = async (params = {}) => {
    try {
      setLoading(true);
      // Parâmetros de paginação
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch.debouncedSearchTerm,
        ...params
      };

      const result = await PeriodosRefeicaoService.listar(paginationParams);
      
      if (result.success) {
        const periodosData = Array.isArray(result.data) ? result.data : [];
        setPeriodos(periodosData);
        setTotalPages(result.pagination?.totalPages || 1);
        setTotalItems(result.pagination?.totalItems || 0);
        
        // Atualizar estatísticas
        setEstatisticas({
          total_periodos: result.pagination?.totalItems || periodosData.length,
          periodos_ativos: periodosData.filter(p => p.status === 'ativo').length,
          periodos_inativos: periodosData.filter(p => p.status === 'inativo').length,
          filiais_vinculadas: periodosData.reduce((acc, p) => acc + (p.total_filiais || 0), 0)
        });
      } else {
        toast.error(result.error);
        setPeriodos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar períodos de refeição:', error);
      setPeriodos([]);
      toast.error('Erro ao carregar períodos de refeição');
    } finally {
      setLoading(false);
    }
  };

  // Buscar período por ID
  const buscarPeriodoPorId = async (id) => {
    try {
      const result = await PeriodosRefeicaoService.buscarPorId(id);
      if (result.success) {
        return result.data;
      } else {
        toast.error(result.error);
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar período de refeição:', error);
      toast.error('Erro ao buscar período de refeição');
      return null;
    }
  };

  // Funções de validação local
  const validateField = (field, value) => {
    setFieldErrors(prev => ({
      ...prev,
      [field]: value
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

  // Salvar período (criar ou atualizar)
  const onSubmit = async (data) => {
    try {
      clearFieldError(); // Limpar erros anteriores
      
      let result;
      if (editingPeriodo) {
        result = await PeriodosRefeicaoService.atualizar(editingPeriodo.id, data);
      } else {
        result = await PeriodosRefeicaoService.criar(data);
      }

      if (result.success) {
        toast.success(result.message);
        await loadPeriodos(); // Recarregar lista
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
      console.error('Erro ao salvar período de refeição:', error);
      toast.error('Erro ao salvar período de refeição');
      return false;
    }
  };

  // Abrir modal de confirmação de exclusão
  const handleDeletePeriodo = (periodo) => {
    setPeriodoToDelete(periodo);
    setShowDeleteConfirmModal(true);
  };

  // Confirmar exclusão
  const confirmDeletePeriodo = async () => {
    if (!periodoToDelete) return;

    try {
      const result = await PeriodosRefeicaoService.excluir(periodoToDelete.id);
      
      if (result.success) {
        toast.success(result.message);
        await loadPeriodos(); // Recarregar lista
        setShowDeleteConfirmModal(false);
        setPeriodoToDelete(null);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao excluir período de refeição:', error);
      toast.error('Erro ao excluir período de refeição');
    }
  };

  // Fechar modal de confirmação
  const closeDeleteConfirmModal = () => {
    setShowDeleteConfirmModal(false);
    setPeriodoToDelete(null);
  };

  // Abrir modal para criar
  const handleAddPeriodo = () => {
    setEditingPeriodo(null);
    setViewMode(false);
    setShowModal(true);
  };

  // Abrir modal para editar
  const handleEditPeriodo = async (periodo) => {
    try {
      const periodoCompleto = await buscarPeriodoPorId(periodo.id);
      if (periodoCompleto) {
        setEditingPeriodo(periodoCompleto);
        setViewMode(false);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Erro ao abrir modal de edição:', error);
    }
  };

  // Abrir modal para visualizar
  const handleViewPeriodo = async (periodo) => {
    try {
      const periodoCompleto = await buscarPeriodoPorId(periodo.id);
      if (periodoCompleto) {
        setEditingPeriodo(periodoCompleto);
        setViewMode(true);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Erro ao abrir modal de visualização:', error);
    }
  };

  // Fechar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPeriodo(null);
    setViewMode(false);
    clearFieldError(); // Limpar erros de validação
  };

  // Manipular mudança de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadPeriodos({ page });
  };

  // Formatação de data
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Label de status
  const getStatusLabel = (status) => {
    return status === 'ativo' ? 'Ativo' : 'Inativo';
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadPeriodos();
  }, [currentPage, itemsPerPage, debouncedSearch.debouncedSearchTerm]);

  return {
    // Estados
    periodos,
    loading,
    showModal,
    viewMode,
    editingPeriodo,
    showDeleteConfirmModal,
    periodoToDelete,
    searchTerm: debouncedSearch.searchTerm,
    isSearching: debouncedSearch.isSearching,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    validationErrors,
    showValidationModal,
    handleCloseValidationModal,
    
    // Funções de CRUD
    onSubmit,
    handleDeletePeriodo,
    confirmDeletePeriodo,
    closeDeleteConfirmModal,
    handleAddPeriodo,
    handleViewPeriodo,
    handleEditPeriodo,
    handleCloseModal,
    handlePageChange,
    setSearchTerm: debouncedSearch.updateSearchTerm,
    clearSearch: debouncedSearch.clearSearch,
    setItemsPerPage,
    formatDate,
    getStatusLabel
  };
};
