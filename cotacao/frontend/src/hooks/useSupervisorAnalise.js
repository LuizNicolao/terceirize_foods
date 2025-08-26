/**
 * Hook para Análise do Supervisor
 * Gerencia dados e operações de análise de cotações
 */

import { useState, useCallback } from 'react';
import { supervisorService } from '../services/supervisor';
import toast from 'react-hot-toast';

export const useSupervisorAnalise = () => {
  const [cotacao, setCotacao] = useState(null);
  const [fornecedores, setFornecedores] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [precos, setPrecos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analisando, setAnalisando] = useState(false);

  const fetchDetalhesCotacao = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await supervisorService.getDetalhesCotacao(id);
      
      // A resposta vem como { success: true, data: { cotacao, fornecedores, produtos, precos } }
      const data = response.data || response;
      
      setCotacao(data.cotacao || null);
      setFornecedores(Array.isArray(data.fornecedores) ? data.fornecedores : []);
      setProdutos(Array.isArray(data.produtos) ? data.produtos : []);
      setPrecos(Array.isArray(data.precos) ? data.precos : []);
    } catch (error) {
      console.error('Erro ao buscar detalhes da cotação:', error);
      setError(error.message || 'Erro ao carregar detalhes da cotação');
      toast.error('Erro ao carregar detalhes da cotação');
    } finally {
      setLoading(false);
    }
  }, []);

  const analisarCotacao = useCallback(async (id, analiseData) => {
    try {
      setAnalisando(true);
      
      const response = await supervisorService.analisarCotacao(id, analiseData);
      
      toast.success(response.message || 'Cotação analisada com sucesso!');
      return response;
    } catch (error) {
      console.error('Erro ao analisar cotação:', error);
      const errorMessage = error.message || 'Erro ao analisar cotação';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setAnalisando(false);
    }
  }, []);

  return {
    cotacao,
    fornecedores,
    produtos,
    precos,
    loading,
    error,
    analisando,
    fetchDetalhesCotacao,
    analisarCotacao
  };
};
