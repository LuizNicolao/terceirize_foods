import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNecessidadesAjuste } from './useNecessidadesAjuste';
import useNecessidadesCoordenacao from './useNecessidadesCoordenacao';
import { useSemanasAbastecimento } from './useSemanasAbastecimento';
import { useSemanasConsumo } from './useSemanasConsumo';
import necessidadesService from '../services/necessidadesService';
import toast from 'react-hot-toast';

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
  const [modalProdutoExtraAberto, setModalProdutoExtraAberto] = useState(false);
  const [produtosDisponiveis, setProdutosDisponiveis] = useState([]);
  const [produtosSelecionados, setProdutosSelecionados] = useState([]);
  const [searchProduto, setSearchProduto] = useState('');
  const [ajustesLocais, setAjustesLocais] = useState({});
  const [necessidadeAtual, setNecessidadeAtual] = useState(null);
  const [buscaProduto, setBuscaProduto] = useState('');
  const [necessidadesFiltradas, setNecessidadesFiltradas] = useState([]);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [produtoToDelete, setProdutoToDelete] = useState(null);

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
    exportarXLSX: exportarXLSXNutricionista,
    exportarPDF: exportarPDFNutricionista
  } = useNecessidadesAjuste();

  // Hooks para coordenação
  const {
    necessidades: necessidadesCoordenacao,
    nutricionistas,
    filtros: filtrosCoordenacao,
    loading: loadingCoordenacao,
    error: errorCoordenacao,
    carregarNecessidades: carregarNecessidadesCoordenacao,
    carregarNutricionistas,
    salvarAjustes: salvarAjustesCoordenacao,
    liberarParaLogistica,
    buscarProdutosParaModal: buscarProdutosParaModalCoordenacao,
    incluirProdutoExtra: incluirProdutoExtraCoordenacao,
    atualizarFiltros: atualizarFiltrosCoordenacao
  } = useNecessidadesCoordenacao();

  // Hooks para semanas
  const { opcoes: opcoesSemanasAbastecimento } = useSemanasAbastecimento();
  const { opcoes: opcoesSemanasConsumo } = useSemanasConsumo();

  // Dados baseados na aba ativa
  const necessidades = activeTab === 'nutricionista' ? necessidadesNutricionista : necessidadesCoordenacao;
  const filtros = activeTab === 'nutricionista' ? filtrosNutricionista : filtrosCoordenacao;
  const loading = activeTab === 'nutricionista' ? loadingNutricionista : loadingCoordenacao;
  const error = activeTab === 'nutricionista' ? errorNutricionista : errorCoordenacao;

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
    } else if (activeTab === 'coordenacao') {
      atualizarFiltrosNutricionista({
        escola_id: null,
        grupo: null,
        semana_consumo: null,
        semana_abastecimento: null
      });
    }
  }, [activeTab, atualizarFiltrosCoordenacao, atualizarFiltrosNutricionista]);

  // Inicializar ajustes locais quando necessidades carregarem
  useEffect(() => {
    if (necessidades.length > 0) {
      const ajustesIniciais = {};
      necessidades.forEach(nec => {
        // Sempre inicializar em branco para nutricionista e coordenação
        ajustesIniciais[nec.id] = '';
      });
      setAjustesLocais(ajustesIniciais);
      setNecessidadeAtual(necessidades[0]);
      setNecessidadesFiltradas(necessidades);
    }
  }, [necessidades, activeTab]);

  // Filtrar necessidades baseado na busca
  useEffect(() => {
    if (necessidades.length > 0) {
      if (buscaProduto.trim() === '') {
        setNecessidadesFiltradas(necessidades);
      } else {
        const filtradas = necessidades.filter(nec => 
          nec.produto.toLowerCase().includes(buscaProduto.toLowerCase()) ||
          (nec.codigo_teknisa && nec.codigo_teknisa.toLowerCase().includes(buscaProduto.toLowerCase()))
        );
        setNecessidadesFiltradas(filtradas);
      }
    }
  }, [necessidades, buscaProduto]);

  // Handlers
  const handleCarregarNecessidades = useCallback(() => {
    if (activeTab === 'nutricionista') {
      if (!filtros.escola_id || !filtros.grupo || !filtros.semana_consumo) {
        toast.error('Preencha todos os filtros obrigatórios');
        return;
      }
      carregarNecessidadesNutricionista();
    } else {
      if (!filtros.escola_id && !filtros.nutricionista_id && !filtros.grupo && !filtros.semana_consumo && !filtros.semana_abastecimento) {
        toast.error('Selecione ao menos um filtro para buscar');
        return;
      }
      carregarNecessidadesCoordenacao();
    }
  }, [activeTab, filtros, carregarNecessidadesNutricionista, carregarNecessidadesCoordenacao]);

  const handleFiltroChange = useCallback((campo, valor) => {
    if (activeTab === 'nutricionista') {
      atualizarFiltrosNutricionista({ [campo]: valor });
    } else {
      atualizarFiltrosCoordenacao({ [campo]: valor });
    }
  }, [activeTab, atualizarFiltrosNutricionista, atualizarFiltrosCoordenacao]);

  const handleAjusteChange = useCallback((necessidadeId, valor) => {
    setAjustesLocais(prev => {
      const novosAjustes = { ...prev };
      
      // Apenas atualizar o valor do produto que foi alterado
      novosAjustes[necessidadeId] = valor === '' ? '' : parseFloat(valor) || '';
      
      return novosAjustes;
    });
  }, []);

  // Iniciar processo de exclusão (abre modal)
  const handleExcluirNecessidade = useCallback((necessidade) => {
    setProdutoToDelete(necessidade);
    setShowDeleteConfirmModal(true);
  }, []);

  // Confirmar exclusão
  const handleConfirmDelete = useCallback(async () => {
    if (!produtoToDelete) return;

    try {
      const response = await necessidadesService.deletarProdutoAjuste(produtoToDelete.id);
      
      if (response.success) {
        toast.success('Produto excluído com sucesso!');
        setShowDeleteConfirmModal(false);
        setProdutoToDelete(null);
        handleCarregarNecessidades();
      } else {
        toast.error(response.message || 'Erro ao excluir produto');
      }
    } catch (error) {
      console.error('Erro ao excluir necessidade:', error);
      toast.error('Erro ao excluir produto');
    }
  }, [produtoToDelete, handleCarregarNecessidades]);

  // Fechar modal de exclusão
  const handleCloseDeleteModal = useCallback(() => {
    setShowDeleteConfirmModal(false);
    setProdutoToDelete(null);
  }, []);

  const handleSalvarAjustes = useCallback(async () => {
    if (!necessidadeAtual) {
      toast.error('Nenhuma necessidade selecionada');
      return;
    }

    try {
      // Buscar valor original para cada necessidade
      const necessidadesMap = {};
      necessidades.forEach(nec => {
        necessidadesMap[nec.id] = nec;
      });

      const itens = Object.entries(ajustesLocais)
        .filter(([necessidadeId]) => {
          return necessidadesMap[necessidadeId]; // Apenas necessidades válidas
        })
        .map(([necessidadeId, ajuste]) => {
          const nec = necessidadesMap[necessidadeId];
          const valor = parseFloat(ajuste);
          
          // Se não tem valor no ajuste local, usar o valor original
          let valorFinal;
          if (isNaN(valor) || valor <= 0) {
            // Para nutricionista: usar ajuste (quantidade gerada)
            // Para coordenação: usar ajuste_nutricionista
            if (activeTab === 'nutricionista') {
              valorFinal = nec.ajuste || 0;
            } else {
              valorFinal = nec.ajuste_nutricionista || nec.ajuste || 0;
            }
          } else {
            valorFinal = valor;
          }

          if (activeTab === 'coordenacao') {
            return {
              id: parseInt(necessidadeId),
              ajuste: valorFinal
            };
          } else {
            return {
              necessidade_id: parseInt(necessidadeId),
              ajuste_nutricionista: valorFinal
            };
          }
        });

      const dadosParaSalvar = {
        escola_id: filtros.escola_id,
        grupo: filtros.grupo,
        periodo: {
          consumo_de: filtros.consumo_de,
          consumo_ate: filtros.consumo_ate
        },
        itens
      };

      const resultado = activeTab === 'nutricionista' 
        ? await salvarAjustesNutricionista(dadosParaSalvar)
        : await salvarAjustesCoordenacao(itens);
      
      if (resultado.success) {
        toast.success('Ajustes salvos com sucesso!');
        setAjustesLocais({});
        handleCarregarNecessidades();
      }
    } catch (error) {
      console.error('Erro ao salvar ajustes:', error);
      toast.error('Erro ao salvar ajustes');
    }
  }, [activeTab, ajustesLocais, filtros, necessidadeAtual, salvarAjustesNutricionista, salvarAjustesCoordenacao, handleCarregarNecessidades]);

  const handleLiberarCoordenacao = useCallback(async () => {
    if (!necessidadeAtual) {
      toast.error('Nenhuma necessidade selecionada');
      return;
    }

    try {
      const dadosParaLiberar = {
        escola_id: filtros.escola_id,
        grupo: filtros.grupo,
        periodo: {
          consumo_de: filtros.consumo_de,
          consumo_ate: filtros.consumo_ate
        }
      };

      const resultado = activeTab === 'nutricionista' 
        ? await liberarCoordenacao(dadosParaLiberar)
        : await liberarParaLogistica([necessidadeAtual.necessidade_id]);
      
      if (resultado.success) {
        const mensagem = activeTab === 'nutricionista' 
          ? 'Necessidades liberadas para coordenação!'
          : 'Necessidades liberadas para logística!';
        toast.success(mensagem);
        handleCarregarNecessidades();
      }
    } catch (error) {
      console.error('Erro ao liberar para coordenação:', error);
      toast.error('Erro ao liberar para coordenação');
    }
  }, [activeTab, filtros, necessidadeAtual, liberarCoordenacao, liberarParaLogistica, handleCarregarNecessidades]);

  const handleAbrirModalProdutoExtra = useCallback(async () => {
    console.log('🔍 [DEBUG] handleAbrirModalProdutoExtra chamado');
    console.log('🔍 [DEBUG] activeTab:', activeTab);
    console.log('🔍 [DEBUG] filtros:', filtros);
    console.log('🔍 [DEBUG] necessidadeAtual:', necessidadeAtual);

    if (activeTab === 'coordenacao') {
      console.log('🔍 [DEBUG] Entrou no fluxo de coordenação');
      if (!filtros.escola_id) {
        console.log('❌ [DEBUG] Falta escola_id');
        toast.error('É necessário selecionar uma escola para incluir produtos');
        return;
      }
      
      if (!filtros.grupo) {
        console.log('❌ [DEBUG] Falta grupo');
        toast.error('É necessário selecionar um grupo para incluir produtos');
        return;
      }
      console.log('✅ [DEBUG] Validações passaram para coordenação');
    } else {
      console.log('🔍 [DEBUG] Entrou no fluxo de nutricionista');
      if (!necessidadeAtual) {
        console.log('❌ [DEBUG] Falta necessidadeAtual');
        toast.error('Nenhuma necessidade selecionada');
        return;
      }
      
      if (!filtros.grupo) {
        console.log('❌ [DEBUG] Falta grupo');
        toast.error('É necessário selecionar um grupo para incluir produtos');
        return;
      }
      console.log('✅ [DEBUG] Validações passaram para nutricionista');
    }

    try {
      const buscarProdutos = activeTab === 'nutricionista' 
        ? buscarProdutosParaModalNutricionista
        : buscarProdutosParaModalCoordenacao;

      console.log('🔍 [DEBUG] Buscando produtos com filtros:', {
        grupo: filtros.grupo,
        escola_id: filtros.escola_id,
        semana_consumo: filtros.semana_consumo,
        semana_abastecimento: filtros.semana_abastecimento
      });

      const produtos = await buscarProdutos({
        grupo: filtros.grupo,
        escola_id: filtros.escola_id,
        semana_consumo: filtros.semana_consumo,
        semana_abastecimento: filtros.semana_abastecimento
      });

      console.log('🔍 [DEBUG] Resposta da busca:', produtos);

      // Verificar se produtos é array (resposta direta) ou objeto com success
      const produtosLista = Array.isArray(produtos) ? produtos : (produtos.success ? produtos.data : []);
      
      if (produtosLista && produtosLista.length > 0) {
        console.log('✅ [DEBUG] Produtos encontrados:', produtosLista.length);
        setProdutosDisponiveis(produtosLista);
        setModalProdutoExtraAberto(true);
        console.log('✅ [DEBUG] Modal aberto');
      } else {
        console.error('❌ [DEBUG] Nenhum produto encontrado', produtos);
        toast.error('Nenhum produto disponível encontrado');
      }
    } catch (error) {
      console.error('❌ [DEBUG] Erro ao buscar produtos:', error);
      toast.error('Erro ao buscar produtos disponíveis');
    }
  }, [activeTab, filtros, necessidadeAtual, buscarProdutosParaModalNutricionista, buscarProdutosParaModalCoordenacao]);

  const handleIncluirProdutosExtra = useCallback(async () => {
    if (produtosSelecionados.length === 0) {
      toast.error('Selecione pelo menos um produto');
      return;
    }

    try {
      let sucessos = 0;
      let erros = 0;

      const incluirProduto = activeTab === 'nutricionista'
        ? incluirProdutoExtraNutricionista
        : incluirProdutoExtraCoordenacao;

      for (const produto of produtosSelecionados) {
        try {
          const dadosParaIncluir = {
            escola_id: filtros.escola_id,
            grupo: filtros.grupo,
            periodo: {
              consumo_de: filtros.consumo_de,
              consumo_ate: filtros.consumo_ate
            },
            produto_id: produto.produto_id
          };

          console.log('🔍 [DEBUG] Incluindo produto:', produto.produto_nome);
          console.log('🔍 [DEBUG] Dados para incluir:', dadosParaIncluir);

          const resultado = await incluirProduto(dadosParaIncluir);
          
          console.log('🔍 [DEBUG] Resultado:', resultado);

          if (resultado.success) {
            sucessos++;
            console.log('✅ [DEBUG] Produto incluído com sucesso');
          } else {
            erros++;
            console.error('❌ [DEBUG] Falhou ao incluir:', resultado);
          }
        } catch (error) {
          console.error(`❌ [DEBUG] Erro ao incluir produto ${produto.produto_nome}:`, error);
          erros++;
        }
      }

      if (sucessos > 0) {
        toast.success(`${sucessos} produto(s) incluído(s) com sucesso!`);
        setModalProdutoExtraAberto(false);
        setProdutosSelecionados([]);
        setSearchProduto('');
        handleCarregarNecessidades();
      }

      if (erros > 0) {
        toast.error(`${erros} produto(s) não puderam ser incluídos`);
      }
    } catch (error) {
      console.error('Erro ao incluir produtos extras:', error);
      toast.error('Erro ao incluir produtos extras');
    }
  }, [activeTab, produtosSelecionados, filtros, incluirProdutoExtraNutricionista, incluirProdutoExtraCoordenacao, handleCarregarNecessidades]);

  const handleToggleProduto = useCallback((produto) => {
    setProdutosSelecionados(prev => {
      const jaSelecionado = prev.find(p => p.produto_id === produto.produto_id);
      if (jaSelecionado) {
        return prev.filter(p => p.produto_id !== produto.produto_id);
      } else {
        return [...prev, produto];
      }
    });
  }, []);

  const handleSelecionarTodos = useCallback(() => {
    setProdutosSelecionados(produtosDisponiveis);
  }, [produtosDisponiveis]);

  const handleDesmarcarTodos = useCallback(() => {
    setProdutosSelecionados([]);
  }, []);

  const handleExportarExcel = useCallback(() => {
    const exportFunc = activeTab === 'nutricionista' ? exportarXLSXNutricionista : null;
    if (exportFunc) {
      exportFunc(filtros);
    }
  }, [activeTab, filtros, exportarXLSXNutricionista]);

  const handleExportarPDF = useCallback(() => {
    const exportFunc = activeTab === 'nutricionista' ? exportarPDFNutricionista : null;
    if (exportFunc) {
      exportFunc(filtros);
    }
  }, [activeTab, filtros, exportarPDFNutricionista]);

  const handleSearchProduto = useCallback(async (search) => {
    setSearchProduto(search);
    try {
      const buscarProdutos = activeTab === 'nutricionista' 
        ? buscarProdutosParaModalNutricionista
        : buscarProdutosParaModalCoordenacao;

      const produtos = await buscarProdutos({
        grupo: filtros.grupo,
        escola_id: filtros.escola_id,
        semana_consumo: filtros.semana_consumo,
        semana_abastecimento: filtros.semana_abastecimento,
        search
      });

      if (produtos.success) {
        setProdutosDisponiveis(produtos.data);
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  }, [activeTab, filtros, buscarProdutosParaModalNutricionista, buscarProdutosParaModalCoordenacao]);

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
      
      // Estados de exclusão
      showDeleteConfirmModal,
      produtoToDelete,
      
      // Dados
      escolas,
      grupos,
      nutricionistas,
      opcoesSemanasAbastecimento,
      opcoesSemanasConsumo,
      statusAtual: necessidades.length > 0 ? necessidades[0].status : 'NEC',
      
      // Handlers
      handleCarregarNecessidades,
      handleFiltroChange,
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
      handleCloseModalProdutoExtra: () => {
        setModalProdutoExtraAberto(false);
        setProdutosSelecionados([]);
        setSearchProduto('');
      },
      handleClearSearch: () => setBuscaProduto('')
    };
  };
