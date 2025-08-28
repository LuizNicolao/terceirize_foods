import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import IntoleranciasService from '../services/intolerancias';

export const useIntolerancias = () => {
  const [intolerancias, setIntolerancias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingIntolerancia, setEditingIntolerancia] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [validationErrors, setValidationErrors] = useState({});
  const [showValidationModal, setShowValidationModal] = useState(false);

  // Carregar intolerâncias
  const loadIntolerancias = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter
      };

      const response = await IntoleranciasService.listarIntolerancias(params);
      
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
  }, [currentPage, itemsPerPage, searchTerm, statusFilter]);

  // Carregar dados iniciais
  useEffect(() => {
    loadIntolerancias();
  }, [loadIntolerancias]);

  // Função para submeter formulário (criar/atualizar)
  const onSubmit = async (data) => {
    try {
      setValidationErrors({});
      
      if (editingIntolerancia) {
        // Atualizar
        const response = await IntoleranciasService.atualizarIntolerancia(editingIntolerancia.id, data);
        if (response.success) {
          toast.success('Intolerância atualizada com sucesso!');
          handleCloseModal();
          loadIntolerancias();
        } else {
          if (response.validationErrors) {
            setValidationErrors(response.validationErrors);
            setShowValidationModal(true);
          } else {
            toast.error(response.message || 'Erro ao atualizar intolerância');
          }
        }
      } else {
        // Criar
        const response = await IntoleranciasService.criarIntolerancia(data);
        if (response.success) {
          toast.success('Intolerância criada com sucesso!');
          handleCloseModal();
          loadIntolerancias();
        } else {
          if (response.validationErrors) {
            setValidationErrors(response.validationErrors);
            setShowValidationModal(true);
          } else {
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
        const response = await IntoleranciasService.excluirIntolerancia(id);
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
    setValidationErrors({});
    setShowValidationModal(false);
  };

  const handleCloseValidationModal = () => {
    setShowValidationModal(false);
    setValidationErrors({});
  };

  // Funções para paginação
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return {
    // Estado
    intolerancias,
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
    setStatusFilter,
    formatDate
  };
};
