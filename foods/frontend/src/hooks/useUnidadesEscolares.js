import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import UnidadesEscolaresService from '../services/unidadesEscolares';
import RotasService from '../services/rotas';
import FiliaisService from '../services/filiais';
import api from '../services/api';
import { useValidation } from './useValidation';

export const useUnidadesEscolares = () => {
  // Hook de validação universal
  const {
    validationErrors,
    showValidationModal,
    handleApiResponse,
    handleCloseValidationModal,
    clearValidationErrors
  } = useValidation();

  // Estados principais
  const [unidades, setUnidades] = useState([]);
  const [rotas, setRotas] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRotas, setLoadingRotas] = useState(false);
  const [loadingFiliais, setLoadingFiliais] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingUnidade, setEditingUnidade] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [rotaFilter, setRotaFilter] = useState('todos');

  // Estados para modal de confirmação
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [unidadeToDelete, setUnidadeToDelete] = useState(null);

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Estados de estatísticas
  const [estatisticas, setEstatisticas] = useState({
    total_unidades: 0,
    unidades_ativas: 0,
    total_estados: 0,
    total_cidades: 0
  });

  // Carregar unidades escolares
  const loadUnidades = async (params = {}) => {
    setLoading(true);
    try {
      // Se não há parâmetros específicos, usar os estados atuais
      // Se há parâmetros específicos (como mudança de página), usar eles
      const paginationParams = {
        page: params.page !== undefined ? params.page : currentPage,
        limit: params.limit !== undefined ? params.limit : itemsPerPage,
        ...params
      };

      const result = await UnidadesEscolaresService.listar(paginationParams);
      if (result.success) {
        setUnidades(result.data);
        
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages || 1);
          setTotalItems(result.pagination.total || result.pagination.totalItems || result.data.length);
          setCurrentPage(result.pagination.page || result.pagination.currentPage || 1);
        } else {
          setTotalItems(result.data.length);
          setTotalPages(Math.ceil(result.data.length / itemsPerPage));
        }
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar unidades escolares:', error);
      toast.error('Erro ao carregar unidades escolares');
    } finally {
      setLoading(false);
    }
  };

  // Carregar estatísticas
  const loadEstatisticas = async () => {
    try {
      const result = await UnidadesEscolaresService.buscarEstatisticas();
      if (result.success) {
        setEstatisticas(result.data || {
          total_unidades: 0,
          unidades_ativas: 0,
          total_estados: 0,
          total_cidades: 0
        });
      } else {
        console.error('Erro ao carregar estatísticas:', result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  // Carregar rotas
  const loadRotas = async () => {
    try {
      setLoadingRotas(true);
      const result = await RotasService.buscarAtivas();
      if (result.success) {
        setRotas(result.data || []);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar rotas:', error);
      setRotas([]);
      toast.error('Erro ao carregar rotas');
    } finally {
      setLoadingRotas(false);
    }
  };

  // Carregar filiais
  const loadFiliais = async () => {
    try {
      setLoadingFiliais(true);
      const result = await FiliaisService.buscarAtivas();
      if (result.success) {
        setFiliais(result.data || []);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
      setFiliais([]);
      toast.error('Erro ao carregar filiais');
    } finally {
      setLoadingFiliais(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadUnidades();
    loadRotas();
    loadFiliais();
    loadEstatisticas();
  }, []); // Só executa uma vez na montagem

  // Carregar dados quando dependências mudarem (apenas para outras funções)
  useEffect(() => {
    // Não chamar loadUnidades aqui, pois pode sobrescrever mudanças manuais
    loadRotas();
    loadFiliais();
    loadEstatisticas();
  }, [currentPage, itemsPerPage]);

  // Filtrar unidades escolares
  const filteredUnidades = unidades.filter(unidade => {
    const matchesSearch = !searchTerm || 
      (unidade.codigo_teknisa && unidade.codigo_teknisa.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (unidade.nome_escola && unidade.nome_escola.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (unidade.cidade && unidade.cidade.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (unidade.estado && unidade.estado.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (unidade.id && unidade.id.toString().includes(searchTerm));
    
    const matchesStatus = statusFilter === 'todos' || unidade.status === statusFilter;
    const matchesRota = rotaFilter === 'todos' || unidade.rota_id?.toString() === rotaFilter;
    
    return matchesSearch && matchesStatus && matchesRota;
  });

  // Funções de CRUD
  const onSubmit = async (data) => {
    try {
      let result;
      if (editingUnidade) {
        result = await UnidadesEscolaresService.atualizar(editingUnidade.id, data);
      } else {
        result = await UnidadesEscolaresService.criar(data);
      }
      
      if (result.success) {
        toast.success(result.message);
        handleCloseModal();
        reloadData();
      } else {
        // Usar sistema universal de validação
        if (handleApiResponse(result)) {
          return; // Erros de validação tratados pelo hook
        } else {
          toast.error(result.error);
        }
      }
    } catch (error) {
      console.error('Erro ao salvar unidade escolar:', error);
      toast.error('Erro ao salvar unidade escolar');
    }
  };

  const handleDeleteUnidade = (unidade) => {
    setUnidadeToDelete(unidade);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!unidadeToDelete) return;

    try {
      const result = await UnidadesEscolaresService.excluir(unidadeToDelete.id);
      
      if (result.success) {
        toast.success(result.message);
        reloadData();
        setShowDeleteConfirmModal(false);
        setUnidadeToDelete(null);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao excluir unidade escolar:', error);
      toast.error('Erro ao excluir unidade escolar');
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteConfirmModal(false);
    setUnidadeToDelete(null);
  };

  // Funções de modal
  const handleAddUnidade = () => {
    setEditingUnidade(null);
    setViewMode(false);
    setShowModal(true);
  };

  const handleViewUnidade = (unidade) => {
    setEditingUnidade(unidade);
    setViewMode(true);
    setShowModal(true);
  };

  const handleEditUnidade = (unidade) => {
    setEditingUnidade(unidade);
    setViewMode(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUnidade(null);
    setViewMode(false);
  };

  // Função para recarregar dados
  const reloadData = () => {
    loadUnidades();
    loadEstatisticas();
  };

  // Funções de paginação
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Recarregar dados da nova página
    loadUnidades({ page });
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    // Recarregar dados com o novo limite de itens
    loadUnidades({ page: 1, limit: newItemsPerPage });
  };

  // Funções utilitárias
  const getRotaName = (rotaId) => {
    if (!rotaId) return 'N/A';
    const rota = rotas.find(r => r.id === parseInt(rotaId));
    return rota ? rota.nome : 'Rota não encontrada';
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  return {
    // Estados
    unidades: filteredUnidades,
    rotas,
    filiais,
    loading,
    loadingRotas,
    loadingFiliais,
    showModal,
    viewMode,
    editingUnidade,
    searchTerm,
    statusFilter,
    rotaFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,

    // Estados de validação (do hook universal)
    validationErrors,
    showValidationModal,

    // Funções CRUD
    onSubmit,
    handleDeleteUnidade,
    handleConfirmDelete,
    handleCloseDeleteModal,
    reloadData,

    // Funções de modal
    handleAddUnidade,
    handleViewUnidade,
    handleEditUnidade,
    handleCloseModal,

    // Funções de validação (do hook universal)
    handleCloseValidationModal,

    // Estados para modal de confirmação
    showDeleteConfirmModal,
    unidadeToDelete,

    // Funções de paginação
    handlePageChange,
    handleItemsPerPageChange,

    // Funções de filtros
    setSearchTerm,
    setStatusFilter,
    setRotaFilter,

    // Funções utilitárias
    getRotaName,
    formatCurrency
  };
};
