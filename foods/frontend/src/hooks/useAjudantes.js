import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import AjudantesService from '../services/ajudantes';
import FiliaisService from '../services/filiais';
import { useValidation } from './useValidation';

export const useAjudantes = () => {
  // Estados principais
  const [ajudantes, setAjudantes] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingAjudante, setEditingAjudante] = useState(null);

  // Estados de filtros e paginação
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Estados de estatísticas
  const [estatisticas, setEstatisticas] = useState({
    total_ajudantes: 0,
    ajudantes_ativos: 0,
    em_ferias: 0,
    em_licenca: 0
  });

  // Estados para modal de confirmação
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [ajudanteToDelete, setAjudanteToDelete] = useState(null);

  // Hook de validação
  const {
    validationErrors,
    showValidationModal,
    handleApiResponse,
    handleCloseValidationModal,
    clearValidationErrors
  } = useValidation();

  // Carregar filiais
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

  // Carregar ajudantes
  const loadAjudantes = async (params = {}) => {
    setLoading(true);
    try {
      // Parâmetros de paginação
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        ...params
      };

      const result = await AjudantesService.listar(paginationParams);
      if (result.success) {
        setAjudantes(result.data);
        
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
        const ativos = result.data.filter(a => a.status === 'ativo').length;
        const ferias = result.data.filter(a => a.status === 'ferias').length;
        const licenca = result.data.filter(a => a.status === 'licenca').length;
        
        setEstatisticas({
          total_ajudantes: total,
          ajudantes_ativos: ativos,
          em_ferias: ferias,
          em_licenca: licenca
        });
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao carregar ajudantes');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando dependências mudarem
  useEffect(() => {
    loadAjudantes();
    loadFiliais();
  }, [currentPage, itemsPerPage]);

  // Função para recarregar dados
  const reloadData = () => {
    loadAjudantes();
  };

  // Filtrar ajudantes (client-side)
  const filteredAjudantes = ajudantes.filter(ajudante => {
    const matchesSearch = !searchTerm || 
      (ajudante.nome && ajudante.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ajudante.cpf && ajudante.cpf.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ajudante.telefone && ajudante.telefone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ajudante.email && ajudante.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  // Funções de CRUD
  const onSubmit = async (data) => {
    try {
      clearValidationErrors(); // Limpar erros anteriores
      
      // Limpar campos vazios para evitar problemas de validação
      const cleanData = {
        ...data,
        filial_id: data.filial_id && data.filial_id !== '' ? parseInt(data.filial_id) : null,
        cpf: data.cpf && data.cpf.trim() !== '' ? data.cpf.trim() : null,
        telefone: data.telefone && data.telefone.trim() !== '' ? data.telefone.trim() : null,
        email: data.email && data.email.trim() !== '' ? data.email.trim() : null,
        endereco: data.endereco && data.endereco.trim() !== '' ? data.endereco.trim() : null,
        observacoes: data.observacoes && data.observacoes.trim() !== '' ? data.observacoes.trim() : null
      };

      let result;
      if (editingAjudante) {
        result = await AjudantesService.atualizar(editingAjudante.id, cleanData);
      } else {
        result = await AjudantesService.criar(cleanData);
      }
      
      if (result.success) {
        toast.success(editingAjudante ? 'Ajudante atualizado com sucesso!' : 'Ajudante criado com sucesso!');
        handleCloseModal();
        reloadData();
      } else {
        // Verificar se há erros de validação
        if (handleApiResponse(result)) {
          return; // Erros de validação foram tratados
        }
        // Outros tipos de erro
        toast.error(result.message || 'Erro ao salvar ajudante');
      }
    } catch (error) {
      console.error('Erro ao salvar ajudante:', error);
      toast.error('Erro ao salvar ajudante');
    }
  };

  const handleDeleteAjudante = (ajudante) => {
    setAjudanteToDelete(ajudante);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!ajudanteToDelete) return;

    try {
      const result = await AjudantesService.excluir(ajudanteToDelete.id);
      if (result.success) {
        toast.success('Ajudante excluído com sucesso!');
        reloadData();
        setShowDeleteConfirmModal(false);
        setAjudanteToDelete(null);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao excluir ajudante');
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteConfirmModal(false);
    setAjudanteToDelete(null);
  };

  // Funções de modal
  const handleAddAjudante = () => {
    setViewMode(false);
    setEditingAjudante(null);
    setShowModal(true);
  };

  const handleViewAjudante = (ajudante) => {
    setViewMode(true);
    setEditingAjudante(ajudante);
    setShowModal(true);
  };

  const handleEditAjudante = (ajudante) => {
    setViewMode(false);
    setEditingAjudante(ajudante);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setViewMode(false);
    setEditingAjudante(null);
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
    const statusMap = {
      ativo: 'Ativo',
      inativo: 'Inativo',
      ferias: 'Em Férias',
      licenca: 'Em Licença'
    };
    return statusMap[status] || status;
  };

  return {
    // Estados
    ajudantes: filteredAjudantes,
    filiais,
    loading,
    showModal,
    viewMode,
    editingAjudante,
    searchTerm,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,

    // Estados de validação
    validationErrors,
    showValidationModal,

    // Estados para modal de confirmação
    showDeleteConfirmModal,
    ajudanteToDelete,

    // Funções
    onSubmit,
    handleDeleteAjudante,
    handleConfirmDelete,
    handleCloseDeleteModal,
    handleAddAjudante,
    handleViewAjudante,
    handleEditAjudante,
    handleCloseModal,
    handlePageChange,
    setSearchTerm,
    setItemsPerPage,
    formatDate,
    getStatusLabel,
    handleCloseValidationModal
  };
};
