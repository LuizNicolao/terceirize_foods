import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import FiliaisService from '../services/filiais';
import { useValidation } from './useValidation';

export const useFiliais = () => {
  // Estados principais
  const [filiais, setFiliais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingFilial, setEditingFilial] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Estados de estatísticas
  const [estatisticas, setEstatisticas] = useState({
    total_filiais: 0,
    filiais_ativas: 0,
    filiais_inativas: 0,
    com_cnpj: 0
  });

  // Hook de validação
  const {
    validationErrors,
    showValidationModal,
    handleApiResponse,
    handleCloseValidationModal,
    clearValidationErrors
  } = useValidation();

  // Carregar filiais
  const loadFiliais = async (params = {}) => {
    setLoading(true);
    try {
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        ...params
      };

      const result = await FiliaisService.listar(paginationParams);
      if (result.success) {
        setFiliais(result.data || []);
        
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages || 1);
          setTotalItems(result.pagination.totalItems || result.data.length);
          setCurrentPage(result.pagination.currentPage || 1);
        } else {
          setTotalItems(result.data.length);
          setTotalPages(Math.ceil(result.data.length / itemsPerPage));
        }
        
        // Calcular estatísticas básicas
        const total = result.pagination?.totalItems || result.data.length;
        const ativas = result.data.filter(f => f.status === 1).length;
        const inativas = result.data.filter(f => f.status === 0).length;
        const comCnpj = result.data.filter(f => f.cnpj && f.cnpj.trim() !== '').length;
        
        setEstatisticas({
          total_filiais: total,
          filiais_ativas: ativas,
          filiais_inativas: inativas,
          com_cnpj: comCnpj
        });
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
      toast.error('Erro ao carregar filiais');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando dependências mudarem
  useEffect(() => {
    loadFiliais();
  }, [currentPage, itemsPerPage]);

  // Filtrar filiais (client-side)
  const filteredFiliais = filiais.filter(filial => {
    const matchesSearch = !searchTerm || 
      (filial.filial && filial.filial.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (filial.razao_social && filial.razao_social.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (filial.cidade && filial.cidade.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (filial.codigo_filial && filial.codigo_filial.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'todos' || filial.status === parseInt(statusFilter);
    
    return matchesSearch && matchesStatus;
  });

  // Funções de CRUD
  const onSubmit = async (data) => {
    try {
      clearValidationErrors(); // Limpar erros anteriores
      
      // Limpar campos vazios para evitar problemas de validação
      const cleanData = {
        ...data,
        codigo_filial: data.codigo_filial && data.codigo_filial.trim() !== '' ? data.codigo_filial.trim() : null,
        cnpj: data.cnpj && data.cnpj.trim() !== '' ? data.cnpj.trim() : null,
        filial: data.filial && data.filial.trim() !== '' ? data.filial.trim() : null,
        razao_social: data.razao_social && data.razao_social.trim() !== '' ? data.razao_social.trim() : null,
        email: data.email && data.email.trim() !== '' ? data.email.trim() : null,
        telefone: data.telefone && data.telefone.trim() !== '' ? data.telefone.trim() : null
      };

      let result;
      if (editingFilial) {
        result = await FiliaisService.atualizar(editingFilial.id, cleanData);
      } else {
        result = await FiliaisService.criar(cleanData);
      }
      
      if (result.success) {
        toast.success(editingFilial ? 'Filial atualizada com sucesso!' : 'Filial criada com sucesso!');
        handleCloseModal();
        loadFiliais();
      } else {
        if (handleApiResponse(result)) {
          return; // Erros de validação foram tratados
        }
        toast.error(result.message || 'Erro ao salvar filial');
      }
    } catch (error) {
      console.error('Erro ao salvar filial:', error);
      toast.error('Erro ao salvar filial');
    }
  };

  const handleDeleteFilial = async (filialId) => {
    if (window.confirm('Tem certeza que deseja excluir esta filial?')) {
      try {
        const result = await FiliaisService.excluir(filialId);
        if (result.success) {
          toast.success('Filial excluída com sucesso!');
          loadFiliais();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error('Erro ao excluir filial');
      }
    }
  };

  // Funções de modal
  const handleAddFilial = () => {
    setViewMode(false);
    setEditingFilial(null);
    setShowModal(true);
  };

  const handleViewFilial = (filial) => {
    setViewMode(true);
    setEditingFilial(filial);
    setShowModal(true);
  };

  const handleEditFilial = (filial) => {
    setViewMode(false);
    setEditingFilial(filial);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setViewMode(false);
    setEditingFilial(null);
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
    filiais: Array.isArray(filteredFiliais) ? filteredFiliais : [],
    loading,
    showModal,
    viewMode,
    editingFilial,
    searchTerm,
    statusFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,

    // Estados de validação
    validationErrors,
    showValidationModal,
    handleCloseValidationModal,

    // Funções CRUD
    onSubmit,
    handleDeleteFilial,

    // Funções de modal
    handleAddFilial,
    handleViewFilial,
    handleEditFilial,
    handleCloseModal,

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
