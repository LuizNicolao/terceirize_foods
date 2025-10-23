import { useState, useCallback, useEffect } from 'react';
import { useSemanasConsumo } from './useSemanasConsumo';

export const useNecessidadesFilters = () => {
  const { obterValorPadrao } = useSemanasConsumo();
  
  const [filtros, setFiltros] = useState({
    escola: null,
    grupo: null,
    data: '', // Semana de consumo (será inicializada com semana atual)
    search: '',
    semana_abastecimento: '',
    ativo: true
  });

  // Inicializar com a semana atual para "Semana de Consumo"
  useEffect(() => {
    const semanaAtual = obterValorPadrao();
    if (semanaAtual) {
      setFiltros(prev => ({
        ...prev,
        data: semanaAtual
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
    const semanaAtual = obterValorPadrao();
    setFiltros({
      escola: null,
      grupo: null,
      data: semanaAtual || '', // Manter semana atual ao limpar filtros
      search: '',
      semana_abastecimento: '',
      ativo: true
    });
  }, [obterValorPadrao]);

  const setEscola = useCallback((escola) => {
    setFiltros(prev => ({ ...prev, escola }));
  }, []);

  const setGrupo = useCallback((grupo) => {
    setFiltros(prev => ({ ...prev, grupo }));
  }, []);

  const setData = useCallback((data) => {
    setFiltros(prev => ({ ...prev, data }));
  }, []);

  const setSearch = useCallback((search) => {
    setFiltros(prev => ({ ...prev, search }));
  }, []);

  const setAtivo = useCallback((ativo) => {
    setFiltros(prev => ({ ...prev, ativo }));
  }, []);

  const setSemanaAbastecimento = useCallback((semana_abastecimento) => {
    setFiltros(prev => ({ ...prev, semana_abastecimento }));
  }, []);

  return {
    filtros,
    updateFiltros,
    clearFiltros,
    setEscola,
    setGrupo,
    setData,
    setSearch,
    setSemanaAbastecimento,
    setAtivo
  };
};
