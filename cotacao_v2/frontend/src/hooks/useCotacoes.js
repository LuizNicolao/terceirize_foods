import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import cotacoesService from '../services/cotacoes';
import { formatDate, getStatusConfig } from '../utils/formatters';
import toast from 'react-hot-toast';

export const useCotacoes = () => {
  const navigate = useNavigate();
  const [cotacoes, setCotacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    comprador: '',
    tipoCompra: '',
    dataInicio: '',
    dataFim: ''
  });
  const [statusCounts, setStatusCounts] = useState({
    pendente: 0,
    aprovada: 0,
    rejeitada: 0,
    em_analise: 0,
    total: 0
  });

  // Carregar cotações
  const loadCotacoes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await cotacoesService.getCotacoes(filters);
      
      if (result.success) {
        setCotacoes(result.data);
        updateStatusCounts(result.data);
      } else {
        setError(result.error);
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar cotações:', error);
      setError('Erro ao conectar com o servidor');
      toast.error('Erro ao carregar cotações');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Carregar dados quando o componente montar ou filtros mudarem
  useEffect(() => {
    loadCotacoes();
  }, [loadCotacoes]);

  // Atualizar contadores de status
  const updateStatusCounts = (cotacoes) => {
    const counts = {
      pendente: 0,
      aprovada: 0,
      rejeitada: 0,
      em_analise: 0,
      total: cotacoes.length
    };

    cotacoes.forEach(cotacao => {
      if (counts.hasOwnProperty(cotacao.status)) {
        counts[cotacao.status]++;
      }
    });

    setStatusCounts(counts);
  };

  // Filtrar por status
  const handleStatusFilter = (status) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status === status ? '' : status
    }));
  };

  // Atualizar filtros
  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  // Limpar filtros
  const clearFilters = () => {
    setFilters({
      status: '',
      comprador: '',
      tipoCompra: '',
      dataInicio: '',
      dataFim: ''
    });
  };

  // Enviar para supervisor
  const handleEnviarParaSupervisor = async (cotacaoId) => {
    try {
      const result = await cotacoesService.enviarParaSupervisor(cotacaoId);
      
      if (result.success) {
        toast.success('Cotação enviada para supervisor com sucesso');
        loadCotacoes(); // Recarregar lista
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Erro ao enviar para supervisor:', error);
      toast.error('Erro ao enviar para supervisor');
    }
  };

  // Excluir cotação
  const handleDeleteCotacao = async (cotacaoId) => {
    if (window.confirm('Tem certeza que deseja excluir esta cotação?')) {
      try {
        const result = await cotacoesService.deleteCotacao(cotacaoId);
        
        if (result.success) {
          toast.success('Cotação excluída com sucesso');
          loadCotacoes(); // Recarregar lista
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        console.error('Erro ao excluir cotação:', error);
        toast.error('Erro ao excluir cotação');
      }
    }
  };

  // Visualizar cotação
  const handleViewCotacao = (id) => {
    navigate(`/cotacoes/${id}`);
  };

  // Editar cotação
  const handleEditCotacao = (id) => {
    navigate(`/cotacoes/${id}/editar`);
  };

  // Nova cotação
  const handleNovaCotacao = () => {
    navigate('/cotacoes/nova');
  };

  // Funções utilitárias usando os novos formatters
  const getStatusColor = (status) => {
    const config = getStatusConfig(status);
    return config.color;
  };

  const getStatusLabel = (status) => {
    const config = getStatusConfig(status);
    return config.label;
  };

  return {
    cotacoes,
    loading,
    error,
    filters,
    statusCounts,
    handleStatusFilter,
    updateFilters,
    clearFilters,
    handleEnviarParaSupervisor,
    handleDeleteCotacao,
    handleViewCotacao,
    handleEditCotacao,
    handleNovaCotacao,
    formatDate,
    getStatusColor,
    getStatusLabel
  };
};
