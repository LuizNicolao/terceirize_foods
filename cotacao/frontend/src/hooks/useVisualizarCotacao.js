import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import cotacoesService from '../services/cotacoes';

export const useVisualizarCotacao = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [cotacao, setCotacao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCotacao = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await cotacoesService.getCotacaoById(id);
      setCotacao(data);
    } catch (error) {
      console.error('Erro ao buscar cotação:', error);
      setError(error.message || 'Erro ao carregar cotação');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleVoltar = () => {
    navigate('/cotacoes');
  };

  const handleEditar = () => {
    navigate(`/editar-cotacao/${id}`);
  };

  useEffect(() => {
    if (id) {
      fetchCotacao();
    }
  }, [id, fetchCotacao]);

  return {
    cotacao,
    loading,
    error,
    user,
    handleVoltar,
    handleEditar,
    fetchCotacao
  };
};
