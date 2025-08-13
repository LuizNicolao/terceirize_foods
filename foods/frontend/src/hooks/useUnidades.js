import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import UnidadesService from '../services/unidades';

export const useUnidades = () => {
  // Estados principais
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingUnidade, setEditingUnidade] = useState(null);

  // Estados de filtros e paginação
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Estados de estatísticas
  const [estatisticas, setEstatisticas] = useState({
    total_unidades: 0,
    unidades_ativas: 0,
    unidades_inativas: 0
  });

  // Carregar unidades
  const loadUnidades = async (params = {}) => {
    setLoading(true);
    try {
      // Parâmetros de paginação
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        ...params
      };

      const result = await UnidadesService.listar(paginationParams);
      if (result.success) {
        // Garantir que data seja um array
        const data = Array.isArray(result.data) ? result.data : [];
        setUnidades(data);
        
        // Extrair informações de paginação
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages || 1);
          setTotalItems(result.pagination.totalItems || data.length);
          setCurrentPage(result.pagination.currentPage || 1);
        } else {
          // Fallback se não houver paginação no backend
          setTotalItems(data.length);
          setTotalPages(Math.ceil(data.length / itemsPerPage));
        }
        
        // Calcular estatísticas básicas
        const total = result.pagination?.totalItems || data.length;
        const ativas = data.filter(u => u.status === 1).length;
        const inativas = data.filter(u => u.status === 0).length;
        
        setEstatisticas({
          total_unidades: total,
          unidades_ativas: ativas,
          unidades_inativas: inativas
        });
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao carregar unidades');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando dependências mudarem
  useEffect(() => {
    loadUnidades();
  }, [currentPage, itemsPerPage]);

  // Filtrar unidades (client-side)
  const filteredUnidades = (Array.isArray(unidades) ? unidades : []).filter(unidade => {
    const matchesSearch = !searchTerm || 
      (unidade.nome && unidade.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (unidade.sigla && unidade.sigla.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'todos' || 
      (statusFilter === 'ativo' && unidade.status === 1) ||
      (statusFilter === 'inativo' && unidade.status === 0);
    
    return matchesSearch && matchesStatus;
  });

  // Funções de CRUD
  const onSubmit = async (data) => {
    try {
      // Limpar campos vazios para evitar problemas de validação
      const cleanData = {
        ...data,
        nome: data.nome && data.nome.trim() !== '' ? data.nome.trim() : null,
        sigla: data.sigla && data.sigla.trim() !== '' ? data.sigla.trim() : null
      };

      let result;
      if (editingUnidade) {
        result = await UnidadesService.atualizar(editingUnidade.id, cleanData);
      } else {
        result = await UnidadesService.criar(cleanData);
      }
      
      if (result.success) {
        toast.success(editingUnidade ? 'Unidade atualizada com sucesso!' : 'Unidade criada com sucesso!');
        handleCloseModal();
        loadUnidades();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao salvar unidade');
    }
  };

  const handleDeleteUnidade = async (unidadeId) => {
    if (window.confirm('Tem certeza que deseja excluir esta unidade?')) {
      try {
        const result = await UnidadesService.excluir(unidadeId);
        if (result.success) {
          toast.success('Unidade excluída com sucesso!');
          loadUnidades();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error('Erro ao excluir unidade');
      }
    }
  };

  // Funções de modal
  const handleAddUnidade = () => {
    setViewMode(false);
    setEditingUnidade(null);
    setShowModal(true);
  };

  const handleViewUnidade = (unidade) => {
    setViewMode(true);
    setEditingUnidade(unidade);
    setShowModal(true);
  };

  const handleEditUnidade = (unidade) => {
    setViewMode(false);
    setEditingUnidade(unidade);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setViewMode(false);
    setEditingUnidade(null);
  };

  // Funções de paginação
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Funções utilitárias
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusLabel = (status) => {
    return status === 1 ? 'Ativo' : 'Inativo';
  };

  return {
    // Estados
    unidades: Array.isArray(filteredUnidades) ? filteredUnidades : [],
    loading,
    showModal,
    viewMode,
    editingUnidade,
    searchTerm,
    statusFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,

    // Funções CRUD
    onSubmit,
    handleDeleteUnidade,

    // Funções de modal
    handleAddUnidade,
    handleViewUnidade,
    handleEditUnidade,
    handleCloseModal,

    // Funções de paginação
    handlePageChange,

    // Funções de filtros
    setSearchTerm,
    setStatusFilter,
    setItemsPerPage,

    // Funções utilitárias
    formatDate,
    getStatusLabel
  };
};
