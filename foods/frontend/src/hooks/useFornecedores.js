import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import FornecedoresService from '../services/fornecedores';
import { useValidation } from './useValidation';
import { useExport } from './useExport';

export const useFornecedores = () => {
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditFilters, setAuditFilters] = useState({
    dataInicio: '',
    dataFim: '',
    acao: '',
    usuario_id: '',
    periodo: ''
  });
  const [searching, setSearching] = useState(false);
  const [estatisticas, setEstatisticas] = useState({
    total_fornecedores: 0,
    fornecedores_ativos: 0,
    com_email: 0,
    com_telefone: 0
  });

  // Estados para modal de confirmação
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [fornecedorToDelete, setFornecedorToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Hook de validação
  const {
    validationErrors,
    showValidationModal,
    handleApiResponse,
    handleCloseValidationModal,
    clearValidationErrors
  } = useValidation();

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      // Resetar para primeira página quando buscar
      if (searchTerm !== debouncedSearchTerm) {
        setCurrentPage(1);
      }
    }, 500); // 500ms de delay

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearchTerm]);

  // Mostrar loading quando buscar
  useEffect(() => {
    if (searchTerm && searchTerm !== debouncedSearchTerm) {
      setSearching(true);
    } else {
      setSearching(false);
    }
  }, [searchTerm, debouncedSearchTerm]);

  useEffect(() => {
    loadFornecedores();
    loadEstatisticas();
  }, [currentPage, itemsPerPage, debouncedSearchTerm]);

  const loadFornecedores = async (params = {}) => {
    setLoading(true);
    try {
      // Parâmetros de paginação e busca
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm, // Usar termo de busca com debounce
        ...params
      };

      const result = await FornecedoresService.listar(paginationParams);
      if (result.success) {
        setFornecedores(result.data || []);
        setTotalPages(result.pagination?.totalPages || 1);
        setTotalItems(result.pagination?.totalItems || result.data?.length || 0);
      } else {
        toast.error(result.error || 'Erro ao carregar fornecedores');
      }
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
      toast.error('Erro ao carregar fornecedores');
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  const loadEstatisticas = async () => {
    try {
      const result = await FornecedoresService.buscarEstatisticas();
      if (result.success) {
        setEstatisticas(result.data || {
          total_fornecedores: 0,
          fornecedores_ativos: 0,
          com_email: 0,
          com_telefone: 0
        });
      } else {
        console.error('Erro ao carregar estatísticas:', result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  // Função para recarregar dados
  const reloadData = () => {
    loadFornecedores();
    loadEstatisticas();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Resetar para primeira página
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleOpenModal = (fornecedor = null, isView = false) => {
    setEditingFornecedor(fornecedor);
    setViewMode(isView);
    setShowModal(true);
    
    if (fornecedor) {
      reset(fornecedor);
    } else {
      reset({
        razao_social: '',
        nome_fantasia: '',
        cnpj: '',
        email: '',
        telefone: '',
        cep: '',
        logradouro: '',
        numero: '',
        bairro: '',
        municipio: '',
        uf: '',
        status: 1
      });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFornecedor(null);
    setViewMode(false);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      clearValidationErrors(); // Limpar erros anteriores
      
      let result;
      
      if (editingFornecedor) {
        result = await FornecedoresService.atualizar(editingFornecedor.id, data);
      } else {
        result = await FornecedoresService.criar(data);
      }

      if (result.success) {
        toast.success(editingFornecedor ? 'Fornecedor atualizado com sucesso!' : 'Fornecedor criado com sucesso!');
        handleCloseModal();
        reloadData();
      } else {
        if (handleApiResponse(result)) {
          return; // Erros de validação foram tratados
        }
        toast.error(result.message || 'Erro ao salvar fornecedor');
      }
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error);
      toast.error('Erro ao salvar fornecedor');
    }
  };

  const handleDeleteFornecedor = (fornecedor) => {
    setFornecedorToDelete(fornecedor);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!fornecedorToDelete) return;

    try {
      const result = await FornecedoresService.excluir(fornecedorToDelete.id);
      if (result.success) {
        toast.success('Fornecedor excluído com sucesso!');
        reloadData();
        setShowDeleteConfirmModal(false);
        setFornecedorToDelete(null);
      } else {
        toast.error(result.message || 'Erro ao excluir fornecedor');
      }
    } catch (error) {
      console.error('Erro ao excluir fornecedor:', error);
      toast.error('Erro ao excluir fornecedor');
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteConfirmModal(false);
    setFornecedorToDelete(null);
  };

  const handleViewAudit = (fornecedorId) => {
    setSelectedFornecedorId(fornecedorId);
    setShowAuditModal(true);
  };

  const handleAuditFilterChange = (newFilters) => {
    setAuditFilters(newFilters);
    loadAuditLogs(selectedFornecedorId, newFilters);
  };

  const handleCloseAuditModal = () => {
    setShowAuditModal(false);
    setSelectedFornecedorId(null);
    setAuditLogs([]);
  };

  const { handleExportXLSX: exportXLSX, handleExportPDF: exportPDF } = useExport(FornecedoresService);

  const handleExportXLSX = async () => {
    const params = {
      search: debouncedSearchTerm,
      page: currentPage,
      limit: itemsPerPage
    };
    await exportXLSX(params);
  };

  const handleExportPDF = async () => {
    const params = {
      search: debouncedSearchTerm,
      page: currentPage,
      limit: itemsPerPage
    };
    await exportPDF(params);
  };

  return {
    // Estados
    fornecedores: Array.isArray(fornecedores) ? fornecedores : [],
    loading,
    showModal,
    viewMode,
    editingFornecedor,
    showAuditModal,
    auditLogs,
    auditLoading,
    auditFilters,
    searching,
    estatisticas,
    searchTerm,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    errors,

    // Estados de validação
    validationErrors,
    showValidationModal,
    handleCloseValidationModal,

    // Estados para modal de confirmação
    showDeleteConfirmModal,
    fornecedorToDelete,

    // Funções
    register,
    handleSubmit,
    reset,
    loadFornecedores,
    reloadData,
    handlePageChange,
    handleItemsPerPageChange,
    handleSearch,
    handleOpenModal,
    handleCloseModal,
    onSubmit,
    handleDeleteFornecedor,
    handleConfirmDelete,
    handleCloseDeleteModal,
    handleViewAudit,
    handleAuditFilterChange,
    handleCloseAuditModal,
    handleExportXLSX,
    handleExportPDF
  };
};
