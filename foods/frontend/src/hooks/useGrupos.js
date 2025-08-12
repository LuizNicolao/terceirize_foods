import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import GruposService from '../services/grupos';

export const useGrupos = () => {
  // Estados principais
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingGrupo, setEditingGrupo] = useState(null);

  // Estados de filtros e paginação
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Estados de estatísticas
  const [estatisticas, setEstatisticas] = useState({
    total_grupos: 0,
    grupos_ativos: 0,
    grupos_inativos: 0,
    subgrupos_total: 0
  });

  // Carregar grupos
  const loadGrupos = async (params = {}) => {
    setLoading(true);
    try {
      // Parâmetros de paginação
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter === 'ativo' ? 1 : statusFilter === 'inativo' ? 0 : undefined,
        ...params
      };

      const result = await GruposService.listar(paginationParams);
      if (result.success) {
        setGrupos(result.data);
        
        // Extrair informações de paginação
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages || 1);
          setTotalItems(result.pagination.totalItems || result.data.length);
          setCurrentPage(result.pagination.currentPage || 1);
        } else {
          // Fallback se não houver paginação no backend
          setTotalItems(result.data.length);
          setTotalPages(Math.ceil(result.data.length / itemsPerPage));
        }
        
        // Calcular estatísticas básicas
        const total = result.pagination?.totalItems || result.data.length;
        const ativos = result.data.filter(g => g.status === 1).length;
        const inativos = result.data.filter(g => g.status === 0).length;
        const subgrupos = result.data.reduce((acc, grupo) => acc + (grupo.subgrupos_count || 0), 0);
        
        setEstatisticas({
          total_grupos: total,
          grupos_ativos: ativos,
          grupos_inativos: inativos,
          subgrupos_total: subgrupos
        });
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao carregar grupos');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando dependências mudarem
  useEffect(() => {
    loadGrupos();
  }, [currentPage, itemsPerPage, searchTerm, statusFilter]);

  // Filtrar grupos (client-side)
  const filteredGrupos = (Array.isArray(grupos) ? grupos : []).filter(grupo => {
    const matchesSearch = !searchTerm || 
      (grupo.nome && grupo.nome.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'todos' || 
      (statusFilter === 'ativo' && grupo.status === 1) ||
      (statusFilter === 'inativo' && grupo.status === 0);
    
    return matchesSearch && matchesStatus;
  });

  // Funções de CRUD
  const onSubmit = async (data) => {
    try {
      // Limpar campos vazios para evitar problemas de validação
      const cleanData = {
        ...data,
        nome: data.nome && data.nome.trim() !== '' ? data.nome.trim() : null,
        status: data.status || 1
      };

      let result;
      if (editingGrupo) {
        result = await GruposService.atualizar(editingGrupo.id, cleanData);
      } else {
        result = await GruposService.criar(cleanData);
      }
      
      if (result.success) {
        toast.success(editingGrupo ? 'Grupo atualizado com sucesso!' : 'Grupo criado com sucesso!');
        handleCloseModal();
        loadGrupos();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao salvar grupo');
    }
  };

  const handleDeleteGrupo = async (grupoId) => {
    if (window.confirm('Tem certeza que deseja excluir este grupo?')) {
      try {
        const result = await GruposService.excluir(grupoId);
        if (result.success) {
          toast.success('Grupo excluído com sucesso!');
          loadGrupos();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error('Erro ao excluir grupo');
      }
    }
  };

  // Funções de modal
  const handleAddGrupo = () => {
    setViewMode(false);
    setEditingGrupo(null);
    setShowModal(true);
  };

  const handleViewGrupo = (grupo) => {
    setViewMode(true);
    setEditingGrupo(grupo);
    setShowModal(true);
  };

  const handleEditGrupo = (grupo) => {
    setViewMode(false);
    setEditingGrupo(grupo);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setViewMode(false);
    setEditingGrupo(null);
  };

  // Funções de paginação
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Funções de filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('todos');
    setCurrentPage(1);
  };

  // Funções utilitárias
  const getStatusLabel = (status) => {
    return status === 1 ? 'Ativo' : 'Inativo';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return {
    // Estados
    grupos: filteredGrupos,
    loading,
    showModal,
    viewMode,
    editingGrupo,
    searchTerm,
    statusFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,

    // Funções CRUD
    onSubmit,
    handleDeleteGrupo,

    // Funções de modal
    handleAddGrupo,
    handleViewGrupo,
    handleEditGrupo,
    handleCloseModal,

    // Funções de paginação
    handlePageChange,

    // Funções de filtros
    setSearchTerm,
    setStatusFilter,
    setItemsPerPage,
    handleClearFilters,

    // Funções utilitárias
    formatDate,
    getStatusLabel
  };
};
