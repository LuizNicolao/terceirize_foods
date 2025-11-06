import { useState, useEffect, useCallback, useMemo } from 'react';
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

  // Extrair escolas únicas das necessidades carregadas
  const escolasDisponiveis = useMemo(() => {
    if (!necessidades || necessidades.length === 0) {
      return escolas; // Se não há necessidades, mostrar todas as escolas
    }

    // Extrair escolas únicas das necessidades
    const escolasMap = new Map();
    
    necessidades.forEach(nec => {
      // Campos retornados pela API: escola_id, escola (nome), escola_rota
      const escolaId = nec.escola_id;
      const escolaNome = nec.escola;
      const escolaRota = nec.escola_rota;
      
      if (escolaId) {
        // Se já não existe no mapa, adicionar
        if (!escolasMap.has(escolaId)) {
          // Procurar escola completa na lista de escolas
          const escolaCompleta = escolas.find(e => e.id === escolaId || e.id === parseInt(escolaId));
          
          if (escolaCompleta) {
            escolasMap.set(escolaId, escolaCompleta);
          } else {
            // Se não encontrou na lista completa, criar objeto básico
            escolasMap.set(escolaId, {
              id: escolaId,
              nome_escola: escolaNome,
              rota: escolaRota || '',
              cidade: ''
            });
          }
        }
      } else if (escolaNome) {
        // Se não tem ID, usar nome como chave
        const chave = escolaNome.toLowerCase();
        if (!escolasMap.has(chave)) {
          // Procurar escola por nome na lista completa
          const escolaCompleta = escolas.find(e => 
            (e.nome_escola && e.nome_escola.toLowerCase() === chave) ||
            (e.nome && e.nome.toLowerCase() === chave)
          );
          
          if (escolaCompleta) {
            escolasMap.set(chave, escolaCompleta);
          } else {
            // Criar objeto básico
            escolasMap.set(chave, {
              id: null,
              nome_escola: escolaNome,
              rota: escolaRota || '',
              cidade: ''
            });
          }
        }
      }
    });

    return Array.from(escolasMap.values());
  }, [necessidades, escolas]);

  // Extrair grupos únicos das necessidades carregadas
  const gruposDisponiveis = useMemo(() => {
    if (!necessidades || necessidades.length === 0) {
      return grupos; // Se não há necessidades, mostrar todos os grupos
    }

    // Extrair grupos únicos das necessidades
    const gruposMap = new Map();
    
    necessidades.forEach(nec => {
      // Campos retornados pela API: grupo_id, grupo (nome)
      const grupoId = nec.grupo_id;
      const grupoNome = nec.grupo;
      
      if (grupoId) {
        // Se já não existe no mapa, adicionar
        if (!gruposMap.has(grupoId)) {
          // Procurar grupo completo na lista de grupos
          const grupoCompleto = grupos.find(g => g.id === grupoId || g.id === parseInt(grupoId));
          
          if (grupoCompleto) {
            gruposMap.set(grupoId, grupoCompleto);
          } else {
            // Se não encontrou na lista completa, criar objeto básico
            gruposMap.set(grupoId, {
              id: grupoId,
              nome: grupoNome
            });
          }
        }
      } else if (grupoNome) {
        // Se não tem ID, usar nome como chave
        const chave = grupoNome.toLowerCase();
        if (!gruposMap.has(chave)) {
          // Procurar grupo por nome na lista completa
          const grupoCompleto = grupos.find(g => 
            (g.nome && g.nome.toLowerCase() === chave)
          );
          
          if (grupoCompleto) {
            gruposMap.set(chave, grupoCompleto);
          } else {
            // Criar objeto básico
            gruposMap.set(chave, {
              id: null,
              nome: grupoNome
            });
          }
        }
      }
    });

    return Array.from(gruposMap.values());
  }, [necessidades, grupos]);

  return {
    // Estados
    necessidades,
    loading,
    error,
    escolas: escolasDisponiveis,
    grupos: gruposDisponiveis,
    produtos,
    percapitas,
    mediasPeriodo,
    filtros,
    produtosTabela,

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
