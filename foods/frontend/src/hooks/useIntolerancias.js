import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import IntoleranciasService from '../services/intolerancias';
import { useValidation } from './useValidation';

export const useIntolerancias = () => {
  const [intolerancias, setIntolerancias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingIntolerancia, setEditingIntolerancia] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  // Hook de validação
  const {
    validationErrors,
    showValidationModal,
    handleApiResponse,
    handleCloseValidationModal,
    clearValidationErrors
  } = useValidation();

  // Carregar intolerâncias
  const loadIntolerancias = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage
      };

      const response = await IntoleranciasService.listar(params);
      
      if (response.success) {
        setIntolerancias(response.data.data || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalItems(response.data.pagination?.totalItems || 0);
      } else {
        toast.error(response.message || 'Erro ao carregar intolerâncias');
      }
    } catch (error) {
      console.error('Erro ao carregar intolerâncias:', error);
      toast.error('Erro ao carregar intolerâncias');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  // Carregar dados iniciais
  useEffect(() => {
    loadIntolerancias();
  }, [loadIntolerancias]);

  // Filtrar intolerâncias (client-side)
  const filteredIntolerancias = intolerancias.filter(intolerancia => {
    const matchesSearch = !searchTerm || 
      (intolerancia.nome && intolerancia.nome.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'todos' || intolerancia.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Função para submeter formulário (criar/atualizar)
  const onSubmit = async (data) => {
    try {
      clearValidationErrors();
      
      if (editingIntolerancia) {
        // Atualizar
        const response = await IntoleranciasService.atualizar(editingIntolerancia.id, data);
        if (response.success) {
          toast.success('Intolerância atualizada com sucesso!');
          handleCloseModal();
          loadIntolerancias();
        } else {
          if (!handleApiResponse(response)) {
            toast.error(response.message || 'Erro ao atualizar intolerância');
          }
        }
      } else {
        // Criar
        const response = await IntoleranciasService.criar(data);
        if (response.success) {
          toast.success('Intolerância criada com sucesso!');
          handleCloseModal();
          loadIntolerancias();
        } else {
          if (!handleApiResponse(response)) {
            toast.error(response.message || 'Erro ao criar intolerância');
          }
        }
      }
    } catch (error) {
      console.error('Erro ao salvar intolerância:', error);
      toast.error('Erro ao salvar intolerância');
    }
  };

  // Função para excluir intolerância
  const handleDeleteIntolerancia = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta intolerância?')) {
      try {
        const response = await IntoleranciasService.excluir(id);
        if (response.success) {
          toast.success('Intolerância excluída com sucesso!');
          loadIntolerancias();
        } else {
          toast.error(response.message || 'Erro ao excluir intolerância');
        }
      } catch (error) {
        console.error('Erro ao excluir intolerância:', error);
        toast.error('Erro ao excluir intolerância');
      }
    }
  };

  // Funções para manipular modal
  const handleAddIntolerancia = () => {
    setEditingIntolerancia(null);
    setViewMode(false);
    setShowModal(true);
  };

  const handleViewIntolerancia = (intolerancia) => {
    setEditingIntolerancia(intolerancia);
    setViewMode(true);
    setShowModal(true);
  };

  const handleEditIntolerancia = (intolerancia) => {
    setEditingIntolerancia(intolerancia);
    setViewMode(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingIntolerancia(null);
    setViewMode(false);
    clearValidationErrors();
  };



  // Funções para paginação
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };



  return {
    // Estado
    intolerancias: filteredIntolerancias,
    loading,
    showModal,
    isViewMode: viewMode,
    editingIntolerancia,
    searchTerm,
    statusFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    validationErrors,
    showValidationModal,

    // Funções
    onSubmit,
    handleDeleteIntolerancia,
    handleAddIntolerancia,
    handleViewIntolerancia,
    handleEditIntolerancia,
    handleCloseModal,
    handleCloseValidationModal,
    handlePageChange,
    handleItemsPerPageChange,
    setSearchTerm,
    setStatusFilter
  };
};
