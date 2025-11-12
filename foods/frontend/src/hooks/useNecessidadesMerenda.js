import { useState, useEffect, useCallback } from 'react';
import { useValidation } from './common/useValidation';
import { useExport } from './common/useExport';
import { useDebouncedSearch } from './common/useDebouncedSearch';
import useTableSort from './common/useTableSort';
import NecessidadesMerendaService from '../services/necessidadesMerenda';
import toast from 'react-hot-toast';

export const useNecessidadesMerenda = () => {
  // Hook de busca com debounce
  const debouncedSearch = useDebouncedSearch(500);

  // Estados principais
  const [necessidades, setNecessidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingNecessidade, setEditingNecessidade] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [estatisticas, setEstatisticas] = useState({
    total_necessidades: 0,
    necessidades_pendentes: 0,
    necessidades_aprovadas: 0,
    necessidades_rejeitadas: 0,
    necessidades_ativas: 0
  });

  // Estados de paginação e filtros
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Hook de ordenação híbrida
  const {
    sortedData: necessidadesOrdenadas,
    sortField,
    sortDirection,
    handleSort,
    isSortingLocally
  } = useTableSort({
    data: necessidades,
    threshold: 100,
    totalItems: totalItems
  });
  const [filtros, setFiltros] = useState({
    status: '',
    unidade_escolar_id: '',
    data_inicio: '',
    data_fim: ''
  });

  // Estados para modais de confirmação
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [necessidadeToDelete, setNecessidadeToDelete] = useState(null);

  // Hook de validação
  const {
    validationErrors,
    showValidationModal,
    handleApiResponse,
    handleCloseValidationModal,
    clearValidationErrors
  } = useValidation();

  // Hook de exportação
  const { handleExportXLSX, handleExportPDF } = useExport(NecessidadesMerendaService);

  // Carregar necessidades
  const loadNecessidades = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch.debouncedSearchTerm,
        ...filtros
      };

      const response = await NecessidadesMerendaService.listar(params);
      
      if (response.success) {
        setNecessidades(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalItems(response.pagination?.totalItems || 0);
        setEstatisticas(response.estatisticas || estatisticas);
      } else {
        toast.error(response.error || 'Erro ao carregar necessidades');
      }
    } catch (error) {
      console.error('Erro ao carregar necessidades:', error);
      toast.error('Erro ao carregar necessidades');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearch.debouncedSearchTerm, filtros]);

  // Carregar dados quando os parâmetros mudarem
  useEffect(() => {
    loadNecessidades();
  }, [loadNecessidades]);

  // Função para submeter formulário
  const onSubmit = async (data) => {
    setSaving(true);
    try {
      let response;
      
      if (editingNecessidade) {
        response = await NecessidadesMerendaService.atualizar(editingNecessidade.id, data);
      } else {
        response = await NecessidadesMerendaService.criar(data);
      }

      if (response.success) {
        toast.success(editingNecessidade ? 'Necessidade atualizada com sucesso!' : 'Necessidade criada com sucesso!');
        handleCloseModal();
        loadNecessidades();
      } else {
        handleApiResponse(response);
      }
    } catch (error) {
      console.error('Erro ao salvar necessidade:', error);
      toast.error('Erro ao salvar necessidade');
    } finally {
      setSaving(false);
    }
  };

  // Funções para modais
  const handleAddNecessidade = () => {
    setEditingNecessidade(null);
    setViewMode(false);
    setShowModal(true);
  };

  const handleUploadPDF = () => {
    setShowUploadModal(true);
  };

  const handleViewNecessidade = async (necessidade) => {
    try {
      const result = await NecessidadesMerendaService.buscarPorId(necessidade.id);
      if (result.success) {
        setEditingNecessidade(result.data);
        setViewMode(true);
        setShowModal(true);
      } else {
        toast.error(result.error || 'Erro ao carregar necessidade');
      }
    } catch (error) {
      toast.error('Erro ao carregar necessidade');
    }
  };

  const handleEditNecessidade = async (necessidade) => {
    try {
      const result = await NecessidadesMerendaService.buscarPorId(necessidade.id);
      if (result.success) {
        setEditingNecessidade(result.data);
        setViewMode(false);
        setShowModal(true);
      } else {
        toast.error(result.error || 'Erro ao carregar necessidade');
      }
    } catch (error) {
      toast.error('Erro ao carregar necessidade');
    }
  };

  const handlePreviewNecessidade = async (necessidade) => {
    try {
      // Se a necessidade já tem dados (vem do PDF processado), usar diretamente
      if (necessidade && necessidade.dados_processados) {
        setEditingNecessidade(necessidade);
        setShowPreviewModal(true);
        return;
      }

      // Se é uma necessidade existente, buscar do banco
      if (necessidade && necessidade.id) {
        const result = await NecessidadesMerendaService.buscarPorId(necessidade.id);
        if (result.success) {
          setEditingNecessidade(result.data);
          setShowPreviewModal(true);
        } else {
          toast.error(result.error || 'Erro ao carregar necessidade');
        }
      }
    } catch (error) {
      console.error('❌ Erro no handlePreviewNecessidade:', error);
      toast.error('Erro ao carregar necessidade');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingNecessidade(null);
    setViewMode(false);
    clearValidationErrors();
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
  };

  const handleClosePreviewModal = () => {
    setShowPreviewModal(false);
    setEditingNecessidade(null);
  };

  // Funções de paginação
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (itemsPerPage) => {
    setItemsPerPage(itemsPerPage);
    setCurrentPage(1);
  };

  // Funções de filtros
  const handleFiltroChange = (key, value) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };

  const clearFiltros = () => {
    setFiltros({
      status: '',
      unidade_escolar_id: '',
      data_inicio: '',
      data_fim: ''
    });
    debouncedSearch.clearSearch();
    setCurrentPage(1);
  };

  // Funções de exclusão
  const handleDeleteNecessidade = (necessidade) => {
    setNecessidadeToDelete(necessidade);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteNecessidade = async () => {
    if (!necessidadeToDelete) return;

    try {
      const response = await NecessidadesMerendaService.excluir(necessidadeToDelete.id);
      
      if (response.success) {
        toast.success('Necessidade excluída com sucesso!');
        loadNecessidades();
      } else {
        toast.error(response.error || 'Erro ao excluir necessidade');
      }
    } catch (error) {
      console.error('Erro ao excluir necessidade:', error);
      toast.error('Erro ao excluir necessidade');
    } finally {
      setShowDeleteConfirmModal(false);
      setNecessidadeToDelete(null);
    }
  };

  // Funções específicas de necessidades
  const handleIntegrarFaturamento = async (necessidade) => {
    try {
      const response = await NecessidadesMerendaService.integrarFaturamento(necessidade.id);
      
      if (response.success) {
        toast.success('Necessidade integrada ao faturamento com sucesso!');
        loadNecessidades();
      } else {
        toast.error(response.error || 'Erro ao integrar com faturamento');
      }
    } catch (error) {
      console.error('Erro ao integrar com faturamento:', error);
      toast.error('Erro ao integrar com faturamento');
    }
  };

  const handleAprovarNecessidade = async (dadosNecessidade) => {
    try {
      // Se for uma necessidade já existente (com ID), apenas aprovar
      if (dadosNecessidade.id) {
        const response = await NecessidadesMerendaService.alterarStatus([dadosNecessidade.id], 'aprovado');
        
        if (response.success) {
          toast.success('Necessidade aprovada com sucesso!');
          handleClosePreviewModal();
          loadNecessidades();
        } else {
          toast.error(response.error || 'Erro ao aprovar necessidade');
        }
      } else {
        // Se for dados extraídos do PDF, criar a necessidade no banco
        const response = await NecessidadesMerendaService.criar(dadosNecessidade);
        
        if (response.success) {
          toast.success('Necessidade criada e aprovada com sucesso!');
          handleClosePreviewModal();
          loadNecessidades();
        } else {
          toast.error(response.error || 'Erro ao criar necessidade');
        }
      }
    } catch (error) {
      console.error('Erro ao aprovar/criar necessidade:', error);
      toast.error('Erro ao processar necessidade');
    }
  };

  const handleRejeitarNecessidade = async (necessidade, motivo) => {
    try {
      const response = await NecessidadesMerendaService.alterarStatus([necessidade.id], 'rejeitado', motivo);
      
      if (response.success) {
        toast.success('Necessidade rejeitada');
        handleClosePreviewModal();
        loadNecessidades();
      } else {
        toast.error(response.error || 'Erro ao rejeitar necessidade');
      }
    } catch (error) {
      console.error('Erro ao rejeitar necessidade:', error);
      toast.error('Erro ao rejeitar necessidade');
    }
  };

  // Funções de exportação
  const handleExportListaCompras = async () => {
    try {
      const params = {
        ...filtros,
        search: searchTerm
      };
      
      const response = await NecessidadesMerendaService.exportarListaCompras(params);
      
      if (response instanceof Blob) {
        const url = window.URL.createObjectURL(response);
        const link = document.createElement('a');
        link.href = url;
        link.download = `lista-compras-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('Lista de compras exportada com sucesso!');
      } else {
        toast.error('Erro ao exportar lista de compras');
      }
    } catch (error) {
      console.error('Erro ao exportar lista de compras:', error);
      toast.error('Erro ao exportar lista de compras');
    }
  };

  // Funções auxiliares
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getMonthName = (month) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1] || '';
  };

  const getFieldError = (field) => {
    return '';
  };

  return {
    // Estados
    necessidades: isSortingLocally ? necessidadesOrdenadas : necessidades,
    loading,
    saving,
    showModal,
    
    // Estados de ordenação
    sortField,
    sortDirection,
    isSortingLocally,
    showUploadModal,
    showPreviewModal,
    editingNecessidade,
    viewMode,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    searchTerm: debouncedSearch.searchTerm,
    isSearching: debouncedSearch.isSearching,
    filtros,
    showDeleteConfirmModal,
    setShowDeleteConfirmModal,
    necessidadeToDelete,
    validationErrors,
    showValidationModal,
    estatisticas,

    // Funções
    loadNecessidades,
    onSubmit,
    handleDeleteNecessidade,
    confirmDeleteNecessidade,
    handleAddNecessidade,
    handleUploadPDF,
    handleViewNecessidade,
    handleEditNecessidade,
    handlePreviewNecessidade,
    handleCloseModal,
    handleCloseUploadModal,
    handleClosePreviewModal,
    handlePageChange,
    handleItemsPerPageChange,
    setSearchTerm: debouncedSearch.updateSearchTerm,
    handleKeyPress: debouncedSearch.handleKeyPress,
    clearSearch: debouncedSearch.clearSearch,
    handleFiltroChange,
    clearFiltros,
    formatDate,
    getMonthName,
    getFieldError,
    handleCloseValidationModal,
    handleExportXLSX,
    handleExportPDF,
    handleExportListaCompras,
    handleIntegrarFaturamento,
    handleAprovarNecessidade,
    
    // Ações de ordenação
    handleSort,
    handleRejeitarNecessidade
  };
};
