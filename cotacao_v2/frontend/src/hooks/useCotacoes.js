import { useState, useEffect, useCallback } from 'react';
import { cotacoesService } from '../services/cotacoesService';

export const useCotacoes = () => {
  const [cotacoes, setCotacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusCounts, setStatusCounts] = useState({
    pendentes: 0,
    'aguardando-aprovacao': 0,
    'analise-supervisor': 0,
    aprovadas: 0,
    rejeitadas: 0,
    renegociacao: 0
  });

  const fetchCotacoes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await cotacoesService.getAll();
      setCotacoes(data);
      updateStatusCounts(data);
    } catch (error) {
      console.error('Erro ao buscar cotações:', error);
      setError(error.response?.data?.message || 'Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatusCounts = (cotacoes) => {
    const counts = {
      pendentes: 0,
      'aguardando-aprovacao': 0,
      'analise-supervisor': 0,
      aprovadas: 0,
      rejeitadas: 0,
      renegociacao: 0
    };

    cotacoes.forEach(cotacao => {
      switch (cotacao.status) {
        case 'pendente':
          counts.pendentes++;
          break;
        case 'aguardando_aprovacao':
          counts['aguardando-aprovacao']++;
          break;
        case 'em_analise':
          counts['analise-supervisor']++;
          break;
        case 'aprovada':
          counts.aprovadas++;
          break;
        case 'rejeitada':
          counts.rejeitadas++;
          break;
        case 'renegociacao':
          counts.renegociacao++;
          break;
        default:
          break;
      }
    });
    
    setStatusCounts(counts);
  };

  const enviarParaSupervisor = async (cotacaoId) => {
    try {
      await cotacoesService.enviarParaSupervisor(cotacaoId);
      alert('Cotação enviada para análise do supervisor com sucesso!');
      fetchCotacoes(); // Recarregar lista
      return true;
    } catch (error) {
      console.error('Erro ao enviar para supervisor:', error);
      alert(error.response?.data?.message || 'Erro ao enviar para supervisor');
      return false;
    }
  };

  useEffect(() => {
    fetchCotacoes();
  }, [fetchCotacoes]);

  return {
    cotacoes,
    loading,
    error,
    statusCounts,
    fetchCotacoes,
    enviarParaSupervisor
  };
};
