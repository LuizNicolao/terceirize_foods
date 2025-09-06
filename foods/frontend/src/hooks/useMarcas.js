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

  // Estados para modal de confirmação
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [marcaToDelete, setMarcaToDelete] = useState(null);

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
  }, [currentPage, itemsPerPage]);

  // Filtrar marcas (client-side)
  const filteredMarcas = (Array.isArray(marcas) ? marcas : []).filter(marca => {
    const matchesSearch = !searchTerm || 
      (marca.marca && marca.marca.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (marca.fabricante && marca.fabricante.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'todos' || 
      (statusFilter === 'ativo' && marca.status === 1) ||
      (statusFilter === 'inativo' && marca.status === 0);
    
    return matchesSearch && matchesStatus;
  });

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

  const handleDeleteMarca = (marca) => {
    setMarcaToDelete(marca);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!marcaToDelete) return;

    try {
      const result = await MarcasService.excluir(marcaToDelete.id);
      if (result.success) {
        toast.success('Marca excluída com sucesso!');
        loadMarcas();
        setShowDeleteConfirmModal(false);
        setMarcaToDelete(null);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao excluir marca');
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteConfirmModal(false);
    setMarcaToDelete(null);
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
    marcas: Array.isArray(filteredMarcas) ? filteredMarcas : [],
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

    // Estados para modal de confirmação
    showDeleteConfirmModal,
    marcaToDelete,

    // Funções CRUD
    onSubmit,
    handleDeleteMarca,
    handleConfirmDelete,
    handleCloseDeleteModal,

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

    // Funções utilitárias
    formatDate,
    getStatusLabel
  };
};
