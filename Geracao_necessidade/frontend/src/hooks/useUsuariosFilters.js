import { useState, useCallback } from 'react';

export const useUsuariosFilters = () => {
  const [filtros, setFiltros] = useState({
    search: '',
    tipo_usuario: '',
    ativo: 'true', // Default para usuários ativos
    page: 1,
    limit: 10
  });

  const [loading, setLoading] = useState(false);

  const updateFiltros = useCallback((novosFiltros) => {
    setFiltros(prev => ({
      ...prev,
      ...novosFiltros,
      page: novosFiltros.page !== undefined ? novosFiltros.page : 1 // Reset page when other filters change
    }));
  }, []);

  const clearFiltros = useCallback(() => {
    setFiltros({
      search: '',
      tipo_usuario: '',
      ativo: 'true', // Default para usuários ativos
      page: 1,
      limit: 10
    });
  }, []);

  const setPage = useCallback((page) => {
    setFiltros(prev => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit) => {
    setFiltros(prev => ({ ...prev, limit, page: 1 })); // Reset page on limit change
  }, []);

  const setLoadingState = useCallback((isLoading) => {
    setLoading(isLoading);
  }, []);

  return {
    filtros,
    loading,
    updateFiltros,
    clearFiltros,
    setPage,
    setLimit,
    setLoadingState
  };
};
