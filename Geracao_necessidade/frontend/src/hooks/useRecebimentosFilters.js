import { useState, useCallback, useRef, useEffect } from 'react';

export const useRecebimentosFilters = () => {
  const [filtros, setFiltros] = useState({
    search: '',
    escola_id: '',
    tipo_recebimento: '',
    tipo_entrega: '',
    data_inicio: '',
    data_fim: '',
    page: 1,
    limit: 10
  });

  const [loading, setLoading] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Cleanup do timeout ao desmontar o componente
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const updateFiltros = useCallback((novosFiltros) => {
    // Se for mudança de busca, usar debounce
    if (novosFiltros.hasOwnProperty('search')) {
      // Limpar timeout anterior
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Atualizar busca imediatamente para mostrar no input
      setFiltros(prev => ({ ...prev, search: novosFiltros.search }));
      
      // Aplicar filtro com delay de 500ms
      searchTimeoutRef.current = setTimeout(() => {
        setFiltros(prev => ({
          ...prev,
          ...novosFiltros,
          page: 1 // Reset page when search changes
        }));
      }, 500);
    } else {
      // Para outros filtros, aplicar imediatamente
      setFiltros(prev => ({
        ...prev,
        ...novosFiltros,
        page: novosFiltros.page !== undefined ? novosFiltros.page : 1
      }));
    }
  }, []);

  const clearFiltros = useCallback(() => {
    setFiltros({
      search: '',
      escola_id: '',
      tipo_recebimento: '',
      tipo_entrega: '',
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
    setFiltros(prev => ({ ...prev, limit, page: 1 }));
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
