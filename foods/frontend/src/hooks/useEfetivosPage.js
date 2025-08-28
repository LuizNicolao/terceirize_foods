import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import EfetivosService from '../services/efetivos';
import { useValidation } from './useValidation';

export const useEfetivosPage = () => {
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

  // Estados de estatísticas
  const [estatisticas, setEstatisticas] = useState({
    total_efetivos: 0,
    efetivos_padrao: 0,
    efetivos_nae: 0
  });

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
    setLoading(true);
    try {
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        ...params
      };

      const result = await EfetivosService.listar(paginationParams);
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

  // Carregar estatísticas
  const loadEstatisticas = async () => {
    try {
      const result = await EfetivosService.buscarEstatisticas();
      if (result.success && result.data?.geral) {
        setEstatisticas(result.data.geral);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  // Carregar dados quando dependências mudarem
  useEffect(() => {
    loadEfetivos();
    loadEstatisticas();
  }, [currentPage, itemsPerPage]);

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
      clearValidationErrors();
      
      const cleanData = {
        ...data,
        quantidade: parseInt(data.quantidade) || 0,
        intolerancia_id: data.tipo_efetivo === 'NAE' ? parseInt(data.intolerancia_id) : null
      };

      let result;
      if (editingEfetivo) {
        result = await EfetivosService.atualizar(editingEfetivo.id, cleanData);
      } else {
        result = await EfetivosService.criar(cleanData);
      }
      
      if (result.success) {
        toast.success(editingEfetivo ? 'Efetivo atualizado com sucesso!' : 'Efetivo criado com sucesso!');
        handleCloseModal();
        loadEfetivos();
        loadEstatisticas();
      } else {
        handleApiResponse(result);
      }
    } catch (error) {
      console.error('Erro ao salvar efetivo:', error);
      toast.error('Erro ao salvar efetivo');
    }
  };

  const handleDeleteEfetivo = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este efetivo?')) {
      try {
        const result = await EfetivosService.excluir(id);
        if (result.success) {
          toast.success('Efetivo excluído com sucesso!');
          loadEfetivos();
          loadEstatisticas();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        console.error('Erro ao excluir efetivo:', error);
        toast.error('Erro ao excluir efetivo');
      }
    }
  };

  const handleAddEfetivo = () => {
    setEditingEfetivo(null);
    setViewMode(false);
    setShowModal(true);
  };

  const handleViewEfetivo = async (id) => {
    try {
      const result = await EfetivosService.buscarPorId(id);
      if (result.success) {
        setEditingEfetivo(result.data);
        setViewMode(true);
        setShowModal(true);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao buscar efetivo:', error);
      toast.error('Erro ao buscar efetivo');
    }
  };

  const handleEditEfetivo = async (id) => {
    try {
      const result = await EfetivosService.buscarPorId(id);
      if (result.success) {
        setEditingEfetivo(result.data);
        setViewMode(false);
        setShowModal(true);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao buscar efetivo:', error);
      toast.error('Erro ao buscar efetivo');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEfetivo(null);
    setViewMode(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return {
    efetivos: filteredEfetivos,
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
    estatisticas,
    validationErrors,
    showValidationModal,
    handleCloseValidationModal,
    onSubmit,
    handleDeleteEfetivo,
    handleAddEfetivo,
    handleViewEfetivo,
    handleEditEfetivo,
    handleCloseModal,
    handlePageChange,
    handleItemsPerPageChange,
    setSearchTerm,
    setStatusFilter,
    formatDate
  };
};
