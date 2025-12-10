import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import quantidadesServidasService from '../services/quantidadesServidas';

export const useQuantidadesServidas = () => {
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
  const MAX_ITEMS_PER_PAGE = 100;
  
  // Estados de filtros
  const [unidadeFilter, setUnidadeFilter] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  
  // Estados de estatísticas
  const [estatisticas, setEstatisticas] = useState({
    total_registros: 0,
    total_unidades: 0,
    registros_mes_atual: 0,
    total_medias: 0
  });
  
  // Carregar registros
  const loadRegistros = useCallback(async (page = currentPage) => {
    try {
      setLoading(true);
      
      const paginaNormalizada = Math.max(1, page);
      const limiteNormalizado = Math.max(1, Math.min(itemsPerPage || 20, MAX_ITEMS_PER_PAGE));

      const params = {
        page: paginaNormalizada,
        limit: limiteNormalizado,
        unidade_id: unidadeFilter || undefined,
        data_inicio: dataInicio || undefined,
        data_fim: dataFim || undefined
      };
      
      const result = await quantidadesServidasService.listar(params);
      
      if (result.success) {
        const registrosRecebidos = result.data || [];
        
        // Verificar e remover duplicatas no frontend (por segurança)
        const registrosUnicosMap = new Map();
        registrosRecebidos.forEach(reg => {
          const chave = `${reg.unidade_id}-${reg.data}`;
          if (!registrosUnicosMap.has(chave)) {
            registrosUnicosMap.set(chave, reg);
          }
        });
        const registrosUnicos = Array.from(registrosUnicosMap.values());
        
        setRegistros(registrosUnicos);
        
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
  }, [currentPage, itemsPerPage, unidadeFilter, dataInicio, dataFim]);
  
  // Carregar estatísticas
  const loadEstatisticas = useCallback(async () => {
    try {
      const result = await quantidadesServidasService.obterEstatisticas();
      if (result.success) {
        setEstatisticas(result.data || {});
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }, []);
  
  // Criar/atualizar registro
  const onSubmit = async (dados, manterModalAberto = false) => {
    try {
      setSaving(true);
      const result = await quantidadesServidasService.criar(dados);
      
      if (result.success) {
        toast.success(result.message || 'Registros salvos com sucesso!');
        loadRegistros();
        loadEstatisticas();
        
        // Se for para manter o modal aberto (novo registro), apenas limpar o registro de edição
        // O modal permanecerá aberto e o formulário será resetado pelo useEffect
        if (manterModalAberto) {
          setEditingRegistro(null);
          // Não fechar o modal
        } else {
        handleCloseModal();
        }
        
        return { success: true, manterModalAberto };
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
  const handleDeleteRegistro = async (unidade_id, data) => {
    try {
      const result = await quantidadesServidasService.excluir(unidade_id, data);
      
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
    const normalizado = Math.max(1, Math.min(items || 20, MAX_ITEMS_PER_PAGE));
    if (items >= 999999 && normalizado !== items) {
      toast.dismiss();
      toast.success('Mostrando até 100 registros por página (limite máximo permitido).');
    }
    setItemsPerPage(normalizado);
    setCurrentPage(1);
  };
  
  // Handlers de filtros
  const handleUnidadeFilterChange = (unidadeId) => {
    setUnidadeFilter(unidadeId);
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
    setUnidadeFilter('');
    setDataInicio('');
    setDataFim('');
    setCurrentPage(1);
  };
  
  // Carregar dados iniciais
  // IMPORTANTE: Usar as dependências reais em vez de loadRegistros para evitar múltiplas chamadas
  useEffect(() => {
    const carregar = async () => {
      try {
        setLoading(true);
        
        const paginaNormalizada = Math.max(1, currentPage);
        const limiteNormalizado = Math.max(1, Math.min(itemsPerPage || 20, MAX_ITEMS_PER_PAGE));

        const params = {
          page: paginaNormalizada,
          limit: limiteNormalizado,
          unidade_id: unidadeFilter || undefined,
          data_inicio: dataInicio || undefined,
          data_fim: dataFim || undefined
        };
        
        const result = await quantidadesServidasService.listar(params);
        
        if (result.success) {
          const registrosRecebidos = result.data || [];
          
          // Verificar e remover duplicatas no frontend (por segurança)
          const registrosUnicosMap = new Map();
          registrosRecebidos.forEach(reg => {
            const chave = `${reg.unidade_id}-${reg.data}`;
            if (!registrosUnicosMap.has(chave)) {
              registrosUnicosMap.set(chave, reg);
            }
          });
          const registrosUnicos = Array.from(registrosUnicosMap.values());
          
          setRegistros(registrosUnicos);
          
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
    };
    
    carregar();
  }, [currentPage, itemsPerPage, unidadeFilter, dataInicio, dataFim]);
  
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
    unidadeFilter,
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
    handleUnidadeFilterChange,
    handleDataInicioChange,
    handleDataFimChange,
    clearFiltros
  };
};

