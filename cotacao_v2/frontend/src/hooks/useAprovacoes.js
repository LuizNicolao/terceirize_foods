import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import aprovacoesService from '../services/aprovacoes';
import toast from 'react-hot-toast';

export const useAprovacoes = () => {
  const [cotacoes, setCotacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    status: 'aguardando_aprovacao',
    tipo: '',
    comprador: '',
    dataInicio: '',
    dataFim: ''
  });
  const [statusStats, setStatusStats] = useState({
    aguardandoAprovacao: 0,
    aguardandoSupervisor: 0,
    aprovadas: 0,
    rejeitadas: 0,
    renegociacao: 0
  });

  const navigate = useNavigate();

  // Carregar cotações para aprovação
  const loadCotacoes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await aprovacoesService.getCotacoesAprovacao();
      
      if (result.success) {
        setCotacoes(result.data);
      } else {
        setError(result.message || 'Erro ao carregar cotações');
        toast.error(result.message || 'Erro ao carregar cotações');
      }
    } catch (error) {
      console.error('Erro ao carregar cotações:', error);
      setError('Erro ao conectar com o servidor');
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    loadCotacoes();
  }, [loadCotacoes]);

  // Atualizar estatísticas quando cotações mudarem
  useEffect(() => {
    if (cotacoes.length > 0) {
      const stats = {
        aguardandoAprovacao: cotacoes.filter(c => c.status === 'aguardando_aprovacao').length,
        aguardandoSupervisor: cotacoes.filter(c => c.status === 'aguardando_aprovacao_supervisor').length,
        aprovadas: cotacoes.filter(c => c.status === 'aprovado').length,
        rejeitadas: cotacoes.filter(c => c.status === 'rejeitado').length,
        renegociacao: cotacoes.filter(c => c.status === 'renegociacao').length
      };
      setStatusStats(stats);
    }
  }, [cotacoes]);

  // Filtrar cotações
  const filteredCotacoes = useCallback(() => {
    let filtered = cotacoes;

    // Filtro por status
    if (filtros.status) {
      filtered = filtered.filter(cotacao => cotacao.status === filtros.status);
    }

    // Filtro por tipo
    if (filtros.tipo) {
      filtered = filtered.filter(cotacao => 
        cotacao.tipo_compra?.toLowerCase().includes(filtros.tipo.toLowerCase())
      );
    }

    // Filtro por comprador
    if (filtros.comprador) {
      filtered = filtered.filter(cotacao => 
        cotacao.comprador?.toLowerCase().includes(filtros.comprador.toLowerCase())
      );
    }

    // Filtro por data início
    if (filtros.dataInicio) {
      filtered = filtered.filter(cotacao => {
        const dataCotacao = new Date(cotacao.data_criacao);
        const dataInicio = new Date(filtros.dataInicio);
        return dataCotacao >= dataInicio;
      });
    }

    // Filtro por data fim
    if (filtros.dataFim) {
      filtered = filtered.filter(cotacao => {
        const dataCotacao = new Date(cotacao.data_criacao);
        const dataFim = new Date(filtros.dataFim);
        return dataCotacao <= dataFim;
      });
    }

    return filtered;
  }, [cotacoes, filtros]);

  // Navegar para análise
  const handleAnalisarCotacao = (cotacao) => {
    navigate(`/analisar-cotacao/${cotacao.id}`);
  };

  // Atualizar filtros
  const updateFiltros = (newFiltros) => {
    setFiltros(prev => ({ ...prev, ...newFiltros }));
  };

  // Limpar filtros
  const clearFiltros = () => {
    setFiltros({
      status: '',
      tipo: '',
      comprador: '',
      dataInicio: '',
      dataFim: ''
    });
  };

  // Recarregar dados
  const refreshData = () => {
    loadCotacoes();
  };

  return {
    // Estados
    cotacoes: filteredCotacoes(),
    loading,
    error,
    filtros,
    statusStats,
    
    // Funções
    handleAnalisarCotacao,
    updateFiltros,
    clearFiltros,
    refreshData,
    loadCotacoes
  };
};
