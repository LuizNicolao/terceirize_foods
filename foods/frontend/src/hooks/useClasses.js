import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ClassesService from '../services/classes';
import SubgruposService from '../services/subgrupos';
import { useValidation } from './useValidation';

export const useClasses = () => {
  // Hook de validação universal
  const {
    validationErrors,
    showValidationModal,
    handleApiResponse,
    handleCloseValidationModal,
    clearValidationErrors
  } = useValidation();

  // Estados principais
  const [classes, setClasses] = useState([]);
  const [subgrupos, setSubgrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubgrupos, setLoadingSubgrupos] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingClasse, setEditingClasse] = useState(null);

  // Estados de filtros e paginação
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [subgrupoFilter, setSubgrupoFilter] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Estados para modal de confirmação
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [classeToDelete, setClasseToDelete] = useState(null);

  // Estados de estatísticas
  const [estatisticas, setEstatisticas] = useState({
    total_classes: 0,
    classes_ativas: 0,
    classes_inativas: 0,
    produtos_total: 0
  });

  // Carregar classes
  const loadClasses = async (params = {}) => {
    setLoading(true);
    try {
      // Parâmetros de paginação
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter === 'ativo' ? 'ativo' : statusFilter === 'inativo' ? 'inativo' : undefined,
        subgrupo_id: subgrupoFilter === 'todos' ? undefined : subgrupoFilter,
        ...params
      };

      const result = await ClassesService.listar(paginationParams);
      if (result.success) {
        setClasses(result.data);
        
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
        const ativas = result.data.filter(c => c.status === 'ativo').length;
        const inativas = result.data.filter(c => c.status === 'inativo').length;
        const produtos = result.data.reduce((acc, classe) => acc + (classe.total_produtos || 0), 0);
        
        setEstatisticas({
          total_classes: total,
          classes_ativas: ativas,
          classes_inativas: inativas,
          produtos_total: produtos
        });
      } else {
        toast.error(result.message || 'Erro ao carregar classes');
      }
    } catch (error) {
      toast.error('Erro ao carregar classes');
    } finally {
      setLoading(false);
    }
  };

  // Carregar subgrupos
  const loadSubgrupos = async () => {
    try {
      setLoadingSubgrupos(true);
      const result = await SubgruposService.buscarAtivos();
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

  // Carregar dados quando dependências mudarem
  useEffect(() => {
    loadClasses();
  }, [currentPage, itemsPerPage, searchTerm, statusFilter, subgrupoFilter]);

  // Carregar subgrupos uma vez
  useEffect(() => {
    loadSubgrupos();
  }, []);

  // Filtrar classes (client-side)
  const filteredClasses = (Array.isArray(classes) ? classes : []).filter(classe => {
    const matchesSearch = !searchTerm || 
      (classe.nome && classe.nome.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'todos' || 
      (statusFilter === 'ativo' && classe.status === 'ativo') ||
      (statusFilter === 'inativo' && classe.status === 'inativo');
    
    const matchesSubgrupo = subgrupoFilter === 'todos' || 
      classe.subgrupo_id === parseInt(subgrupoFilter);
    
    return matchesSearch && matchesStatus && matchesSubgrupo;
  });

  // Funções de CRUD
  const onSubmit = async (data) => {
    try {
      clearValidationErrors(); // Limpar erros anteriores
      
      // Limpar campos vazios para evitar problemas de validação
      const cleanData = {
        ...data,
        nome: data.nome && data.nome.trim() !== '' ? data.nome.trim() : null,
        descricao: data.descricao && data.descricao.trim() !== '' ? data.descricao.trim() : null,
        subgrupo_id: data.subgrupo_id ? parseInt(data.subgrupo_id) : null,
        status: data.status === '1' ? 'ativo' : 'inativo'
      };

      let result;
      if (editingClasse) {
        result = await ClassesService.atualizar(editingClasse.id, cleanData);
      } else {
        result = await ClassesService.criar(cleanData);
      }
      
      if (result.success) {
        toast.success(editingClasse ? 'Classe atualizada com sucesso!' : 'Classe criada com sucesso!');
        handleCloseModal();
        loadClasses();
      } else {
        if (handleApiResponse(result)) {
          return; // Erros de validação foram tratados
        }
        toast.error(result.message || 'Erro ao salvar classe');
      }
    } catch (error) {
      toast.error('Erro ao salvar classe');
    }
  };

  const handleDeleteClasse = (classe) => {
    setClasseToDelete(classe);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!classeToDelete) return;

    try {
      const result = await ClassesService.excluir(classeToDelete.id);
      if (result.success) {
        toast.success('Classe excluída com sucesso!');
        loadClasses();
        setShowDeleteConfirmModal(false);
        setClasseToDelete(null);
      } else {
        toast.error(result.message || 'Erro ao excluir classe');
      }
    } catch (error) {
      toast.error('Erro ao excluir classe');
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteConfirmModal(false);
    setClasseToDelete(null);
  };

  // Funções de modal
  const handleAddClasse = () => {
    setViewMode(false);
    setEditingClasse(null);
    setShowModal(true);
  };

  const handleViewClasse = (classe) => {
    setViewMode(true);
    setEditingClasse(classe);
    setShowModal(true);
  };

  const handleEditClasse = (classe) => {
    setViewMode(false);
    setEditingClasse(classe);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setViewMode(false);
    setEditingClasse(null);
  };

  // Funções de paginação
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Funções de filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('todos');
    setSubgrupoFilter('todos');
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

  const getSubgrupoNome = (subgrupoId) => {
    const subgrupo = subgrupos.find(s => s.id === subgrupoId);
    return subgrupo ? subgrupo.nome : 'N/A';
  };

  return {
    // Estados
    classes: Array.isArray(filteredClasses) ? filteredClasses : [],
    subgrupos: Array.isArray(subgrupos) ? subgrupos : [],
    loading,
    loadingSubgrupos,
    showModal,
    viewMode,
    editingClasse,
    showValidationModal,
    validationErrors,
    searchTerm,
    statusFilter,
    subgrupoFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,

    // Estados para modal de confirmação
    showDeleteConfirmModal,
    classeToDelete,

    // Funções CRUD
    onSubmit,
    handleDeleteClasse,
    handleConfirmDelete,
    handleCloseDeleteModal,

    // Funções de modal
    handleAddClasse,
    handleViewClasse,
    handleEditClasse,
    handleCloseModal,
    handleCloseValidationModal,

    // Funções de paginação
    handlePageChange,

    // Funções de filtros
    setSearchTerm,
    setStatusFilter,
    setSubgrupoFilter,
    handleClearFilters,

    // Funções utilitárias
    formatDate,
    getStatusLabel,
    getSubgrupoNome
  };
};
