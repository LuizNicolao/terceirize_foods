import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import VeiculosService from '../services/veiculos';
import { useValidation } from './useValidation';

export const useVeiculos = () => {
  // Hook de validação universal
  const {
    validationErrors,
    showValidationModal,
    handleApiResponse,
    handleCloseValidationModal,
    clearValidationErrors
  } = useValidation();

  // Estados principais
  const [veiculos, setVeiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingVeiculo, setEditingVeiculo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [tipoFilter, setTipoFilter] = useState('todos');

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Estados para modal de confirmação
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [veiculoToDelete, setVeiculoToDelete] = useState(null);

  // Estados de estatísticas
  const [estatisticas, setEstatisticas] = useState({
    total_veiculos: 0,
    veiculos_ativos: 0,
    em_manutencao: 0,
    total_tipos: 0
  });

  // Carregar veículos
  const loadVeiculos = async (params = {}) => {
    setLoading(true);
    try {
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        ...params
      };

      const result = await VeiculosService.listar(paginationParams);
      if (result.success) {
        setVeiculos(result.data);
        
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
        const ativos = result.data.filter(v => v.status === 'ativo').length;
        const manutencao = result.data.filter(v => v.status === 'manutencao').length;
        const tipos = new Set(result.data.map(v => v.tipo_veiculo)).size;
        
        setEstatisticas({
          total_veiculos: total,
          veiculos_ativos: ativos,
          em_manutencao: manutencao,
          total_tipos: tipos
        });
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
      toast.error('Erro ao carregar veículos');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando dependências mudarem
  useEffect(() => {
    loadVeiculos();
  }, [currentPage, itemsPerPage]);

  // Filtrar veículos
  const filteredVeiculos = veiculos.filter(veiculo => {
    const matchesSearch = !searchTerm || 
      (veiculo.placa && veiculo.placa.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (veiculo.modelo && veiculo.modelo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (veiculo.marca && veiculo.marca.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (veiculo.chassi && veiculo.chassi.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (veiculo.id && veiculo.id.toString().includes(searchTerm));
    
    const matchesStatus = statusFilter === 'todos' || veiculo.status === statusFilter;
    const matchesTipo = tipoFilter === 'todos' || veiculo.tipo_veiculo === tipoFilter;
    
    return matchesSearch && matchesStatus && matchesTipo;
  });

  // Funções de CRUD
  const onSubmit = async (data) => {
    try {
      let result;
      if (editingVeiculo) {
        result = await VeiculosService.atualizar(editingVeiculo.id, data);
      } else {
        result = await VeiculosService.criar(data);
      }
      
      if (result.success) {
        toast.success(result.message);
        handleCloseModal();
        loadVeiculos();
      } else {
        // Usar sistema universal de validação
        if (handleApiResponse(result)) {
          return; // Erros de validação tratados pelo hook
        } else {
          toast.error(result.error);
        }
      }
    } catch (error) {
      console.error('Erro ao salvar veículo:', error);
      toast.error('Erro ao salvar veículo');
    }
  };

  const handleDeleteVeiculo = (veiculo) => {
    setVeiculoToDelete(veiculo);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!veiculoToDelete) return;

    try {
      const result = await VeiculosService.excluir(veiculoToDelete.id);
      if (result.success) {
        toast.success(result.message);
        loadVeiculos();
        setShowDeleteConfirmModal(false);
        setVeiculoToDelete(null);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao excluir veículo:', error);
      toast.error('Erro ao excluir veículo');
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteConfirmModal(false);
    setVeiculoToDelete(null);
  };

  // Funções de modal
  const handleAddVeiculo = () => {
    setEditingVeiculo(null);
    setViewMode(false);
    setShowModal(true);
  };

  const handleViewVeiculo = (veiculo) => {
    setEditingVeiculo(veiculo);
    setViewMode(true);
    setShowModal(true);
  };

  const handleEditVeiculo = (veiculo) => {
    setEditingVeiculo(veiculo);
    setViewMode(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingVeiculo(null);
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
  const getStatusLabel = (status) => {
    const statusLabels = {
      'ativo': 'Ativo',
      'inativo': 'Inativo',
      'manutencao': 'Em Manutenção',
      'aposentado': 'Aposentado'
    };
    return statusLabels[status] || status;
  };

  const getTipoVeiculoLabel = (tipo) => {
    const tipoLabels = {
      'caminhao': 'Caminhão',
      'van': 'Van',
      'carro': 'Carro',
      'moto': 'Moto',
      'utilitario': 'Utilitário'
    };
    return tipoLabels[tipo] || tipo;
  };

  const getCategoriaLabel = (categoria) => {
    const categoriaLabels = {
      'leve': 'Leve',
      'medio': 'Médio',
      'pesado': 'Pesado'
    };
    return categoriaLabels[categoria] || categoria;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  return {
    // Estados
    veiculos: filteredVeiculos,
    loading,
    showModal,
    viewMode,
    editingVeiculo,
    searchTerm,
    statusFilter,
    tipoFilter,
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
    handleDeleteVeiculo,
    handleConfirmDelete,
    handleCloseDeleteModal,

    // Funções de modal
    handleAddVeiculo,
    handleViewVeiculo,
    handleEditVeiculo,
    handleCloseModal,

    // Funções de validação (do hook universal)
    handleCloseValidationModal,

    // Estados para modal de confirmação
    showDeleteConfirmModal,
    veiculoToDelete,

    // Funções de paginação
    handlePageChange,
    handleItemsPerPageChange,

    // Funções de filtros
    setSearchTerm,
    setStatusFilter,
    setTipoFilter,

    // Funções utilitárias
    getStatusLabel,
    getTipoVeiculoLabel,
    getCategoriaLabel,
    formatCurrency
  };
};
