import { useState, useCallback, useEffect } from 'react';
import { useSemanasAbastecimento } from './useSemanasAbastecimento';

export const useRecebimentosFilters = () => {
  const { obterValorPadrao } = useSemanasAbastecimento();
  
  const [filtros, setFiltros] = useState({
    escola: null,
    tipo_recebimento: '',
    tipo_entrega: '',
    search: '',
    semana_abastecimento: '',
    ativo: true
  });

  // Inicializar com a semana atual
  useEffect(() => {
    const semanaAtual = obterValorPadrao();
    if (semanaAtual) {
      setFiltros(prev => ({
        ...prev,
        semana_abastecimento: semanaAtual
      }));
    }
  }, [obterValorPadrao]);

  const updateFiltros = useCallback((novosFiltros) => {
    setFiltros(prev => ({
      ...prev,
      ...novosFiltros
    }));
  }, []);

  const clearFiltros = useCallback(() => {
    setFiltros({
      escola: null,
      tipo_recebimento: '',
      tipo_entrega: '',
      search: '',
      semana_abastecimento: '',
      ativo: true
    });
  }, []);

  const setEscola = useCallback((escola) => {
    setFiltros(prev => ({ ...prev, escola }));
  }, []);

  const setTipoRecebimento = useCallback((tipo_recebimento) => {
    setFiltros(prev => ({ ...prev, tipo_recebimento }));
  }, []);

  const setTipoEntrega = useCallback((tipo_entrega) => {
    setFiltros(prev => ({ ...prev, tipo_entrega }));
  }, []);

  const setSearch = useCallback((search) => {
    setFiltros(prev => ({ ...prev, search }));
  }, []);

  const setSemanaAbastecimento = useCallback((semana_abastecimento) => {
    setFiltros(prev => ({ ...prev, semana_abastecimento }));
  }, []);

  return {
    filtros,
    updateFiltros,
    clearFiltros,
    setEscola,
    setTipoRecebimento,
    setTipoEntrega,
    setSearch,
    setSemanaAbastecimento
  };
};
