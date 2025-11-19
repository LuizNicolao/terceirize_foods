import { useState, useEffect, useCallback } from 'react';
import { useNecessidadesData } from './useNecessidadesData';
import { useNecessidadesCalculos } from './useNecessidadesCalculos';
import { useNecessidadesTabela } from './useNecessidadesTabela';
import { useNecessidadesCRUD } from './useNecessidadesCRUD';
import necessidadesService from '../../services/necessidadesService';
import toast from 'react-hot-toast';

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

  // Wrapper para exportar XLSX - busca todos os itens filtrados do backend, não apenas os paginados
  const exportarXLSX = useCallback(async () => {
    try {
      // Preparar filtros para o backend (converter formato de objeto para valores simples)
      const filtrosExport = {};
      
      if (filtros.escola) {
        filtrosExport.escola_id = typeof filtros.escola === 'object' ? filtros.escola.id : filtros.escola;
      }
      
      if (filtros.grupo) {
        filtrosExport.grupo = typeof filtros.grupo === 'object' ? filtros.grupo.nome || filtros.grupo.id : filtros.grupo;
      }
      
      if (filtros.semana_abastecimento) {
        filtrosExport.semana_abastecimento = filtros.semana_abastecimento;
      }
      
      if (filtros.data) {
        filtrosExport.semana_consumo = filtros.data;
      }
      
      // Usar o endpoint do backend que retorna todos os itens filtrados (sem paginação)
      const response = await necessidadesService.exportarXLSX(filtrosExport);
      
      if (response.success) {
        // Criar blob e fazer download
        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = response.filename || `necessidades_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('Arquivo XLSX exportado com sucesso!');
      } else {
        toast.error('Erro ao exportar arquivo XLSX');
      }
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      toast.error('Erro ao exportar arquivo XLSX');
    }
  }, [filtros]);

  // Wrapper para exportar PDF - busca todos os itens filtrados do backend, não apenas os paginados
  const exportarPDF = useCallback(async () => {
    try {
      // Preparar filtros para o backend (converter formato de objeto para valores simples)
      const filtrosExport = {};
      
      if (filtros.escola) {
        filtrosExport.escola_id = typeof filtros.escola === 'object' ? filtros.escola.id : filtros.escola;
      }
      
      if (filtros.grupo) {
        filtrosExport.grupo = typeof filtros.grupo === 'object' ? filtros.grupo.nome || filtros.grupo.id : filtros.grupo;
      }
      
      if (filtros.semana_abastecimento) {
        filtrosExport.semana_abastecimento = filtros.semana_abastecimento;
      }
      
      if (filtros.data) {
        filtrosExport.semana_consumo = filtros.data;
      }
      
      // Usar o endpoint do backend que retorna todos os itens filtrados (sem paginação)
      const response = await necessidadesService.exportarPDF(filtrosExport);
      
      if (response.success) {
        // Criar blob e fazer download
        const blob = new Blob([response.data], {
          type: 'application/pdf'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = response.filename || `necessidades_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('Arquivo PDF exportado com sucesso!');
      } else {
        toast.error('Erro ao exportar arquivo PDF');
      }
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar arquivo PDF');
    }
  }, [filtros]);

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
