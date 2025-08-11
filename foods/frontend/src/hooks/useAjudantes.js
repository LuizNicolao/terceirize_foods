import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import AjudantesService from '../services/ajudantes';
import FiliaisService from '../services/filiais';

export const useAjudantes = () => {
  const [ajudantes, setAjudantes] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingAjudante, setEditingAjudante] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const [estatisticas, setEstatisticas] = useState({
    total_ajudantes: 0,
    ajudantes_ativos: 0,
    em_ferias: 0,
    em_licenca: 0
  });

  const { register, handleSubmit: handleFormSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    loadAjudantes();
    loadFiliais();
  }, [currentPage, itemsPerPage]);

  const loadFiliais = async () => {
    try {
      const result = await FiliaisService.buscarAtivas();
      if (result.success) {
        setFiliais(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
    }
  };

  const loadAjudantes = async (params = {}) => {
    setLoading(true);
    try {
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        ...params
      };

      const result = await AjudantesService.listar(paginationParams);
      if (result.success) {
        setAjudantes(result.data);
        
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages || 1);
          setTotalItems(result.pagination.totalItems || result.data.length);
          setCurrentPage(result.pagination.currentPage || 1);
        } else {
          setTotalPages(1);
          setTotalItems(result.data.length);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar ajudantes:', error);
      toast.error('Erro ao carregar ajudantes');
    } finally {
      setLoading(false);
    }
  };

  const loadEstatisticas = async () => {
    try {
      const result = await AjudantesService.estatisticas();
      if (result.success) {
        setEstatisticas(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleCreate = () => {
    setEditingAjudante(null);
    setViewMode(false);
    setShowModal(true);
    reset();
  };

  const handleEdit = (ajudante) => {
    setEditingAjudante(ajudante);
    setViewMode(false);
    setShowModal(true);
    reset(ajudante);
  };

  const handleView = (ajudante) => {
    setEditingAjudante(ajudante);
    setViewMode(true);
    setShowModal(true);
    reset(ajudante);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este ajudante?')) {
      try {
        const result = await AjudantesService.excluir(id);
        if (result.success) {
          toast.success('Ajudante excluído com sucesso');
          loadAjudantes();
          loadEstatisticas();
        } else {
          toast.error(result.message || 'Erro ao excluir ajudante');
        }
      } catch (error) {
        console.error('Erro ao excluir ajudante:', error);
        toast.error('Erro ao excluir ajudante');
      }
    }
  };

  const handleSubmit = async (data) => {
    try {
      let result;
      if (editingAjudante) {
        result = await AjudantesService.atualizar(editingAjudante.id, data);
      } else {
        result = await AjudantesService.criar(data);
      }

      if (result.success) {
        toast.success(
          editingAjudante 
            ? 'Ajudante atualizado com sucesso' 
            : 'Ajudante criado com sucesso'
        );
        setShowModal(false);
        loadAjudantes();
        loadEstatisticas();
      } else {
        toast.error(result.message || 'Erro ao salvar ajudante');
      }
    } catch (error) {
      console.error('Erro ao salvar ajudante:', error);
      toast.error('Erro ao salvar ajudante');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAjudante(null);
    setViewMode(false);
    reset();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
    loadAjudantes({ search: term });
  };

  return {
    ajudantes,
    filiais,
    loading,
    showModal,
    viewMode,
    editingAjudante,
    searchTerm,
    setSearchTerm,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    register,
    errors,
    handleCreate,
    handleEdit,
    handleDelete,
    handleView,
    handleSubmit: handleFormSubmit(handleSubmit),
    handleCloseModal,
    handlePageChange,
    handleItemsPerPageChange,
    handleSearch
  };
};
