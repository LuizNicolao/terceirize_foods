import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import TiposCardapioService from '../services/tiposCardapio';
import FiliaisService from '../services/filiais';
import { useValidation } from './useValidation';

export const useTiposCardapio = () => {
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
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingTipo, setEditingTipo] = useState(null);

  // Estados de filtros e paginação
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Estados de estatísticas
  const [estatisticas, setEstatisticas] = useState({
    total_tipos: 0,
    tipos_ativos: 0,
    tipos_inativos: 0,
    filiais_vinculadas: 0
  });

  // Carregar tipos de cardápio
  const loadTipos = async (params = {}) => {
    try {
      setLoading(true);
      // Parâmetros de paginação
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        ...params
      };

      const result = await TiposCardapioService.listar(paginationParams);
      
      if (result.success) {
        const tiposData = Array.isArray(result.data) ? result.data : [];
        setTipos(tiposData);
        setTotalPages(result.pagination?.totalPages || 1);
        setTotalItems(result.pagination?.totalItems || 0);
        
        // Atualizar estatísticas
        setEstatisticas({
          total_tipos: result.pagination?.totalItems || tiposData.length,
          tipos_ativos: tiposData.filter(t => t.status === 'ativo').length,
          tipos_inativos: tiposData.filter(t => t.status === 'inativo').length,
          filiais_vinculadas: tiposData.reduce((acc, t) => acc + (t.total_filiais || 0), 0)
        });
      } else {
        toast.error(result.error);
        setTipos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar tipos de cardápio:', error);
      setTipos([]);
      toast.error('Erro ao carregar tipos de cardápio');
    } finally {
      setLoading(false);
    }
  };

  // Buscar tipo por ID
  const buscarTipoPorId = async (id) => {
    try {
      const result = await TiposCardapioService.buscarPorId(id);
      if (result.success) {
        return result.data;
      } else {
        toast.error(result.error);
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar tipo de cardápio:', error);
      toast.error('Erro ao buscar tipo de cardápio');
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

  // Salvar tipo (criar ou atualizar)
  const onSubmit = async (data) => {
    try {
      clearFieldError(); // Limpar erros anteriores
      
      let result;
      if (editingTipo) {
        result = await TiposCardapioService.atualizar(editingTipo.id, data);
      } else {
        result = await TiposCardapioService.criar(data);
      }

      if (result.success) {
        toast.success(result.message);
        await loadTipos(); // Recarregar lista
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
      console.error('Erro ao salvar tipo de cardápio:', error);
      toast.error('Erro ao salvar tipo de cardápio');
      return false;
    }
  };

  // Excluir tipo
  const handleDeleteTipo = async (tipo) => {
    if (!tipo) return;

    try {
      const result = await TiposCardapioService.excluir(tipo.id);
      
      if (result.success) {
        toast.success(result.message);
        await loadTipos(); // Recarregar lista
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao excluir tipo de cardápio:', error);
      toast.error('Erro ao excluir tipo de cardápio');
    }
  };

  // Abrir modal para criar
  const handleAddTipo = () => {
    setEditingTipo(null);
    setViewMode(false);
    setShowModal(true);
  };

  // Abrir modal para editar
  const handleEditTipo = async (tipo) => {
    try {
      const tipoCompleto = await buscarTipoPorId(tipo.id);
      if (tipoCompleto) {
        setEditingTipo(tipoCompleto);
        setViewMode(false);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Erro ao abrir modal de edição:', error);
    }
  };

  // Abrir modal para visualizar
  const handleViewTipo = async (tipo) => {
    try {
      const tipoCompleto = await buscarTipoPorId(tipo.id);
      if (tipoCompleto) {
        setEditingTipo(tipoCompleto);
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
    setEditingTipo(null);
    setViewMode(false);
    clearFieldError(); // Limpar erros de validação
  };

  // Manipular mudança de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadTipos({ page });
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
    loadTipos();
  }, [currentPage, itemsPerPage, searchTerm]);

  return {
    // Estados
    tipos,
    loading,
    showModal,
    viewMode,
    editingTipo,
    searchTerm,
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
    handleDeleteTipo,
    handleAddTipo,
    handleViewTipo,
    handleEditTipo,
    handleCloseModal,
    handlePageChange,
    setSearchTerm,
    setItemsPerPage,
    formatDate,
    getStatusLabel
  };
};
