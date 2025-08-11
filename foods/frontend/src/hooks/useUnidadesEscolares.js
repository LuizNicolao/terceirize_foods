import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import UnidadesEscolaresService from '../services/unidadesEscolares';
import RotasService from '../services/rotas';
import api from '../services/api';

export const useUnidadesEscolares = () => {
  // Estados principais
  const [unidades, setUnidades] = useState([]);
  const [rotas, setRotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRotas, setLoadingRotas] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingUnidade, setEditingUnidade] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [rotaFilter, setRotaFilter] = useState('todos');

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
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        ...params
      };

      const result = await UnidadesEscolaresService.listar(paginationParams);
      if (result.success) {
        setUnidades(result.data);
        
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
        const ativas = result.data.filter(u => u.status === 'ativo').length;
        const estados = new Set(result.data.map(u => u.estado)).size;
        const cidades = new Set(result.data.map(u => u.cidade)).size;
        
        setEstatisticas({
          total_unidades: total,
          unidades_ativas: ativas,
          total_estados: estados,
          total_cidades: cidades
        });
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

  // Carregar dados quando dependências mudarem
  useEffect(() => {
    loadUnidades();
    loadRotas();
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
        loadUnidades();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao salvar unidade escolar:', error);
      toast.error('Erro ao salvar unidade escolar');
    }
  };

  const handleDeleteUnidade = async (unidadeId) => {
    if (window.confirm('Tem certeza que deseja excluir esta unidade escolar?')) {
      try {
        const result = await UnidadesEscolaresService.excluir(unidadeId);
        if (result.success) {
          toast.success(result.message);
          loadUnidades();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        console.error('Erro ao excluir unidade escolar:', error);
        toast.error('Erro ao excluir unidade escolar');
      }
    }
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

  // Funções de paginação
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
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
    loading,
    loadingRotas,
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
