import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import RotasService from '../services/rotas';
import api from '../services/api';

export const useRotas = () => {
  // Estados principais
  const [rotas, setRotas] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRota, setEditingRota] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [filialFilter, setFilialFilter] = useState('todos');
  const [unidadesEscolares, setUnidadesEscolares] = useState([]);
  const [loadingUnidades, setLoadingUnidades] = useState(false);
  const [showUnidades, setShowUnidades] = useState(false);
  const [totalUnidades, setTotalUnidades] = useState(0);
  const [loadingFiliais, setLoadingFiliais] = useState(false);

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Estados de estatísticas
  const [estatisticas, setEstatisticas] = useState({
    total_rotas: 0,
    rotas_ativas: 0,
    rotas_inativas: 0,
    rotas_semanais: 0,
    rotas_quinzenais: 0,
    rotas_mensais: 0,
    rotas_transferencia: 0,
    distancia_total: 0,
    custo_total_diario: 0
  });

  // Carregar rotas
  const loadRotas = async () => {
    try {
      setLoading(true);
      
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage
      };

      const result = await RotasService.listar(paginationParams);
      if (result.success) {
        setRotas(result.data || []);
        
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages || 1);
          setTotalItems(result.pagination.totalItems || result.data.length);
          setCurrentPage(result.pagination.currentPage || 1);
        } else {
          setTotalItems(result.data.length);
          setTotalPages(Math.ceil(result.data.length / itemsPerPage));
        }
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar rotas:', error);
      toast.error('Erro ao carregar rotas');
    } finally {
      setLoading(false);
    }
  };

  // Carregar filiais
  const loadFiliais = async () => {
    try {
      setLoadingFiliais(true);
      const response = await api.get('/filiais');
      setFiliais(response.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
      setFiliais([]);
      toast.error('Erro ao carregar filiais');
    } finally {
      setLoadingFiliais(false);
    }
  };

  // Carregar estatísticas
  const loadEstatisticas = async () => {
    try {
      const result = await RotasService.buscarEstatisticas();
      if (result.success) {
        const stats = result.data || {};
        setEstatisticas({
          total_rotas: parseInt(stats.total_rotas) || 0,
          rotas_ativas: parseInt(stats.rotas_ativas) || 0,
          rotas_inativas: parseInt(stats.rotas_inativas) || 0,
          rotas_semanais: parseInt(stats.rotas_semanais) || 0,
          rotas_quinzenais: parseInt(stats.rotas_quinzenais) || 0,
          rotas_mensais: parseInt(stats.rotas_mensais) || 0,
          rotas_transferencia: parseInt(stats.rotas_transferencia) || 0,
          distancia_total: parseFloat(stats.distancia_total) || 0,
          custo_total_diario: parseFloat(stats.custo_total_diario) || 0
        });
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setEstatisticas({
        total_rotas: 0,
        rotas_ativas: 0,
        rotas_inativas: 0,
        rotas_semanais: 0,
        rotas_quinzenais: 0,
        rotas_mensais: 0,
        rotas_transferencia: 0,
        distancia_total: 0,
        custo_total_diario: 0
      });
    }
  };

  // Carregar total de unidades escolares
  const loadTotalUnidades = async (rotaId) => {
    try {
      const result = await RotasService.buscarUnidadesEscolares(rotaId);
      if (result.success) {
        setTotalUnidades(result.data.total || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar total de unidades escolares:', error);
      setTotalUnidades(0);
    }
  };

  // Carregar unidades escolares
  const loadUnidadesEscolares = async (rotaId) => {
    try {
      setLoadingUnidades(true);
      const result = await RotasService.buscarUnidadesEscolares(rotaId);
      if (result.success) {
        setUnidadesEscolares(result.data.unidades || []);
        setTotalUnidades(result.data.total || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar unidades escolares:', error);
      setUnidadesEscolares([]);
      setTotalUnidades(0);
    } finally {
      setLoadingUnidades(false);
    }
  };

  // Carregar dados quando dependências mudarem
  useEffect(() => {
    loadRotas();
    loadFiliais();
    loadEstatisticas();
  }, [currentPage, itemsPerPage]);

  // Filtrar rotas
  const filteredRotas = rotas.filter(rota => {
    const matchesSearch = !searchTerm || 
      (rota.codigo && rota.codigo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (rota.nome && rota.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (rota.id && rota.id.toString().includes(searchTerm));
    
    const matchesStatus = statusFilter === 'todos' || rota.status === statusFilter;
    const matchesFilial = filialFilter === 'todos' || rota.filial_id.toString() === filialFilter;
    
    return matchesSearch && matchesStatus && matchesFilial;
  });

  // Funções de CRUD
  const onSubmit = async (data) => {
    try {
      let result;
      if (editingRota) {
        result = await RotasService.atualizar(editingRota.id, data);
      } else {
        result = await RotasService.criar(data);
      }
      
      if (result.success) {
        toast.success(result.message);
        handleCloseModal();
        loadRotas();
        loadEstatisticas();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao salvar rota:', error);
      toast.error('Erro ao salvar rota');
    }
  };

  const handleDeleteRota = async (rotaId) => {
    if (window.confirm('Tem certeza que deseja excluir esta rota?')) {
      try {
        const result = await RotasService.excluir(rotaId);
        if (result.success) {
          toast.success(result.message);
          loadRotas();
          loadEstatisticas();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        console.error('Erro ao excluir rota:', error);
        toast.error('Erro ao excluir rota');
      }
    }
  };

  // Funções de modal
  const handleAddRota = () => {
    setEditingRota(null);
    setViewMode(false);
    setShowModal(true);
    setShowUnidades(false);
    setUnidadesEscolares([]);
    setTotalUnidades(0);
  };

  const handleViewRota = (rota) => {
    setEditingRota(rota);
    setViewMode(true);
    setShowModal(true);
    setShowUnidades(false);
    setUnidadesEscolares([]);
    setTotalUnidades(0);
    loadTotalUnidades(rota.id);
  };

  const handleEditRota = (rota) => {
    setEditingRota(rota);
    setViewMode(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRota(null);
    setViewMode(false);
    setShowUnidades(false);
    setUnidadesEscolares([]);
    setTotalUnidades(0);
  };

  // Funções de paginação
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Funções de unidades escolares
  const toggleUnidades = () => {
    if (!showUnidades && unidadesEscolares.length === 0 && editingRota) {
      loadUnidadesEscolares(editingRota.id);
    }
    setShowUnidades(!showUnidades);
  };

  // Funções utilitárias
  const getFilialName = (filialId) => {
    if (!filialId) return 'N/A';
    const filial = filiais.find(f => f.id === parseInt(filialId));
    return filial ? filial.filial : 'Filial não encontrada';
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatTipoRota = (tipo) => {
    const tipos = {
      'semanal': 'Semanal',
      'quinzenal': 'Quinzenal',
      'mensal': 'Mensal',
      'transferencia': 'Transferência'
    };
    return tipos[tipo] || tipo;
  };

  return {
    // Estados
    rotas: filteredRotas,
    filiais,
    loading,
    loadingFiliais,
    showModal,
    viewMode,
    editingRota,
    searchTerm,
    statusFilter,
    filialFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    unidadesEscolares,
    loadingUnidades,
    showUnidades,
    totalUnidades,

    // Funções CRUD
    onSubmit,
    handleDeleteRota,

    // Funções de modal
    handleAddRota,
    handleViewRota,
    handleEditRota,
    handleCloseModal,

    // Funções de paginação
    handlePageChange,
    handleItemsPerPageChange,

    // Funções de filtros
    setSearchTerm,
    setStatusFilter,
    setFilialFilter,

    // Funções de unidades escolares
    toggleUnidades,

    // Funções utilitárias
    getFilialName,
    formatCurrency,
    formatTipoRota
  };
};
