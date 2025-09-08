import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import EfetivosService from '../services/efetivos';
import { useValidation } from './common/useValidation';

export const useEfetivos = (unidadeEscolarId) => {
  // Estados principais
  const [efetivos, setEfetivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingEfetivo, setEditingEfetivo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Estados para modal de confirmação
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [efetivoToDelete, setEfetivoToDelete] = useState(null);

  // Hook de validação
  const {
    validationErrors,
    showValidationModal,
    handleApiResponse,
    handleCloseValidationModal,
    clearValidationErrors
  } = useValidation();

  // Carregar efetivos
  const loadEfetivos = async (params = {}) => {
    if (!unidadeEscolarId) return;
    
    setLoading(true);
    try {
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        ...params
      };

      const result = await EfetivosService.listarPorUnidade(unidadeEscolarId, paginationParams);
      if (result.success) {
        setEfetivos(result.data || []);
        
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages || 1);
          setTotalItems(result.pagination.totalItems || result.data.length);
          setCurrentPage(result.pagination.currentPage || 1);
        } else {
          setTotalItems(result.data.length);
          setTotalPages(Math.ceil(result.data.length / itemsPerPage));
        }
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar efetivos:', error);
      toast.error('Erro ao carregar efetivos');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando dependências mudarem
  useEffect(() => {
    loadEfetivos();
  }, [unidadeEscolarId, currentPage, itemsPerPage]);

  // Filtrar efetivos (client-side)
  const filteredEfetivos = efetivos.filter(efetivo => {
    const matchesSearch = !searchTerm || 
      (efetivo.tipo_efetivo && efetivo.tipo_efetivo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (efetivo.intolerancia_nome && efetivo.intolerancia_nome.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'todos' || efetivo.tipo_efetivo === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Funções de CRUD
  const onSubmit = async (data) => {
    try {
      clearValidationErrors(); // Limpar erros anteriores
      
      // Limpar campos vazios para evitar problemas de validação
      const cleanData = {
        ...data,
        quantidade: parseInt(data.quantidade) || 0,
        intolerancia_id: data.tipo_efetivo === 'NAE' ? parseInt(data.intolerancia_id) : null
      };

      let result;
      if (editingEfetivo) {
        result = await EfetivosService.atualizar(editingEfetivo.id, cleanData);
      } else {
        result = await EfetivosService.criarPorUnidade(unidadeEscolarId, cleanData);
      }
      
      if (result.success) {
        toast.success(editingEfetivo ? 'Efetivo atualizado com sucesso!' : 'Efetivo criado com sucesso!');
        handleCloseModal();
        loadEfetivos();
      } else {
        if (handleApiResponse(result)) {
          return; // Erros de validação foram tratados
        }
        toast.error(result.message || 'Erro ao salvar efetivo');
      }
    } catch (error) {
      console.error('Erro ao salvar efetivo:', error);
      toast.error('Erro ao salvar efetivo');
    }
  };

  const handleDeleteEfetivo = async (efetivoId) => {
    setEfetivoToDelete(efetivoId);
    setShowConfirmDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!efetivoToDelete) return;

    try {
      const result = await EfetivosService.excluir(efetivoToDelete);
      if (result.success) {
        toast.success('Efetivo excluído com sucesso!');
        loadEfetivos();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao excluir efetivo');
    }
  };

  // Funções de modal
  const handleAddEfetivo = () => {
    setViewMode(false);
    setEditingEfetivo(null);
    setShowModal(true);
  };

  const handleViewEfetivo = (efetivo) => {
    setViewMode(true);
    setEditingEfetivo(efetivo);
    setShowModal(true);
  };

  const handleEditEfetivo = (efetivo) => {
    setViewMode(false);
    setEditingEfetivo(efetivo);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setViewMode(false);
    setEditingEfetivo(null);
  };

  // Funções de paginação
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Funções utilitárias
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return {
    // Estados
    efetivos: Array.isArray(filteredEfetivos) ? filteredEfetivos : [],
    loading,
    showModal,
    viewMode,
    editingEfetivo,
    searchTerm,
    statusFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    validationErrors,
    showValidationModal,
    showConfirmDeleteModal,

    // Funções CRUD
    onSubmit,
    handleDeleteEfetivo,
    handleConfirmDelete,

    // Funções de modal
    handleAddEfetivo,
    handleViewEfetivo,
    handleEditEfetivo,
    handleCloseModal,
    handleCloseValidationModal,
    setShowConfirmDeleteModal,

    // Funções de paginação
    handlePageChange,
    handleItemsPerPageChange,

    // Funções de filtros
    setSearchTerm,
    setStatusFilter,

    // Funções utilitárias
    formatDate
  };
};
