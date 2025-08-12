import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import NomeGenericoProdutoService from '../services/nomeGenericoProduto';
import GruposService from '../services/grupos';
import SubgruposService from '../services/subgrupos';
import ClassesService from '../services/classes';

export const useNomeGenericoProduto = () => {
  // Estados principais
  const [nomesGenericos, setNomesGenericos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [subgrupos, setSubgrupos] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  const [loadingSubgrupos, setLoadingSubgrupos] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingNomeGenerico, setEditingNomeGenerico] = useState(null);

  // Estados de filtros e paginação
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [grupoFilter, setGrupoFilter] = useState('todos');
  const [subgrupoFilter, setSubgrupoFilter] = useState('todos');
  const [classeFilter, setClasseFilter] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Estados de estatísticas
  const [estatisticas, setEstatisticas] = useState({
    total_nomes_genericos: 0,
    nomes_genericos_ativos: 0,
    nomes_genericos_inativas: 0
  });

  // Carregar nomes genéricos
  const loadNomesGenericos = async (params = {}) => {
    setLoading(true);
    try {
      // Parâmetros de paginação
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter === 'ativo' ? 1 : statusFilter === 'inativo' ? 0 : undefined,
        grupo_id: grupoFilter === 'todos' ? undefined : grupoFilter,
        subgrupo_id: subgrupoFilter === 'todos' ? undefined : subgrupoFilter,
        classe_id: classeFilter === 'todos' ? undefined : classeFilter,
        ...params
      };

      const result = await NomeGenericoProdutoService.listar(paginationParams);
      if (result.success) {
        setNomesGenericos(result.data);
        
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
        const ativos = result.data.filter(n => n.status === 1).length;
        const inativos = result.data.filter(n => n.status === 0).length;
        
        setEstatisticas({
          total_nomes_genericos: total,
          nomes_genericos_ativos: ativos,
          nomes_genericos_inativas: inativos
        });
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao carregar nomes genéricos');
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
      } else {
        toast.error('Erro ao carregar grupos');
      }
    } catch (error) {
      toast.error('Erro ao carregar grupos');
    } finally {
      setLoadingGrupos(false);
    }
  };

  // Carregar subgrupos
  const loadSubgrupos = async (grupoId = null) => {
    try {
      setLoadingSubgrupos(true);
      let result;
      if (grupoId) {
        result = await SubgruposService.buscarPorGrupo(grupoId);
      } else {
        result = await SubgruposService.buscarAtivos();
      }
      if (result.success) {
        setSubgrupos(result.data || []);
      } else {
        toast.error('Erro ao carregar subgrupos');
      }
    } catch (error) {
      toast.error('Erro ao carregar subgrupos');
    } finally {
      setLoadingSubgrupos(false);
    }
  };

  // Carregar classes
  const loadClasses = async (subgrupoId = null) => {
    try {
      setLoadingClasses(true);
      let result;
      if (subgrupoId) {
        result = await ClassesService.buscarPorSubgrupo(subgrupoId);
      } else {
        result = await ClassesService.buscarAtivos();
      }
      if (result.success) {
        setClasses(result.data || []);
      } else {
        toast.error('Erro ao carregar classes');
      }
    } catch (error) {
      toast.error('Erro ao carregar classes');
    } finally {
      setLoadingClasses(false);
    }
  };

  // Carregar dados quando dependências mudarem
  useEffect(() => {
    loadNomesGenericos();
  }, [currentPage, itemsPerPage, searchTerm, statusFilter, grupoFilter, subgrupoFilter, classeFilter]);

  // Carregar grupos uma vez
  useEffect(() => {
    loadGrupos();
  }, []);

  // Filtrar nomes genéricos (client-side)
  const filteredNomesGenericos = (Array.isArray(nomesGenericos) ? nomesGenericos : []).filter(nomeGenerico => {
    const matchesSearch = !searchTerm || 
      (nomeGenerico.nome && nomeGenerico.nome.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'todos' || 
      (statusFilter === 'ativo' && nomeGenerico.status === 1) ||
      (statusFilter === 'inativo' && nomeGenerico.status === 0);
    
    const matchesGrupo = grupoFilter === 'todos' || 
      nomeGenerico.grupo_id === parseInt(grupoFilter);
    
    const matchesSubgrupo = subgrupoFilter === 'todos' || 
      nomeGenerico.subgrupo_id === parseInt(subgrupoFilter);
    
    const matchesClasse = classeFilter === 'todos' || 
      nomeGenerico.classe_id === parseInt(classeFilter);
    
    return matchesSearch && matchesStatus && matchesGrupo && matchesSubgrupo && matchesClasse;
  });

  // Funções de CRUD
  const onSubmit = async (data) => {
    try {
      // Limpar campos vazios para evitar problemas de validação
      const cleanData = {
        ...data,
        nome: data.nome && data.nome.trim() !== '' ? data.nome.trim() : null,
        grupo_id: data.grupo_id ? parseInt(data.grupo_id) : null,
        subgrupo_id: data.subgrupo_id ? parseInt(data.subgrupo_id) : null,
        classe_id: data.classe_id ? parseInt(data.classe_id) : null,
        status: data.status === '1' ? 1 : 0
      };

      let result;
      if (editingNomeGenerico) {
        result = await NomeGenericoProdutoService.atualizar(editingNomeGenerico.id, cleanData);
      } else {
        result = await NomeGenericoProdutoService.criar(cleanData);
      }
      
      if (result.success) {
        toast.success(editingNomeGenerico ? 'Nome genérico atualizado com sucesso!' : 'Nome genérico criado com sucesso!');
        handleCloseModal();
        loadNomesGenericos();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao salvar nome genérico');
    }
  };

  const handleDeleteNomeGenerico = async (nomeGenericoId) => {
    if (window.confirm('Tem certeza que deseja excluir este nome genérico?')) {
      try {
        const result = await NomeGenericoProdutoService.excluir(nomeGenericoId);
        if (result.success) {
          toast.success('Nome genérico excluído com sucesso!');
          loadNomesGenericos();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error('Erro ao excluir nome genérico');
      }
    }
  };

  // Funções de modal
  const handleAddNomeGenerico = () => {
    setViewMode(false);
    setEditingNomeGenerico(null);
    setShowModal(true);
  };

  const handleViewNomeGenerico = (nomeGenerico) => {
    setViewMode(true);
    setEditingNomeGenerico(nomeGenerico);
    setShowModal(true);
  };

  const handleEditNomeGenerico = (nomeGenerico) => {
    setViewMode(false);
    setEditingNomeGenerico(nomeGenerico);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setViewMode(false);
    setEditingNomeGenerico(null);
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
    setSubgrupoFilter('todos');
    setClasseFilter('todos');
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

  const getGrupoNome = (grupoId) => {
    const grupo = grupos.find(g => g.id === grupoId);
    return grupo ? grupo.nome : 'N/A';
  };

  const getSubgrupoNome = (subgrupoId) => {
    const subgrupo = subgrupos.find(s => s.id === subgrupoId);
    return subgrupo ? subgrupo.nome : 'N/A';
  };

  const getClasseNome = (classeId) => {
    const classe = classes.find(c => c.id === classeId);
    return classe ? classe.nome : 'N/A';
  };

  return {
    // Estados
    nomesGenericos: filteredNomesGenericos,
    grupos,
    subgrupos,
    classes,
    loading,
    loadingGrupos,
    loadingSubgrupos,
    loadingClasses,
    showModal,
    viewMode,
    editingNomeGenerico,
    searchTerm,
    statusFilter,
    grupoFilter,
    subgrupoFilter,
    classeFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,

    // Funções CRUD
    onSubmit,
    handleDeleteNomeGenerico,

    // Funções de modal
    handleAddNomeGenerico,
    handleViewNomeGenerico,
    handleEditNomeGenerico,
    handleCloseModal,

    // Funções de paginação
    handlePageChange,

    // Funções de filtros
    setSearchTerm,
    setStatusFilter,
    setGrupoFilter,
    setSubgrupoFilter,
    setClasseFilter,
    handleClearFilters,

    // Funções de carregamento
    loadSubgrupos,
    loadClasses,

    // Funções utilitárias
    formatDate,
    getStatusLabel,
    getGrupoNome,
    getSubgrupoNome,
    getClasseNome
  };
};
