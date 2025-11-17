import { useState, useEffect, useCallback } from 'react';
import { useNecessidadesData } from './useNecessidadesData';
import { useNecessidadesCalculos } from './useNecessidadesCalculos';
import { useNecessidadesTabela } from './useNecessidadesTabela';
import { useNecessidadesExport } from './useNecessidadesExport';
import { useNecessidadesCRUD } from './useNecessidadesCRUD';

/**
 * Hook principal (orchestrator) para gerenciar necessidades
 * Centraliza a lógica delegando responsabilidades para hooks auxiliares
 */
export const useNecessidades = () => {
  // Filtros selecionados
  const [filtros, setFiltros] = useState({
    escola: null,
    grupo: null,
    data: '' // Inicializar vazio para semana de consumo
  });

  // Hook de dados
  const {
    necessidades,
    setNecessidades,
    loading,
    setLoading,
    error,
    escolas,
    grupos,
    produtos,
    percapitas,
    pagination,
    carregarNecessidades,
    carregarEscolas,
    carregarGrupos,
    carregarProdutosPorGrupo
  } = useNecessidadesData();

  // Hook de cálculos
  const {
    mediasPeriodo,
    calcularMediasPorPeriodo,
    limparMediasPeriodo
  } = useNecessidadesCalculos();

  // Hook de tabela
  const {
    produtosTabela,
    inicializarTabelaProdutos,
    atualizarFrequencia,
    atualizarAjuste
  } = useNecessidadesTabela();

  // Hook de exportação
  const {
    exportarXLSX: exportarXLSXBase,
    exportarPDF: exportarPDFBase
  } = useNecessidadesExport();

  // Hook de CRUD
  const {
    gerarNecessidade: gerarNecessidadeBase,
    criarNecessidade,
    atualizarNecessidade,
    deletarNecessidade
  } = useNecessidadesCRUD(carregarNecessidades, setLoading);

  // Wrapper para gerar necessidade com filtros e produtosTabela
  const gerarNecessidade = useCallback(async (dadosExternos = null) => {
    return await gerarNecessidadeBase(filtros, produtosTabela, dadosExternos);
  }, [filtros, produtosTabela, gerarNecessidadeBase]);

  // Wrapper para exportar XLSX
  const exportarXLSX = useCallback(() => {
    exportarXLSXBase(necessidades);
  }, [necessidades, exportarXLSXBase]);

  // Wrapper para exportar PDF
  const exportarPDF = useCallback(() => {
    exportarPDFBase(necessidades, filtros);
  }, [necessidades, filtros, exportarPDFBase]);

  // Atualizar filtros
  const atualizarFiltros = useCallback((novosFiltros) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
  }, []);

  // Efeitos
  useEffect(() => {
    carregarEscolas();
    carregarGrupos();
  }, [carregarEscolas, carregarGrupos]);

  useEffect(() => {
    if (filtros.grupo) {
      carregarProdutosPorGrupo(filtros.grupo.id);
    }
  }, [filtros.grupo, carregarProdutosPorGrupo]);

  useEffect(() => {
    if (filtros.escola && filtros.data) {
      calcularMediasPorPeriodo(filtros.escola.id, filtros.data);
    }
  }, [filtros.escola, filtros.data, calcularMediasPorPeriodo]);

  useEffect(() => {
    inicializarTabelaProdutos(produtos, percapitas, mediasPeriodo);
  }, [produtos, percapitas, mediasPeriodo, inicializarTabelaProdutos]);

  return {
    // Estados
    necessidades,
    loading,
    error,
    escolas,
    grupos,
    produtos,
    percapitas,
    mediasPeriodo,
    filtros,
    produtosTabela,
    pagination,

    // Ações
    carregarNecessidades,
    carregarEscolas,
    carregarGrupos,
    carregarProdutosPorGrupo,
    calcularMediasPorPeriodo,
    limparMediasPeriodo,
    atualizarFiltros,
    inicializarTabelaProdutos,
    atualizarFrequencia,
    atualizarAjuste,
    gerarNecessidade,
    criarNecessidade,
    atualizarNecessidade,
    deletarNecessidade,
    exportarXLSX,
    exportarPDF
  };
};
