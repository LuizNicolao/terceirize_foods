/**
 * Hook para funcionalidades do Supervisor
 * Gerencia dados e operações do painel do supervisor
 */

import { useState, useEffect, useCallback } from 'react';
import { supervisorService } from '../services/supervisor';
import toast from 'react-hot-toast';

export const useSupervisor = () => {
  const [cotacoes, setCotacoes] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchCotacoesPendentes = useCallback(async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await supervisorService.getCotacoesPendentes(page, limit);
      
      // Verificar se a resposta é paginada
      if (response.data && response.meta) {
        setCotacoes(response.data);
        setPagination({
          page: response.meta.pagination.page,
          limit: response.meta.pagination.limit,
          total: response.meta.pagination.total,
          totalPages: response.meta.pagination.totalPages
        });
      } else {
        // Fallback para resposta não paginada
        setCotacoes(Array.isArray(response) ? response : []);
      }
      
      setError(null);
    } catch (error) {
      console.error('Erro ao buscar cotações pendentes:', error);
      setError(error.message || 'Erro ao carregar cotações pendentes');
      toast.error('Erro ao carregar cotações pendentes');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await supervisorService.getStats();
      // Verificar se a resposta tem estrutura padronizada
      setStats(response.data || response || {});
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      // Não mostrar toast para stats, apenas log
    }
  }, []);

  useEffect(() => {
    fetchCotacoesPendentes();
    fetchStats();
  }, [fetchCotacoesPendentes, fetchStats]);

  return {
    cotacoes,
    stats,
    loading,
    error,
    pagination,
    fetchCotacoesPendentes,
    fetchStats
  };
};
