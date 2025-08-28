import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import IntoleranciasService from '../services/intolerancias';
import { useValidation } from './useValidation';

export const useIntolerancias = () => {
  // Estados principais
  const [intolerancias, setIntolerancias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingIntolerancia, setEditingIntolerancia] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Estados de estatísticas
  const [estatisticas, setEstatisticas] = useState({
    total_intolerancias: 0,
    intolerancias_ativas: 0,
    intolerancias_inativas: 0,
    nomes_unicos: 0
  });

  // Hook de validação
  const {
    validationErrors,
    showValidationModal,
    handleApiResponse,
    handleCloseValidationModal,
    clearValidationErrors
  } = useValidation();

  // Carregar intolerâncias
  const loadIntolerancias = async (params = {}) => {
    setLoading(true);
    try {
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        ...params
      };

      const result = await IntoleranciasService.listar(paginationParams);
      if (result.success) {
        setIntolerancias(result.data || []);
        
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
      console.error('Erro ao carregar intolerâncias:', error);
      toast.error('Erro ao carregar intolerâncias');
    } finally {
      setLoading(false);
    }
  };

  // Carregar estatísticas
  const loadEstatisticas = async () => {
    try {
      const result = await IntoleranciasService.buscarEstatisticas();
      if (result.success && result.data?.geral) {
        setEstatisticas(result.data.geral);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  // Carregar dados quando dependências mudarem
  useEffect(() => {
    loadIntolerancias();
    loadEstatisticas();
  }, [currentPage, itemsPerPage]);

  // Filtrar intolerâncias (client-side)
  const filteredIntolerancias = intolerancias.filter(intolerancia => {
    const matchesSearch = !searchTerm || 
      (intolerancia.nome && intolerancia.nome.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'todos' || intolerancia.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Funções de CRUD
  const onSubmit = async (data) => {
    try {
      clearValidationErrors(); // Limpar erros anteriores
      
      // Limpar campos vazios para evitar problemas de validação
      const cleanData = {
        ...data,
        nome: data.nome && data.nome.trim() !== '' ? data.nome.trim() : null
      };

      let result;
      if (editingIntolerancia) {
        result = await IntoleranciasService.atualizar(editingIntolerancia.id, cleanData);
      } else {
        result = await IntoleranciasService.criar(cleanData);
      }
      
      if (result.success) {
        toast.success(editingIntolerancia ? 'Intolerância atualizada com sucesso!' : 'Intolerância criada com sucesso!');
        handleCloseModal();
        loadIntolerancias();
      } else {
        if (handleApiResponse(result)) {
          return; // Erros de validação foram tratados
        }
        toast.error(result.message || 'Erro ao salvar intolerância');
      }
    } catch (error) {
      console.error('Erro ao salvar intolerância:', error);
      toast.error('Erro ao salvar intolerância');
    }
  };

  const handleDeleteIntolerancia = async (intoleranciaId) => {
    if (window.confirm('Tem certeza que deseja excluir esta intolerância?')) {
      try {
        const result = await IntoleranciasService.excluir(intoleranciaId);
        if (result.success) {
          toast.success('Intolerância excluída com sucesso!');
          loadIntolerancias();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error('Erro ao excluir intolerância');
      }
    }
  };

  // Funções de modal
  const handleAddIntolerancia = () => {
    setViewMode(false);
    setEditingIntolerancia(null);
    setShowModal(true);
  };

  const handleViewIntolerancia = (intolerancia) => {
    setViewMode(true);
    setEditingIntolerancia(intolerancia);
    setShowModal(true);
  };

  const handleEditIntolerancia = (intolerancia) => {
    setViewMode(false);
    setEditingIntolerancia(intolerancia);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setViewMode(false);
    setEditingIntolerancia(null);
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
    intolerancias: Array.isArray(filteredIntolerancias) ? filteredIntolerancias : [],
    loading,
    showModal,
    viewMode,
    editingIntolerancia,
    searchTerm,
    statusFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    validationErrors,
    showValidationModal,

    // Funções CRUD
    onSubmit,
    handleDeleteIntolerancia,

    // Funções de modal
    handleAddIntolerancia,
    handleViewIntolerancia,
    handleEditIntolerancia,
    handleCloseModal,
    handleCloseValidationModal,

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
