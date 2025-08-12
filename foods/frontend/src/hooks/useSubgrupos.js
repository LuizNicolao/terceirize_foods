import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import SubgruposService from '../services/subgrupos';
import GruposService from '../services/grupos';

export const useSubgrupos = () => {
  // Estados principais
  const [subgrupos, setSubgrupos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingSubgrupo, setEditingSubgrupo] = useState(null);

  // Estados de filtros e paginação
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [grupoFilter, setGrupoFilter] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Estados de estatísticas
  const [estatisticas, setEstatisticas] = useState({
    total_subgrupos: 0,
    subgrupos_ativos: 0,
    subgrupos_inativos: 0,
    produtos_total: 0
  });

  // Carregar subgrupos
  const loadSubgrupos = async (params = {}) => {
    setLoading(true);
    try {
      // Parâmetros de paginação
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter === 'ativo' ? 'ativo' : statusFilter === 'inativo' ? 'inativo' : undefined,
        grupo_id: grupoFilter === 'todos' ? undefined : grupoFilter,
        ...params
      };

      const result = await SubgruposService.listar(paginationParams);
      if (result.success) {
        setSubgrupos(result.data);
        
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
        const ativos = result.data.filter(sg => sg.status === 'ativo').length;
        const inativos = result.data.filter(sg => sg.status === 'inativo').length;
        const produtos = result.data.reduce((acc, subgrupo) => acc + (subgrupo.total_produtos || 0), 0);
        
        setEstatisticas({
          total_subgrupos: total,
          subgrupos_ativos: ativos,
          subgrupos_inativos: inativos,
          produtos_total: produtos
        });
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao carregar subgrupos');
    } finally {
      setLoading(false);
    }
  };

  // Carregar grupos
  const loadGrupos = async () => {
    try {
      setLoadingGrupos(true);
      const result = await GruposService.buscarAtivos();
      if (result.success) {
        setGrupos(result.data || []);
      }
    } catch (error) {
      toast.error('Erro ao carregar grupos');
    } finally {
      setLoadingGrupos(false);
    }
  };

  // Carregar dados quando dependências mudarem
  useEffect(() => {
    loadSubgrupos();
  }, [currentPage, itemsPerPage, searchTerm, statusFilter, grupoFilter]);

  // Carregar grupos uma vez
  useEffect(() => {
    loadGrupos();
  }, []);

  // Filtrar subgrupos (client-side)
  const filteredSubgrupos = (Array.isArray(subgrupos) ? subgrupos : []).filter(subgrupo => {
    const matchesSearch = !searchTerm || 
      (subgrupo.nome && subgrupo.nome.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'todos' || 
      (statusFilter === 'ativo' && subgrupo.status === 'ativo') ||
      (statusFilter === 'inativo' && subgrupo.status === 'inativo');
    
    const matchesGrupo = grupoFilter === 'todos' || 
      subgrupo.grupo_id === parseInt(grupoFilter);
    
    return matchesSearch && matchesStatus && matchesGrupo;
  });

  // Funções de CRUD
  const onSubmit = async (data) => {
    try {
      // Limpar campos vazios para evitar problemas de validação
      const cleanData = {
        ...data,
        nome: data.nome && data.nome.trim() !== '' ? data.nome.trim() : null,
        codigo: data.codigo && data.codigo.trim() !== '' ? data.codigo.trim() : null,
        descricao: data.descricao && data.descricao.trim() !== '' ? data.descricao.trim() : null,
        grupo_id: data.grupo_id ? parseInt(data.grupo_id) : null,
        status: data.status === '1' ? 'ativo' : 'inativo'
      };

      let result;
      if (editingSubgrupo) {
        result = await SubgruposService.atualizar(editingSubgrupo.id, cleanData);
      } else {
        result = await SubgruposService.criar(cleanData);
      }
      
      if (result.success) {
        toast.success(editingSubgrupo ? 'Subgrupo atualizado com sucesso!' : 'Subgrupo criado com sucesso!');
        handleCloseModal();
        loadSubgrupos();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao salvar subgrupo');
    }
  };

  const handleDeleteSubgrupo = async (subgrupoId) => {
    if (window.confirm('Tem certeza que deseja excluir este subgrupo?')) {
      try {
        const result = await SubgruposService.excluir(subgrupoId);
        if (result.success) {
          toast.success('Subgrupo excluído com sucesso!');
          loadSubgrupos();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error('Erro ao excluir subgrupo');
      }
    }
  };

  // Funções de modal
  const handleAddSubgrupo = () => {
    setViewMode(false);
    setEditingSubgrupo(null);
    setShowModal(true);
  };

  const handleViewSubgrupo = (subgrupo) => {
    setViewMode(true);
    setEditingSubgrupo(subgrupo);
    setShowModal(true);
  };

  const handleEditSubgrupo = (subgrupo) => {
    setViewMode(false);
    setEditingSubgrupo(subgrupo);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setViewMode(false);
    setEditingSubgrupo(null);
  };

  // Funções de paginação
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Funções de filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('todos');
    setGrupoFilter('todos');
    setCurrentPage(1);
  };

  // Funções utilitárias
  const getStatusLabel = (status) => {
    return status === 'ativo' ? 'Ativo' : 'Inativo';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getGrupoNome = (grupoId) => {
    const grupo = grupos.find(g => g.id === grupoId);
    return grupo ? grupo.nome : 'N/A';
  };

  return {
    // Estados
    subgrupos: filteredSubgrupos,
    grupos,
    loading,
    loadingGrupos,
    showModal,
    viewMode,
    editingSubgrupo,
    searchTerm,
    statusFilter,
    grupoFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,

    // Funções CRUD
    onSubmit,
    handleDeleteSubgrupo,

    // Funções de modal
    handleAddSubgrupo,
    handleViewSubgrupo,
    handleEditSubgrupo,
    handleCloseModal,

    // Funções de paginação
    handlePageChange,

    // Funções de filtros
    setSearchTerm,
    setStatusFilter,
    setGrupoFilter,
    setItemsPerPage,
    handleClearFilters,

    // Funções utilitárias
    formatDate,
    getStatusLabel,
    getGrupoNome
  };
};
