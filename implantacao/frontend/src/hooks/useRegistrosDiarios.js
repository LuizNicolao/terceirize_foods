import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import RegistrosDiariosService from '../services/registrosDiarios';

export const useRegistrosDiarios = () => {
  // Estados principais
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRegistro, setEditingRegistro] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  // Estados de filtros
  const [escolaFilter, setEscolaFilter] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  
  // Estados de estatísticas
  const [estatisticas, setEstatisticas] = useState({
    total_registros: 0,
    total_escolas: 0,
    registros_mes_atual: 0,
    total_medias: 0
  });
  
  // Carregar registros
  const loadRegistros = useCallback(async (page = currentPage) => {
    try {
      setLoading(true);
      
      const params = {
        page,
        limit: itemsPerPage,
        escola_id: escolaFilter || undefined,
        data_inicio: dataInicio || undefined,
        data_fim: dataFim || undefined
      };
      
      const result = await RegistrosDiariosService.listar(params);
      
      if (result.success) {
        setRegistros(result.data || []);
        
        if (result.pagination) {
          setCurrentPage(result.pagination.currentPage);
          setTotalPages(result.pagination.totalPages);
          setTotalItems(result.pagination.totalItems);
          setItemsPerPage(result.pagination.itemsPerPage);
        }
      } else {
        toast.error(result.error || 'Erro ao carregar registros');
      }
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
      toast.error('Erro ao carregar registros');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, escolaFilter, dataInicio, dataFim]);
  
  // Carregar estatísticas
  const loadEstatisticas = useCallback(async () => {
    try {
      const result = await RegistrosDiariosService.obterEstatisticas();
      if (result.success) {
        setEstatisticas(result.data || {});
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }, []);
  
  // Criar/atualizar registro
  const onSubmit = async (dados) => {
    try {
      setSaving(true);
      const result = await RegistrosDiariosService.criar(dados);
      
      if (result.success) {
        toast.success(result.message || 'Registros salvos com sucesso!');
        loadRegistros();
        loadEstatisticas();
        handleCloseModal();
        return { success: true };
      } else {
        if (result.errors) {
          // Erros de validação
          toast.error('Verifique os campos e tente novamente');
          return { success: false, errors: result.errors };
        } else {
          toast.error(result.error || 'Erro ao salvar registros');
          return { success: false, error: result.error };
        }
      }
    } catch (error) {
      console.error('Erro ao salvar registros:', error);
      toast.error('Erro ao salvar registros');
      return { success: false, error: 'Erro ao salvar registros' };
    } finally {
      setSaving(false);
    }
  };
  
  // Excluir registro
  const handleDeleteRegistro = async (escola_id, data) => {
    try {
      const result = await RegistrosDiariosService.excluir(escola_id, data);
      
      if (result.success) {
        toast.success('Registros excluídos com sucesso!');
        loadRegistros();
        loadEstatisticas();
      } else {
        toast.error(result.error || 'Erro ao excluir registros');
      }
    } catch (error) {
      console.error('Erro ao excluir registros:', error);
      toast.error('Erro ao excluir registros');
    }
  };
  
  // Handlers de modal
  const handleAddRegistro = () => {
    setEditingRegistro(null);
    setViewMode(false);
    setShowModal(true);
  };
  
  const handleEditRegistro = (registro) => {
    setEditingRegistro(registro);
    setViewMode(false);
    setShowModal(true);
  };
  
  const handleViewRegistro = (registro) => {
    setEditingRegistro(registro);
    setViewMode(true);
    setShowModal(true);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRegistro(null);
    setViewMode(false);
  };
  
  // Handlers de paginação
  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadRegistros(page);
  };
  
  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };
  
  // Handlers de filtros
  const handleEscolaFilterChange = (escolaId) => {
    setEscolaFilter(escolaId);
    setCurrentPage(1);
  };
  
  const handleDataInicioChange = (data) => {
    setDataInicio(data);
    setCurrentPage(1);
  };
  
  const handleDataFimChange = (data) => {
    setDataFim(data);
    setCurrentPage(1);
  };
  
  const clearFiltros = () => {
    setEscolaFilter('');
    setDataInicio('');
    setDataFim('');
    setCurrentPage(1);
  };
  
  // Carregar dados iniciais
  useEffect(() => {
    loadRegistros();
  }, [loadRegistros]);
  
  useEffect(() => {
    loadEstatisticas();
  }, [loadEstatisticas]);
  
  return {
    // Estados
    registros,
    loading,
    saving,
    showModal,
    editingRegistro,
    viewMode,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    escolaFilter,
    dataInicio,
    dataFim,
    estatisticas,
    
    // Ações
    loadRegistros,
    loadEstatisticas,
    onSubmit,
    handleDeleteRegistro,
    handleAddRegistro,
    handleEditRegistro,
    handleViewRegistro,
    handleCloseModal,
    handlePageChange,
    handleItemsPerPageChange,
    handleEscolaFilterChange,
    handleDataInicioChange,
    handleDataFimChange,
    clearFiltros
  };
};

