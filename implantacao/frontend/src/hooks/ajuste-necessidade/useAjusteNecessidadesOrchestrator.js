import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNecessidadesAjuste } from './useNecessidadesAjuste';
import useNecessidadesCoordenacao from './useNecessidadesCoordenacao';
import { useNecessidadesLogistica } from './useNecessidadesLogistica';
import { useSemanasAbastecimento } from '../useSemanasAbastecimento';
import { useSemanasConsumo } from '../useSemanasConsumo';
import toast from 'react-hot-toast';

// Hooks auxiliares
import { useAjustesLocais } from './useAjustesLocais';
import { useProdutoExtra } from './useProdutoExtra';
import { useFiltrosDinamicos } from './useFiltrosDinamicos';
import { useExclusaoNecessidade } from './useExclusaoNecessidade';
import { useGerenciamentoFiltros } from './useGerenciamentoFiltros';
import { useAcoesNecessidades } from './useAcoesNecessidades';
import { useModalProdutoExtra } from './useModalProdutoExtra';

export const useAjusteNecessidadesOrchestrator = () => {
  const { user } = useAuth();
  
  // Inicializar aba baseada no tipo de usuário
  const getInitialTab = () => {
    if (user?.tipo_de_acesso === 'coordenador') {
      return 'coordenacao';
    }
    return 'nutricionista';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab());

  // Hooks para nutricionista
  const {
    necessidades: necessidadesNutricionista,
    escolas,
    grupos,
    filtros: filtrosNutricionista,
    loading: loadingNutricionista,
    error: errorNutricionista,
    carregarNecessidades: carregarNecessidadesNutricionista,
    salvarAjustes: salvarAjustesNutricionista,
    incluirProdutoExtra: incluirProdutoExtraNutricionista,
    liberarCoordenacao,
    buscarProdutosParaModal: buscarProdutosParaModalNutricionista,
    atualizarFiltros: atualizarFiltrosNutricionista,
    limparFiltros: limparFiltrosNutricionista,
    carregarEscolas: carregarEscolasNutricionista,
    carregarGrupos: carregarGruposNutricionista,
    exportarXLSX: exportarXLSXNutricionista,
    exportarPDF: exportarPDFNutricionista
  } = useNecessidadesAjuste();

  // Hooks para coordenação
  const {
    necessidades: necessidadesCoordenacao,
    nutricionistas,
    escolas: escolasCoordenacao,
    grupos: gruposCoordenacao,
    filtros: filtrosCoordenacao,
    loading: loadingCoordenacao,
    error: errorCoordenacao,
    carregarNecessidades: carregarNecessidadesCoordenacao,
    carregarNutricionistas,
    salvarAjustes: salvarAjustesCoordenacao,
    liberarParaLogistica,
    confirmarNutri,
    confirmarFinal,
    buscarProdutosParaModal: buscarProdutosParaModalCoordenacao,
    incluirProdutoExtra: incluirProdutoExtraCoordenacao,
    atualizarFiltros: atualizarFiltrosCoordenacao,
    limparFiltros: limparFiltrosCoordenacao,
    carregarEscolas: carregarEscolasCoordenacao,
    carregarGrupos: carregarGruposCoordenacao,
    exportarXLSX: exportarXLSXCoordenacao,
    exportarPDF: exportarPDFCoordenacao
  } = useNecessidadesCoordenacao();

  // Hooks para logística
  const {
    necessidades: necessidadesLogistica,
    escolas: escolasLogistica,
    grupos: gruposLogistica,
    filtros: filtrosLogistica,
    loading: loadingLogistica,
    error: errorLogistica,
    carregarNecessidades: carregarNecessidadesLogistica,
    salvarAjustes: salvarAjustesLogistica,
    enviarParaNutricionista,
    buscarProdutosParaModal: buscarProdutosParaModalLogistica,
    incluirProdutoExtra: incluirProdutoExtraLogistica,
    atualizarFiltros: atualizarFiltrosLogistica,
    limparFiltros: limparFiltrosLogistica,
    carregarEscolas: carregarEscolasLogistica,
    carregarGrupos: carregarGruposLogistica
  } = useNecessidadesLogistica();

  // Hooks para semanas
  const { opcoes: opcoesSemanasAbastecimento } = useSemanasAbastecimento();
  const { opcoes: opcoesSemanasConsumo } = useSemanasConsumo(null, false, { aba: activeTab });

  // Dados baseados na aba ativa
  const getActiveData = () => {
    if (activeTab === 'nutricionista') {
      return { necessidades: necessidadesNutricionista, filtros: filtrosNutricionista, loading: loadingNutricionista, error: errorNutricionista };
    } else if (activeTab === 'coordenacao') {
      return { necessidades: necessidadesCoordenacao, filtros: filtrosCoordenacao, loading: loadingCoordenacao, error: errorCoordenacao };
    } else if (activeTab === 'logistica') {
      return { necessidades: necessidadesLogistica, filtros: filtrosLogistica, loading: loadingLogistica, error: errorLogistica };
    }
  };
  
  const { necessidades, filtros, loading, error } = getActiveData();

  // Hook para ajustes locais
  const {
    ajustesLocais,
    necessidadeAtual,
    setNecessidadeAtual,
    buscaProduto,
    setBuscaProduto,
    necessidadesFiltradas,
    handleAjusteChange,
    limparAjustesLocais
  } = useAjustesLocais(necessidades, activeTab);

  // Hook para produto extra
  const {
    modalProdutoExtraAberto,
    setModalProdutoExtraAberto,
    produtosDisponiveis,
    setProdutosDisponiveis,
    produtosSelecionados,
    setProdutosSelecionados,
    searchProduto,
    setSearchProduto,
    handleToggleProduto,
    handleSelecionarTodos,
    handleDesmarcarTodos,
    handleFecharModal
  } = useProdutoExtra();

  // Hook para gerenciamento de filtros
  const {
    loadingSemanaAbastecimento,
    handleFiltroChange,
    createHandleLimparFiltros
  } = useGerenciamentoFiltros({
    activeTab,
    atualizarFiltrosNutricionista,
    atualizarFiltrosCoordenacao,
    atualizarFiltrosLogistica
  });

  // Hook para filtros dinâmicos
  useFiltrosDinamicos(
    activeTab,
    filtros,
    carregarGruposNutricionista,
    carregarGruposCoordenacao,
    carregarGruposLogistica,
    carregarEscolasNutricionista,
    carregarEscolasCoordenacao,
    carregarEscolasLogistica
  );

  // Hook para exclusão
  const handleCarregarNecessidades = useCallback(() => {
    if (activeTab === 'nutricionista') {
      if (!filtros.escola_id || !filtros.grupo || !filtros.semana_consumo) {
        toast.error('Preencha todos os filtros obrigatórios');
        return;
      }
      carregarNecessidadesNutricionista();
    } else if (activeTab === 'coordenacao') {
      if (!filtros.escola_id && !filtros.nutricionista_id && !filtros.grupo && !filtros.semana_consumo && !filtros.semana_abastecimento) {
        toast.error('Selecione ao menos um filtro para buscar');
        return;
      }
      carregarNecessidadesCoordenacao();
    } else if (activeTab === 'logistica') {
      if (!filtros.escola_id && !filtros.grupo && !filtros.semana_consumo && !filtros.semana_abastecimento) {
        toast.error('Selecione ao menos um filtro para buscar');
        return;
      }
      carregarNecessidadesLogistica();
    }
  }, [activeTab, filtros, carregarNecessidadesNutricionista, carregarNecessidadesCoordenacao, carregarNecessidadesLogistica]);

  const {
    showDeleteConfirmModal,
    produtoToDelete,
    handleExcluirNecessidade,
    handleConfirmDelete,
    handleCloseDeleteModal
  } = useExclusaoNecessidade(handleCarregarNecessidades);

  // Hook para ações principais
  const { handleSalvarAjustes, handleLiberarCoordenacao } = useAcoesNecessidades({
    activeTab,
    necessidadeAtual,
    necessidades,
    ajustesLocais,
    filtros,
    salvarAjustesNutricionista,
    salvarAjustesCoordenacao,
    salvarAjustesLogistica,
    liberarCoordenacao,
    liberarParaLogistica,
    confirmarFinal,
    enviarParaNutricionista,
    handleCarregarNecessidades,
    limparAjustesLocais,
    atualizarFiltrosNutricionista,
    atualizarFiltrosCoordenacao,
    atualizarFiltrosLogistica
  });

  // Hook para modal de produto extra
  const {
    handleAbrirModalProdutoExtra,
    handleIncluirProdutosExtra,
    handleSearchProduto
  } = useModalProdutoExtra({
    activeTab,
    filtros,
    necessidadeAtual,
    buscarProdutosParaModalNutricionista,
    buscarProdutosParaModalCoordenacao,
    buscarProdutosParaModalLogistica,
    incluirProdutoExtraNutricionista,
    incluirProdutoExtraCoordenacao,
    incluirProdutoExtraLogistica,
    handleCarregarNecessidades,
    produtosDisponiveis,
    setProdutosDisponiveis,
    modalProdutoExtraAberto,
    setModalProdutoExtraAberto,
    produtosSelecionados,
    setProdutosSelecionados,
    searchProduto,
    setSearchProduto
  });

  // Carregar nutricionistas quando aba de coordenação for ativada
  useEffect(() => {
    if (activeTab === 'coordenacao') {
      carregarNutricionistas();
    }
  }, [activeTab, carregarNutricionistas]);

  // Limpar filtros quando muda de aba
  useEffect(() => {
    if (activeTab === 'nutricionista') {
      atualizarFiltrosCoordenacao({
        escola_id: null,
        grupo: null,
        semana_consumo: null,
        semana_abastecimento: null,
        nutricionista_id: null
      });
      atualizarFiltrosLogistica({
        escola_id: null,
        grupo: null,
        semana_consumo: null,
        semana_abastecimento: null
      });
    } else if (activeTab === 'coordenacao') {
      atualizarFiltrosNutricionista({
        escola_id: null,
        grupo: null,
        semana_consumo: null,
        semana_abastecimento: null
      });
      atualizarFiltrosLogistica({
        escola_id: null,
        grupo: null,
        semana_consumo: null,
        semana_abastecimento: null
      });
    } else if (activeTab === 'logistica') {
      atualizarFiltrosNutricionista({
        escola_id: null,
        grupo: null,
        semana_consumo: null,
        semana_abastecimento: null
      });
      atualizarFiltrosCoordenacao({
        escola_id: null,
        grupo: null,
        semana_consumo: null,
        semana_abastecimento: null,
        nutricionista_id: null
      });
    }
  }, [activeTab, atualizarFiltrosCoordenacao, atualizarFiltrosNutricionista, atualizarFiltrosLogistica]);

  // Handler para limpar filtros (com recarregamento de escolas/grupos)
  const handleLimparFiltros = useCallback(() => {
    const handler = createHandleLimparFiltros({
      limparFiltrosNutricionista,
      limparFiltrosCoordenacao,
      limparFiltrosLogistica,
      carregarEscolasNutricionista,
      carregarGruposNutricionista,
      carregarEscolasCoordenacao,
      carregarGruposCoordenacao,
      carregarEscolasLogistica,
      carregarGruposLogistica
    });
    handler();
  }, [createHandleLimparFiltros, limparFiltrosNutricionista, limparFiltrosCoordenacao, limparFiltrosLogistica, carregarEscolasNutricionista, carregarGruposNutricionista, carregarEscolasCoordenacao, carregarGruposCoordenacao, carregarEscolasLogistica, carregarGruposLogistica]);

  // Handlers de exportação
  const handleExportarExcel = useCallback(() => {
    if (activeTab === 'nutricionista') {
      exportarXLSXNutricionista(filtros);
    } else if (activeTab === 'coordenacao') {
      exportarXLSXCoordenacao(filtros);
    }
  }, [activeTab, filtros, exportarXLSXNutricionista, exportarXLSXCoordenacao]);

  const handleExportarPDF = useCallback(() => {
    if (activeTab === 'nutricionista') {
      exportarPDFNutricionista(filtros);
    } else if (activeTab === 'coordenacao') {
      exportarPDFCoordenacao(filtros);
    }
  }, [activeTab, filtros, exportarPDFNutricionista, exportarPDFCoordenacao]);


  return {
    // Estados
    activeTab,
    setActiveTab,
    modalProdutoExtraAberto,
    setModalProdutoExtraAberto,
    produtosDisponiveis,
    produtosSelecionados,
    searchProduto,
    ajustesLocais,
    necessidadeAtual,
    buscaProduto,
    setBuscaProduto,
    necessidades,
    filtros,
    loading,
    error,
    necessidadesFiltradas,
    
    // Contagens por aba (temporário para debug)
    contagemRegistros: {
      nutricionista: necessidadesNutricionista.length,
      coordenacao: necessidadesCoordenacao.length,
      logistica: necessidadesLogistica.length
    },
    
    // Estados de exclusão
    showDeleteConfirmModal,
    produtoToDelete,
    
    // Dados
    escolas: activeTab === 'nutricionista' ? escolas : activeTab === 'coordenacao' ? escolasCoordenacao : activeTab === 'logistica' ? escolasLogistica : [],
    grupos: activeTab === 'nutricionista' ? grupos : activeTab === 'coordenacao' ? gruposCoordenacao : activeTab === 'logistica' ? gruposLogistica : [],
    nutricionistas,
    opcoesSemanasAbastecimento,
    opcoesSemanasConsumo,
    loadingSemanaAbastecimento,
    statusAtual: necessidades.length > 0 ? necessidades[0].status : 'NEC',
    
    // Handlers
    handleCarregarNecessidades,
    handleFiltroChange,
    handleLimparFiltros,
    handleAjusteChange,
    handleExcluirNecessidade,
    handleConfirmDelete,
    handleCloseDeleteModal,
    handleSalvarAjustes,
    handleLiberarCoordenacao,
    handleAbrirModalProdutoExtra,
    handleIncluirProdutosExtra,
    handleToggleProduto,
    handleSelecionarTodos,
    handleDesmarcarTodos,
    handleExportarExcel,
    handleExportarPDF,
    handleSearchProduto,
    
    // Modal helpers
    handleCloseModalProdutoExtra: handleFecharModal,
    handleClearSearch: () => setBuscaProduto('')
  };
};
