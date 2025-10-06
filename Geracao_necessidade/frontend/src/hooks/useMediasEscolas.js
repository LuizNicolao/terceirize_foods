import { useState, useEffect } from 'react';
import mediasEscolasService from '../services/mediasEscolasService';
import registrosDiariosService from '../services/registrosDiariosService';

export const useMediasEscolas = () => {
  const [medias, setMedias] = useState([]);
  const [escolas, setEscolas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const carregarMedias = async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Primeiro, calcular médias automaticamente a partir dos registros
      try {
        await registrosDiariosService.calcularMedias();
      } catch (calcError) {
        // Não é um erro crítico, continua o carregamento
      }

      // Depois carregar as médias (que agora incluem as calculadas automaticamente)
      const response = await mediasEscolasService.listar(params);
      if (response.success) {
        setMedias(response.data);
      } else {
        setError(response.message || 'Erro ao carregar médias');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar médias');
      console.error('Erro ao carregar médias:', err);
    } finally {
      setLoading(false);
    }
  };

  const carregarEscolas = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await mediasEscolasService.listarEscolas();
      if (response.success) {
        setEscolas(response.data);
      } else {
        setError(response.message || 'Erro ao carregar escolas');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar escolas');
      console.error('Erro ao carregar escolas:', err);
    } finally {
      setLoading(false);
    }
  };

  const buscarMediasPorEscola = async (escolaId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await mediasEscolasService.buscarPorEscola(escolaId);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao buscar médias da escola');
      console.error('Erro ao buscar médias da escola:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const criarMedias = async (dados) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await mediasEscolasService.criar(dados);
      await carregarMedias(); // Recarregar lista
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao criar médias';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const atualizarMedias = async (id, dados) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await mediasEscolasService.atualizar(id, dados);
      await carregarMedias(); // Recarregar lista
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar médias';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const deletarMedias = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await mediasEscolasService.deletar(id);
      await carregarMedias(); // Recarregar lista
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao excluir médias';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarEscolas();
  }, []);

  return {
    medias,
    escolas,
    loading,
    error,
    carregarMedias,
    carregarEscolas,
    buscarMediasPorEscola,
    criarMedias,
    atualizarMedias,
    deletarMedias
  };
};
