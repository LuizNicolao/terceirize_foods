import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import RotasService from '../services/rotas';
import api from '../services/api';
import { useValidation } from './useValidation';

export const useRotas = () => {
  // Hook de validação universal
  const {
    validationErrors,
    showValidationModal,
    handleApiResponse,
    handleCloseValidationModal,
    clearValidationErrors
  } = useValidation();

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
    }
  };

  // Carregar unidades escolares
  const loadUnidadesEscolares = async (rotaId) => {
    try {
      setLoadingUnidades(true);
      const result = await RotasService.buscarUnidadesEscolares(rotaId);
      if (result.success) {
        setUnidadesEscolares(result.data || []);
        setTotalUnidades(result.data?.length || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar unidades escolares:', error);
      setUnidadesEscolares([]);
    } finally {
      setLoadingUnidades(false);
    }
  };

  // Carregar dados quando dependências mudarem
  useEffect(() => {
    loadRotas();
  }, [currentPage, itemsPerPage]);

  // Carregar filiais e estatísticas apenas uma vez
  useEffect(() => {
    loadFiliais();
    loadEstatisticas();
  }, []);

  // Função de submissão com validação universal
  const onSubmit = async (data) => {
    try {
      let response;
      if (editingRota) {
        response = await RotasService.atualizar(editingRota.id, data);
        if (response.success) {
          toast.success('Rota atualizada com sucesso');
        } else {
          // Debug: verificar se há erros de validação
          console.log('Resposta de erro (atualizar):', response);
          
          // Usar sistema universal de validação
          if (handleApiResponse(response)) {
            return; // Erros de validação tratados pelo hook
          } else {
            toast.error(response.error);
          }
          return;
        }
      } else {
        response = await RotasService.criar(data);
        if (response.success) {
          toast.success('Rota criada com sucesso');
        } else {
          // Debug: verificar se há erros de validação
          console.log('Resposta de erro (criar):', response);
          
          // Usar sistema universal de validação
          if (handleApiResponse(response)) {
            return; // Erros de validação tratados pelo hook
          } else {
            toast.error(response.error);
          }
          return;
        }
      }
      
      handleCloseModal();
      loadRotas();
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
    // Estados principais
    rotas,
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

    // Estados de validação (do hook universal)
    validationErrors,
    showValidationModal,

    // Funções
    onSubmit,
    handleDeleteRota,
    handleAddRota,
    handleViewRota,
    handleEditRota,
    handleCloseModal,
    handlePageChange,
    handleItemsPerPageChange,
    setSearchTerm,
    setStatusFilter,
    setFilialFilter,
    toggleUnidades,
    getFilialName,
    formatCurrency,
    formatTipoRota,

    // Funções de validação (do hook universal)
    handleCloseValidationModal
  };
};
