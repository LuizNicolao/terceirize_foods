import { useState, useCallback } from 'react';

// Função para obter a data atual no formato YYYY-MM-DD (sem problemas de fuso horário)
const obterDataAtual = () => {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
};

export const useNecessidadesFilters = () => {
  const [filtros, setFiltros] = useState({
    escola: null,
    grupo: null,
    data: '', // Data vazia por padrão
    search: '',
    semana_abastecimento: '',
    ativo: true
  });

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
      data: '', // Data vazia ao limpar filtros
      search: '',
      semana_abastecimento: '',
      ativo: true
    });
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
