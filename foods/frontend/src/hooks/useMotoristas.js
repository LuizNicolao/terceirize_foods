import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import MotoristasService from '../services/motoristas';
import FiliaisService from '../services/filiais';

export const useMotoristas = () => {
  const [motoristas, setMotoristas] = useState([]);
  const [filiais, setFiliais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editingMotorista, setEditingMotorista] = useState(null);
  const [estatisticas, setEstatisticas] = useState({
    total_motoristas: 0,
    motoristas_ativos: 0,
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

  // Carregar motoristas
  const loadMotoristas = async (params = {}) => {
    setLoading(true);
    try {
      const paginationParams = {
        page: currentPage,
        limit: itemsPerPage,
        ...params
      };

      const result = await MotoristasService.listar(paginationParams);
      if (result.success) {
        setMotoristas(result.data);
        
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
          total_motoristas: result.data.length,
          motoristas_ativos: result.data.filter(m => m.status === 'ativo').length,
          em_ferias: result.data.filter(m => m.status === 'ferias').length,
          em_licenca: result.data.filter(m => m.status === 'licenca').length
        };
        setEstatisticas(stats);
      }
    } catch (error) {
      console.error('Erro ao carregar motoristas:', error);
      toast.error('Erro ao carregar motoristas');
    } finally {
      setLoading(false);
    }
  };

  // Handlers de modal
  const handleAddMotorista = () => {
    setEditingMotorista(null);
    setViewMode(false);
    setShowModal(true);
  };

  const handleViewMotorista = (motorista) => {
    setEditingMotorista(motorista);
    setViewMode(true);
    setShowModal(true);
  };

  const handleEditMotorista = (motorista) => {
    setEditingMotorista(motorista);
    setViewMode(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMotorista(null);
    setViewMode(false);
  };

  // Handler de submit
  const handleSubmit = async (data) => {
    try {
      if (editingMotorista) {
        const result = await MotoristasService.atualizar(editingMotorista.id, data);
        if (result.success) {
          toast.success('Motorista atualizado com sucesso!');
          handleCloseModal();
          loadMotoristas();
        }
      } else {
        const result = await MotoristasService.criar(data);
        if (result.success) {
          toast.success('Motorista criado com sucesso!');
          handleCloseModal();
          loadMotoristas();
        }
      }
    } catch (error) {
      console.error('Erro ao salvar motorista:', error);
      toast.error('Erro ao salvar motorista');
    }
  };

  // Handler de exclusão
  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este motorista?')) {
      try {
        const result = await MotoristasService.excluir(id);
        if (result.success) {
          toast.success('Motorista excluído com sucesso!');
          loadMotoristas();
        }
      } catch (error) {
        console.error('Erro ao excluir motorista:', error);
        toast.error('Erro ao excluir motorista');
      }
    }
  };

  // Handlers de paginação
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Handlers de exportação
  const handleExportXLSX = async () => {
    try {
      await MotoristasService.exportarXLSX();
      toast.success('Exportação XLSX iniciada!');
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      toast.error('Erro ao exportar XLSX');
    }
  };

  const handleExportPDF = async () => {
    try {
      await MotoristasService.exportarPDF();
      toast.success('Exportação PDF iniciada!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar PDF');
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadMotoristas();
    loadFiliais();
  }, [currentPage, itemsPerPage]);

  return {
    // Estados
    motoristas,
    filiais,
    loading,
    showModal,
    viewMode,
    editingMotorista,
    estatisticas,
    searchTerm,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,

    // Setters
    setSearchTerm,

    // Handlers
    handleAddMotorista,
    handleViewMotorista,
    handleEditMotorista,
    handleCloseModal,
    handleSubmit,
    handleDelete,
    handlePageChange,
    handleItemsPerPageChange,
    handleExportXLSX,
    handleExportPDF
  };
};
