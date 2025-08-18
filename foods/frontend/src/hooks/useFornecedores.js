import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import FornecedoresService from '../services/fornecedores';
import { useValidation } from './useValidation';

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
  const [searchTerm, setSearchTerm] = useState('');
  
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

  useEffect(() => {
    loadFornecedores();
    loadEstatisticas();
  }, [currentPage, itemsPerPage, searchTerm]);

  const loadFornecedores = async (params = {}) => {
    setLoading(true);
    try {
      // Parâmetros de paginação e busca
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm, // Usar termo de busca diretamente
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
    setCurrentPage(1); // Resetar para primeira página ao buscar
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setCurrentPage(1);
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

  const handleDeleteFornecedor = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este fornecedor?')) {
      return;
    }

    try {
      const result = await FornecedoresService.excluir(id);
      if (result.success) {
        toast.success('Fornecedor excluído com sucesso!');
        reloadData();
      } else {
        toast.error(result.message || 'Erro ao excluir fornecedor');
      }
    } catch (error) {
      console.error('Erro ao excluir fornecedor:', error);
      toast.error('Erro ao excluir fornecedor');
    }
  };

  const handleViewAudit = async (fornecedorId) => {
    setShowAuditModal(true);
    setAuditLoading(true);
    
    try {
      const result = await FornecedoresService.buscarAuditoria(fornecedorId, auditFilters);
      if (result.success) {
        setAuditLogs(result.data || []);
      } else {
        toast.error(result.message || 'Erro ao carregar auditoria');
      }
    } catch (error) {
      console.error('Erro ao carregar auditoria:', error);
      toast.error('Erro ao carregar auditoria');
    } finally {
      setAuditLoading(false);
    }
  };

  const handleAuditFilterChange = (newFilters) => {
    setAuditFilters(newFilters);
  };

  const handleCloseAuditModal = () => {
    setShowAuditModal(false);
    setAuditLogs([]);
    setAuditFilters({
      dataInicio: '',
      dataFim: '',
      acao: '',
      usuario_id: '',
      periodo: ''
    });
  };

  const handleExport = async (format) => {
    try {
      const params = {
        search: searchTerm,
        page: currentPage,
        limit: itemsPerPage
      };

      const result = await FornecedoresService.exportar(format, params);
      if (result.success) {
        toast.success(`Exportação ${format.toUpperCase()} realizada com sucesso!`);
      } else {
        toast.error(result.message || `Erro ao exportar ${format.toUpperCase()}`);
      }
    } catch (error) {
      console.error(`Erro ao exportar ${format}:`, error);
      toast.error(`Erro ao exportar ${format.toUpperCase()}`);
    }
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

    // Funções
    register,
    handleSubmit,
    reset,
    loadFornecedores,
    reloadData,
    handlePageChange,
    handleItemsPerPageChange,
    handleSearch,
    handleClearFilters,
    handleOpenModal,
    handleCloseModal,
    onSubmit,
    handleDeleteFornecedor,
    handleViewAudit,
    handleAuditFilterChange,
    handleCloseAuditModal,
    handleExport
  };
};
