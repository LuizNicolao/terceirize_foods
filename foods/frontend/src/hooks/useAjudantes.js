import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import AjudantesService from '../services/ajudantes';
import FiliaisService from '../services/filiais';

export const useAjudantes = () => {
  const [ajudantes, setAjudantes] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingAjudante, setEditingAjudante] = useState(null);
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
  const [estatisticas, setEstatisticas] = useState({
    total_ajudantes: 0,
    ajudantes_ativos: 0,
    em_ferias: 0,
    em_licenca: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Carregar filiais
  const loadFiliais = async () => {
    try {
      const result = await FiliaisService.buscarAtivas();
      if (result.success) {
        setFiliais(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
    }
  };

  // Carregar ajudantes
  const loadAjudantes = async (params = {}) => {
    setLoading(true);
    try {
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        ...params
      };

      const result = await AjudantesService.listar(paginationParams);
      if (result.success) {
        setAjudantes(result.data);
        
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages || 1);
          setTotalItems(result.pagination.totalItems || result.data.length);
          setCurrentPage(result.pagination.currentPage || 1);
        } else {
          setTotalPages(1);
          setTotalItems(result.data.length);
        }

        // Calcular estatísticas
        const stats = {
          total_ajudantes: result.data.length,
          ajudantes_ativos: result.data.filter(a => a.status === 'ativo').length,
          em_ferias: result.data.filter(a => a.status === 'ferias').length,
          em_licenca: result.data.filter(a => a.status === 'licenca').length
        };
        setEstatisticas(stats);
      }
    } catch (error) {
      console.error('Erro ao carregar ajudantes:', error);
      toast.error('Erro ao carregar ajudantes');
    } finally {
      setLoading(false);
    }
  };

  // Carregar logs de auditoria
  const loadAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const result = await AjudantesService.buscarAuditoria(auditFilters);
      if (result.success) {
        setAuditLogs(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar logs de auditoria:', error);
      toast.error('Erro ao carregar logs de auditoria');
    } finally {
      setAuditLoading(false);
    }
  };

  // Handlers de paginação
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  // Handlers de modal
  const handleAddAjudante = () => {
    setEditingAjudante(null);
    setViewMode(false);
    setShowModal(true);
  };

  const handleViewAjudante = (ajudante) => {
    setEditingAjudante(ajudante);
    setViewMode(true);
    setShowModal(true);
  };

  const handleEditAjudante = (ajudante) => {
    setEditingAjudante(ajudante);
    setViewMode(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAjudante(null);
    setViewMode(false);
  };

  // Handlers de auditoria
  const handleOpenAuditModal = () => {
    setShowAuditModal(true);
    loadAuditLogs();
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

  const handleApplyAuditFilters = () => {
    loadAuditLogs();
  };

  // Handlers de busca e filtros
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
    loadAjudantes({ search: term });
  };

  const handleFilter = (filters) => {
    setCurrentPage(1);
    loadAjudantes(filters);
  };

  // Handler de submit do formulário
  const handleSubmit = async (data) => {
    try {
      if (editingAjudante) {
        // Atualizar ajudante
        const result = await AjudantesService.atualizar(editingAjudante.id, data);
        if (result.success) {
          toast.success('Ajudante atualizado com sucesso!');
          handleCloseModal();
          loadAjudantes();
        } else {
          toast.error(result.message || 'Erro ao atualizar ajudante');
        }
      } else {
        // Criar novo ajudante
        const result = await AjudantesService.criar(data);
        if (result.success) {
          toast.success('Ajudante criado com sucesso!');
          handleCloseModal();
          loadAjudantes();
        } else {
          toast.error(result.message || 'Erro ao criar ajudante');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar ajudante:', error);
      toast.error('Erro ao salvar ajudante');
    }
  };

  // Handler de exclusão
  const handleDelete = async (ajudanteId) => {
    if (window.confirm('Tem certeza que deseja excluir este ajudante?')) {
      try {
        const result = await AjudantesService.excluir(ajudanteId);
        if (result.success) {
          toast.success('Ajudante excluído com sucesso!');
          loadAjudantes();
        } else {
          toast.error(result.message || 'Erro ao excluir ajudante');
        }
      } catch (error) {
        console.error('Erro ao excluir ajudante:', error);
        toast.error('Erro ao excluir ajudante');
      }
    }
  };

  // Handlers de exportação
  const handleExportXLSX = async () => {
    try {
      await AjudantesService.exportarXLSX();
      toast.success('Exportação XLSX iniciada!');
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      toast.error('Erro ao exportar XLSX');
    }
  };

  const handleExportPDF = async () => {
    try {
      await AjudantesService.exportarPDF();
      toast.success('Exportação PDF iniciada!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar PDF');
    }
  };

  const handleExportAuditXLSX = async () => {
    try {
      await AjudantesService.exportarAuditoriaXLSX(auditFilters);
      toast.success('Exportação de auditoria XLSX iniciada!');
    } catch (error) {
      console.error('Erro ao exportar auditoria XLSX:', error);
      toast.error('Erro ao exportar auditoria XLSX');
    }
  };

  const handleExportAuditPDF = async () => {
    try {
      await AjudantesService.exportarAuditoriaPDF(auditFilters);
      toast.success('Exportação de auditoria PDF iniciada!');
    } catch (error) {
      console.error('Erro ao exportar auditoria PDF:', error);
      toast.error('Erro ao exportar auditoria PDF');
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadAjudantes();
    loadFiliais();
  }, [currentPage, itemsPerPage]);

  return {
    // Estados
    ajudantes,
    filiais,
    loading,
    showModal,
    viewMode,
    editingAjudante,
    showAuditModal,
    auditLogs,
    auditLoading,
    auditFilters,
    estatisticas,
    searchTerm,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,

    // Setters
    setAuditFilters,
    setSearchTerm,

    // Handlers
    handleAddAjudante,
    handleViewAjudante,
    handleEditAjudante,
    handleCloseModal,
    handleOpenAuditModal,
    handleCloseAuditModal,
    handleApplyAuditFilters,
    handleSearch,
    handleFilter,
    handleSubmit,
    handleDelete,
    handlePageChange,
    handleItemsPerPageChange,
    handleExportXLSX,
    handleExportPDF,
    handleExportAuditXLSX,
    handleExportAuditPDF,

    // Funções
    loadAjudantes,
    loadFiliais,
    loadAuditLogs
  };
};
