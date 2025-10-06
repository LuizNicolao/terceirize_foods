import { useState, useEffect, useCallback } from 'react';
import ProdutosOrigemService from '../services/produtosOrigem';
import toast from 'react-hot-toast';

/**
 * Hook para gerenciar produtos origem para recebimentos
 */
export const useProdutosOrigem = () => {
  const [produtos, setProdutos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Carregar grupos disponíveis
   */
  const carregarGrupos = useCallback(async () => {
    try {
      const response = await ProdutosOrigemService.buscarGrupos();
      
      if (response.success) {
        setGrupos(response.data || []);
      } else {
        setError(response.error || 'Erro ao carregar grupos');
        toast.error(response.error || 'Erro ao carregar grupos');
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      setError('Erro ao carregar grupos');
      toast.error('Erro ao carregar grupos');
    }
  }, []);

  /**
   * Carregar produtos por grupo
   */
  const carregarProdutosPorGrupo = useCallback(async (grupoId) => {
    if (!grupoId) {
      setProdutos([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await ProdutosOrigemService.buscarPorGrupo(grupoId);
      
      if (response.success) {
        setProdutos(response.data || []);
      } else {
        setError(response.error || 'Erro ao carregar produtos');
        toast.error(response.error || 'Erro ao carregar produtos');
        setProdutos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setError('Erro ao carregar produtos');
      toast.error('Erro ao carregar produtos');
      setProdutos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carregar todos os produtos
   */
  const carregarTodosProdutos = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ProdutosOrigemService.buscarTodos();
      if (response.success) {
        setProdutos(response.data || []);
      } else {
        setError(response.error || 'Erro ao carregar produtos');
        toast.error(response.error || 'Erro ao carregar produtos');
        setProdutos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setError('Erro ao carregar produtos');
      toast.error('Erro ao carregar produtos');
      setProdutos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar grupos na montagem do componente
  useEffect(() => {
    carregarGrupos();
  }, [carregarGrupos]);

  return {
    produtos,
    grupos,
    loading,
    error,
    carregarProdutosPorGrupo,
    carregarTodosProdutos,
    carregarGrupos
  };
};
