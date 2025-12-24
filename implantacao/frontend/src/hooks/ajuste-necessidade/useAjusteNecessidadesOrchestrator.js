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
  const [modalImpressaoAberto, setModalImpressaoAberto] = useState(false);

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

  // Hooks para semanas - passar filtros dinâmicos baseados na escola selecionada
  const { opcoes: opcoesSemanasAbastecimento } = useSemanasAbastecimento();
  const filtrosSemanasConsumo = {
    aba: activeTab,
    ...(filtros.escola_id && { escola_id: filtros.escola_id })
  };
  const { opcoes: opcoesSemanasConsumo } = useSemanasConsumo(null, false, filtrosSemanasConsumo);

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

  // Estado para produtos origem selecionados na logística
  const [selectedProdutosOrigemLogistica, setSelectedProdutosOrigemLogistica] = useState({});

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
  const handleCarregarNecessidades = useCallback(async () => {
    if (activeTab === 'nutricionista') {
      if (!filtros.escola_id || !filtros.semana_consumo) {
        toast.error('Preencha os filtros obrigatórios: Escola e Semana de Consumo');
        return;
      }
      return await carregarNecessidadesNutricionista();
    } else if (activeTab === 'coordenacao') {
      if (!filtros.semana_consumo) {
        toast.error('Preencha o filtro obrigatório: Semana de Consumo');
        return;
      }
      return await carregarNecessidadesCoordenacao();
    } else if (activeTab === 'logistica') {
      if (!filtros.semana_consumo) {
        toast.error('Preencha o filtro obrigatório: Semana de Consumo');
        return;
      }
      return await carregarNecessidadesLogistica();
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
  const { handleSalvarAjustes, handleLiberarCoordenacao, progressoModal } = useAcoesNecessidades({
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
    atualizarFiltrosLogistica,
    limparFiltrosLogistica,
    selectedProdutosOrigemLogistica
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

  // Carregar dados quando aba for ativada (evita múltiplas requisições desnecessárias)
  useEffect(() => {
    if (activeTab === 'nutricionista') {
      // Carregar escolas e grupos apenas da aba de nutricionista
      carregarEscolasNutricionista();
      carregarGruposNutricionista();
      // Limpar coordenação e logística (inclui filtros e necessidades)
      limparFiltrosCoordenacao();
      limparFiltrosLogistica();
    } else if (activeTab === 'coordenacao') {
      // Carregar nutricionistas, escolas e grupos apenas da aba de coordenação
      carregarNutricionistas();
      carregarEscolasCoordenacao();
      carregarGruposCoordenacao();
      // Limpar nutricionista e logística (inclui filtros e necessidades)
      limparFiltrosNutricionista();
      limparFiltrosLogistica();
    } else if (activeTab === 'logistica') {
      // Carregar escolas e grupos apenas da aba de logística
      carregarEscolasLogistica();
      carregarGruposLogistica();
      // Limpar nutricionista e coordenação (inclui filtros e necessidades)
      limparFiltrosNutricionista();
      limparFiltrosCoordenacao();
    }
  }, [
    activeTab,
    carregarNutricionistas,
    carregarEscolasNutricionista,
    carregarGruposNutricionista,
    carregarEscolasCoordenacao,
    carregarGruposCoordenacao,
    carregarEscolasLogistica,
    carregarGruposLogistica,
    limparFiltrosCoordenacao,
    limparFiltrosNutricionista,
    limparFiltrosLogistica
  ]);

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
      modalImpressaoAberto,
      setModalImpressaoAberto,
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
      
      // Estados para logística
      setSelectedProdutosOrigemLogistica,
      
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
      handleAbrirModalImpressao: () => setModalImpressaoAberto(true),
      handleFecharModalImpressao: () => setModalImpressaoAberto(false),
      
      // Modal helpers
    handleCloseModalProdutoExtra: handleFecharModal,
      handleClearSearch: () => setBuscaProduto(''),
      
      // Modal de progresso (logística)
      progressoModal
    };
  };
