import { useState, useCallback, useEffect } from 'react';
import { useSemanasConsumo } from '../useSemanasConsumo';

export const useNecessidadesFilters = () => {
  const { obterValorPadrao } = useSemanasConsumo();
  
  const [filtros, setFiltros] = useState({
    escola: null,
    grupo: null,
    data: '', // Semana de consumo (será inicializada com semana atual apenas na primeira vez)
    search: '',
    semana_abastecimento: '',
    ativo: true
  });
  const [inicializado, setInicializado] = useState(false);

  // Inicializar com a semana atual para "Semana de Consumo" apenas na primeira vez
  useEffect(() => {
    if (!inicializado) {
    const semanaAtual = obterValorPadrao();
    if (semanaAtual) {
      setFiltros(prev => ({
        ...prev,
        data: semanaAtual
      }));
        setInicializado(true);
      }
    }
  }, [obterValorPadrao, inicializado]);

  const updateFiltros = useCallback((novosFiltros) => {
    setFiltros(prev => ({
      ...prev,
      ...novosFiltros
    }));
  }, []);

  const clearFiltros = useCallback(() => {
    setFiltros({
      escola: null,
      grupo: null,
      data: '', // Limpar completamente a semana de consumo
      search: '',
      semana_abastecimento: '',
      ativo: true
    });
    // Marcar como inicializado para não re-preencer automaticamente após limpar
    setInicializado(true);
  }, []);

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
