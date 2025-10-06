import { useState, useCallback } from 'react';

export const useSolicitacoesManutencaoFilters = () => {
  const [filtros, setFiltros] = useState({
    search: '',
    status: '',
    escola_id: '',
    data_inicio: '',
    data_fim: '',
    page: 1,
    limit: 10
  });

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
      status: '',
      escola_id: '',
      data_inicio: '',
      data_fim: '',
      page: 1,
      limit: 10
    });
  }, []);

  const setPage = useCallback((page) => {
    setFiltros(prev => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit) => {
    setFiltros(prev => ({ ...prev, limit, page: 1 })); // Reset to first page when changing limit
  }, []);

  const setSearch = useCallback((search) => {
    setFiltros(prev => ({ ...prev, search, page: 1 }));
  }, []);

  const setStatus = useCallback((status) => {
    setFiltros(prev => ({ ...prev, status, page: 1 }));
  }, []);

  const setEscola = useCallback((escola_id) => {
    setFiltros(prev => ({ ...prev, escola_id, page: 1 }));
  }, []);

  const setDataInicio = useCallback((data_inicio) => {
    setFiltros(prev => ({ ...prev, data_inicio, page: 1 }));
  }, []);

  const setDataFim = useCallback((data_fim) => {
    setFiltros(prev => ({ ...prev, data_fim, page: 1 }));
  }, []);

  const hasActiveFilters = filtros.search || filtros.status || filtros.escola_id || filtros.data_inicio || filtros.data_fim;

  return {
    filtros,
    updateFiltros,
    clearFiltros,
    setPage,
    setLimit,
    setSearch,
    setStatus,
    setEscola,
    setDataInicio,
    setDataFim,
    hasActiveFilters
  };
};
