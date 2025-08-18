import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import MarcasService from '../services/marcas';
import { useValidation } from './useValidation';

export const useMarcas = () => {
  // Hook de validação universal
  const {
    validationErrors,
    showValidationModal,
    handleApiResponse,
    handleCloseValidationModal,
    clearValidationErrors
  } = useValidation();

  // Estados principais
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingMarca, setEditingMarca] = useState(null);

  // Estados de filtros e paginação
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Estados de estatísticas
  const [estatisticas, setEstatisticas] = useState({
    total_marcas: 0,
    marcas_ativas: 0,
    marcas_inativas: 0
  });

  // Carregar marcas
  const loadMarcas = async (params = {}) => {
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

      const result = await MarcasService.listar(paginationParams);
      if (result.success) {
        // Garantir que data seja um array
        const data = Array.isArray(result.data) ? result.data : [];
        setMarcas(data);
        
        // Extrair informações de paginação
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages || 1);
          setTotalItems(result.pagination.totalItems || data.length);
          setCurrentPage(result.pagination.currentPage || 1);
        } else {
          // Fallback se não houver paginação no backend
          setTotalItems(data.length);
          setTotalPages(Math.ceil(data.length / itemsPerPage));
        }
        
        // Calcular estatísticas básicas
        const total = result.pagination?.totalItems || data.length;
        const ativas = data.filter(m => m.status === 1).length;
        const inativas = data.filter(m => m.status === 0).length;
        
        setEstatisticas({
          total_marcas: total,
          marcas_ativas: ativas,
          marcas_inativas: inativas
        });
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao carregar marcas');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando dependências mudarem
  useEffect(() => {
    loadMarcas();
  }, [currentPage, itemsPerPage, searchTerm, statusFilter]);

  // Funções de CRUD
  const onSubmit = async (data) => {
    try {
      // Limpar campos vazios para evitar problemas de validação
      const cleanData = {
        ...data,
        marca: data.marca && data.marca.trim() !== '' ? data.marca.trim() : null,
        fabricante: data.fabricante && data.fabricante.trim() !== '' ? data.fabricante.trim() : null
      };

      let result;
      if (editingMarca) {
        result = await MarcasService.atualizar(editingMarca.id, cleanData);
      } else {
        result = await MarcasService.criar(cleanData);
      }
      
      // Verificar se há erros de validação
      if (handleApiResponse(result)) {
        return; // Se há erros de validação, não continua
      }
      
      if (result.success) {
        toast.success(editingMarca ? 'Marca atualizada com sucesso!' : 'Marca criada com sucesso!');
        handleCloseModal();
        loadMarcas();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao salvar marca');
    }
  };

  const handleDeleteMarca = async (marcaId) => {
    if (window.confirm('Tem certeza que deseja excluir esta marca?')) {
      try {
        const result = await MarcasService.excluir(marcaId);
        if (result.success) {
          toast.success('Marca excluída com sucesso!');
          loadMarcas();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error('Erro ao excluir marca');
      }
    }
  };

  // Funções de modal
  const handleAddMarca = () => {
    setViewMode(false);
    setEditingMarca(null);
    setShowModal(true);
  };

  const handleViewMarca = (marca) => {
    setViewMode(true);
    setEditingMarca(marca);
    setShowModal(true);
  };

  const handleEditMarca = (marca) => {
    setViewMode(false);
    setEditingMarca(marca);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setViewMode(false);
    setEditingMarca(null);
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
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusLabel = (status) => {
    return status === 1 ? 'Ativo' : 'Inativo';
  };

  return {
    // Estados
    marcas,
    loading,
    showModal,
    viewMode,
    editingMarca,
    searchTerm,
    statusFilter,
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
    handleDeleteMarca,

    // Funções de modal
    handleAddMarca,
    handleViewMarca,
    handleEditMarca,
    handleCloseModal,

    // Funções de validação (do hook universal)
    handleCloseValidationModal,

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
