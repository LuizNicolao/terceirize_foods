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
    confirmarNutri,
    confirmarFinal,
    buscarProdutosParaModal: buscarProdutosParaModalCoordenacao,
    incluirProdutoExtra: incluirProdutoExtraCoordenacao,
    atualizarFiltros: atualizarFiltrosCoordenacao,
    exportarXLSX: exportarXLSXCoordenacao,
    exportarPDF: exportarPDFCoordenacao
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
      setAjustesLocais(prev => {
        // Preservar ajustes existentes e só adicionar novos produtos
        const novosAjustes = { ...prev };
        necessidades.forEach(nec => {
          // Usar chave composta (escola_id + produto_id)
          const chave = `${nec.escola_id}_${nec.produto_id}`;
          // Só inicializar se ainda não existir um valor para este produto
          if (!(chave in novosAjustes)) {
            // Usar ajuste_nutricionista se existir, senão string vazia
            const valorInicial = nec.ajuste_nutricionista ?? '';
            novosAjustes[chave] = valorInicial;
          }
        });
        return novosAjustes;
      });
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

  const handleAjusteChange = useCallback((necessidade) => {
    setAjustesLocais(prev => {
      const novosAjustes = { ...prev };
      
      // Usar chave composta (escola_id + produto_id) ao invés de apenas necessidade.id
      const chave = `${necessidade.escola_id}_${necessidade.produto_id}`;
      const valor = necessidade.valor === '' ? '' : parseFloat(necessidade.valor) || '';
      
      novosAjustes[chave] = valor;
      
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
      // Mapear todos os produtos, incluindo os que têm e não têm ajuste local
      const itens = necessidades.map(nec => {
        const chave = `${nec.escola_id}_${nec.produto_id}`;
        const ajusteLocal = ajustesLocais[chave];
        
        let valorFinal;
        
        if (ajusteLocal !== undefined && ajusteLocal !== '') {
          // Tem ajuste local (foi digitado)
          valorFinal = parseFloat(ajusteLocal) || 0;
        } else {
          // Não tem ajuste local, preservar valor existente no banco
          if (activeTab === 'nutricionista') {
            valorFinal = nec.ajuste || 0;
          } else {
            // Para coordenação, usar ajuste_coordenacao existente
            valorFinal = nec.ajuste_coordenacao || nec.ajuste_nutricionista || nec.ajuste || 0;
          }
        }

        if (activeTab === 'coordenacao') {
          return {
            id: parseInt(nec.id),
            ajuste: valorFinal
          };
        } else {
          return {
            necessidade_id: parseInt(nec.id),
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

      let resultado;
      if (activeTab === 'nutricionista') {
        // Nutri: NEC/NEC NUTRI -> NEC COORD
        if (!filtros.escola_id || !filtros.grupo) {
          toast.error('Selecione Escola e Grupo para liberar');
          return;
        }
        resultado = await liberarCoordenacao(dadosParaLiberar);
      } else {
        // Coordenação: NEC COORD -> CONF NUTRI; CONF COORD -> CONF
        const status = necessidades[0]?.status;
        if (!filtros.escola_id) {
          toast.error('Selecione uma escola para liberar na coordenação');
          return;
        }
        if (!filtros.grupo) {
          toast.error('Selecione um grupo para liberar na coordenação');
          return;
        }
        if (status === 'NEC COORD') {
          resultado = await confirmarNutri(dadosParaLiberar);
        } else if (status === 'CONF COORD') {
          resultado = await confirmarFinal([necessidadeAtual.necessidade_id]);
        } else {
          // Fallback legacy
          resultado = await liberarParaLogistica([necessidadeAtual.necessidade_id]);
        }
      }
      
      if (resultado.success) {
        let mensagem;
        if (activeTab === 'nutricionista') {
          mensagem = 'Necessidades liberadas para coordenação (NEC COORD)!';
        } else {
          const status = necessidades[0]?.status;
          mensagem = status === 'NEC COORD'
            ? 'Enviado para Nutri (CONF NUTRI)!'
            : (status === 'CONF COORD' ? 'Necessidades confirmadas (CONF)!' : 'Necessidades liberadas!');
        }
        toast.success(mensagem);
        handleCarregarNecessidades();
      }
    } catch (error) {
      console.error('Erro ao liberar para coordenação:', error);
      toast.error('Erro ao liberar para coordenação');
    }
  }, [activeTab, filtros, necessidadeAtual, liberarCoordenacao, confirmarNutri, confirmarFinal, liberarParaLogistica, handleCarregarNecessidades, necessidades]);

  const handleAbrirModalProdutoExtra = useCallback(async () => {
    if (activeTab === 'coordenacao') {
      if (!filtros.escola_id) {
        toast.error('É necessário selecionar uma escola para incluir produtos');
        return;
      }
      
      if (!filtros.grupo) {
        toast.error('É necessário selecionar um grupo para incluir produtos');
        return;
      }
    } else {
      if (!necessidadeAtual) {
        toast.error('Nenhuma necessidade selecionada');
        return;
      }
      
      if (!filtros.grupo) {
        toast.error('É necessário selecionar um grupo para incluir produtos');
        return;
      }
    }

    try {
      const buscarProdutos = activeTab === 'nutricionista' 
        ? buscarProdutosParaModalNutricionista
        : buscarProdutosParaModalCoordenacao;

      const produtos = await buscarProdutos({
        grupo: filtros.grupo,
        escola_id: filtros.escola_id,
        semana_consumo: filtros.semana_consumo,
        semana_abastecimento: filtros.semana_abastecimento
      });

      // Verificar se produtos é array (resposta direta) ou objeto com success
      const produtosLista = Array.isArray(produtos) ? produtos : (produtos.success ? produtos.data : []);
      
      if (produtosLista && produtosLista.length > 0) {
        setProdutosDisponiveis(produtosLista);
        setModalProdutoExtraAberto(true);
      } else {
        toast.error('Nenhum produto disponível encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
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

          const resultado = await incluirProduto(dadosParaIncluir);

          if (resultado) {
            sucessos++;
          } else {
            erros++;
          }
        } catch (error) {
          console.error('Erro ao incluir produto:', error);
          erros++;
        }
      }

      if (sucessos > 0) {
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
