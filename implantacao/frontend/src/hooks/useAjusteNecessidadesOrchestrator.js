import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNecessidadesAjuste } from './useNecessidadesAjuste';
import useNecessidadesCoordenacao from './useNecessidadesCoordenacao';
import { useNecessidadesLogistica } from './useNecessidadesLogistica';
import { useSemanasAbastecimento } from './useSemanasAbastecimento';
import { useSemanasConsumo } from './useSemanasConsumo';
import necessidadesService from '../services/necessidadesService';
import calendarioService from '../services/calendarioService';
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
  const [loadingSemanaAbastecimento, setLoadingSemanaAbastecimento] = useState(false);

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

  // Hooks para logística
  const {
    necessidades: necessidadesLogistica,
    filtros: filtrosLogistica,
    loading: loadingLogistica,
    error: errorLogistica,
    carregarNecessidades: carregarNecessidadesLogistica,
    salvarAjustes: salvarAjustesLogistica,
    enviarParaNutricionista,
    buscarProdutosParaModal: buscarProdutosParaModalLogistica,
    incluirProdutoExtra: incluirProdutoExtraLogistica,
    atualizarFiltros: atualizarFiltrosLogistica
  } = useNecessidadesLogistica();

  // Hooks para semanas
  const { opcoes: opcoesSemanasAbastecimento } = useSemanasAbastecimento();
  // Usar semanas de consumo da tabela necessidades (não do calendário)
  const { opcoes: opcoesSemanasConsumo } = useSemanasConsumo(null, false, {});

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

  // Inicializar ajustes locais quando necessidades carregarem
  useEffect(() => {
    if (necessidades.length > 0) {
      // Limpar ajustes locais completamente ao consultar
      const novosAjustes = {};
      necessidades.forEach(nec => {
        // Usar chave composta (escola_id + produto_id)
        const chave = `${nec.escola_id}_${nec.produto_id}`;
        // Campo ajuste sempre fica vazio ao consultar
        novosAjustes[chave] = '';
      });
      setAjustesLocais(novosAjustes);
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

  const handleFiltroChange = useCallback(async (campo, valor) => {
    // Se a semana de consumo mudou ou foi limpa
    if (campo === 'semana_consumo') {
      // Se foi limpa, limpar também a semana de abastecimento
      if (!valor) {
        if (activeTab === 'nutricionista') {
          atualizarFiltrosNutricionista({ 
            semana_consumo: null,
            semana_abastecimento: null
          });
        } else if (activeTab === 'coordenacao') {
          atualizarFiltrosCoordenacao({ 
            semana_consumo: null,
            semana_abastecimento: null
          });
        } else if (activeTab === 'logistica') {
          atualizarFiltrosLogistica({ 
            semana_consumo: null,
            semana_abastecimento: null
          });
        }
        return;
      }
      
      // Se tem valor, buscar automaticamente a semana de abastecimento relacionada
      setLoadingSemanaAbastecimento(true);
      try {
        const response = await calendarioService.buscarSemanaAbastecimentoPorConsumo(valor);
        if (response.success && response.data && response.data.semana_abastecimento) {
          const semanaAbastecimento = response.data.semana_abastecimento;
          
          // Atualizar tanto semana_consumo quanto semana_abastecimento
          if (activeTab === 'nutricionista') {
            atualizarFiltrosNutricionista({ 
              semana_consumo: valor,
              semana_abastecimento: semanaAbastecimento
            });
          } else if (activeTab === 'coordenacao') {
            atualizarFiltrosCoordenacao({ 
              semana_consumo: valor,
              semana_abastecimento: semanaAbastecimento
            });
          } else if (activeTab === 'logistica') {
            atualizarFiltrosLogistica({ 
              semana_consumo: valor,
              semana_abastecimento: semanaAbastecimento
            });
          }
        } else {
          // Se não encontrou semana de abastecimento, limpar o campo
          if (activeTab === 'nutricionista') {
            atualizarFiltrosNutricionista({ 
              semana_consumo: valor,
              semana_abastecimento: null
            });
          } else if (activeTab === 'coordenacao') {
            atualizarFiltrosCoordenacao({ 
              semana_consumo: valor,
              semana_abastecimento: null
            });
          } else if (activeTab === 'logistica') {
            atualizarFiltrosLogistica({ 
              semana_consumo: valor,
              semana_abastecimento: null
            });
          }
        }
      } catch (error) {
        console.error('Erro ao buscar semana de abastecimento:', error);
        // Continuar com a atualização normal mesmo se houver erro
        if (activeTab === 'nutricionista') {
          atualizarFiltrosNutricionista({ semana_consumo: valor });
        } else if (activeTab === 'coordenacao') {
          atualizarFiltrosCoordenacao({ semana_consumo: valor });
        } else if (activeTab === 'logistica') {
          atualizarFiltrosLogistica({ semana_consumo: valor });
        }
      } finally {
        setLoadingSemanaAbastecimento(false);
      }
      return;
    }
    
    // Se não for semana_consumo, atualizar normalmente
    if (activeTab === 'nutricionista') {
      atualizarFiltrosNutricionista({ [campo]: valor });
    } else if (activeTab === 'coordenacao') {
      atualizarFiltrosCoordenacao({ [campo]: valor });
    } else if (activeTab === 'logistica') {
      atualizarFiltrosLogistica({ [campo]: valor });
    }
  }, [activeTab, atualizarFiltrosNutricionista, atualizarFiltrosCoordenacao, atualizarFiltrosLogistica]);

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
      // Validar produtos extras zerados
      const produtosExtrasZerados = necessidades.filter(nec => {
        const chave = `${nec.escola_id}_${nec.produto_id}`;
        const ajusteLocal = ajustesLocais[chave];
        const isExtra = nec.observacoes && nec.observacoes.includes('Produto extra');
        
        // Produto extra com valor zerado ou sem ajuste
        if (isExtra) {
          if (ajusteLocal === undefined || ajusteLocal === '' || parseFloat(ajusteLocal) === 0) {
            return true;
          }
        }
        return false;
      });

      if (produtosExtrasZerados.length > 0) {
        const nomesProdutos = produtosExtrasZerados.map(p => p.produto).join(', ');
        toast.error(`Produtos extra devem ter quantidade maior que zero: ${nomesProdutos}`);
        return;
      }

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
            // Para nutricionista, considerar status
            if (nec.status === 'CONF NUTRI') {
              // Se CONF NUTRI, manter ajuste_coordenacao ou ajuste_nutricionista
              valorFinal = nec.ajuste_coordenacao || nec.ajuste_nutricionista || nec.ajuste || 0;
            } else {
              // Para NEC ou NEC NUTRI, manter ajuste_nutricionista
              valorFinal = nec.ajuste_nutricionista || nec.ajuste || 0;
            }
          } else if (activeTab === 'logistica') {
            // Para logística, considerar ajuste_coordenacao primeiro
            valorFinal = nec.ajuste_coordenacao || nec.ajuste_nutricionista || nec.ajuste || 0;
          } else {
            // Para coordenação, considerar ajuste_conf_nutri primeiro (último valor da nutri)
            valorFinal = nec.ajuste_conf_nutri || nec.ajuste_coordenacao || nec.ajuste_nutricionista || nec.ajuste || 0;
          }
        }

        if (activeTab === 'coordenacao' || activeTab === 'logistica') {
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

      let resultado;
      if (activeTab === 'nutricionista') {
        resultado = await salvarAjustesNutricionista(dadosParaSalvar);
      } else if (activeTab === 'coordenacao') {
        resultado = await salvarAjustesCoordenacao(itens);
      } else if (activeTab === 'logistica') {
        resultado = await salvarAjustesLogistica(itens);
      }
      
      if (resultado.success) {
        toast.success('Ajustes salvos com sucesso!');
        setAjustesLocais({});
        handleCarregarNecessidades();
      }
    } catch (error) {
      console.error('Erro ao salvar ajustes:', error);
      toast.error('Erro ao salvar ajustes');
    }
  }, [activeTab, ajustesLocais, filtros, necessidadeAtual, necessidades, salvarAjustesNutricionista, salvarAjustesCoordenacao, salvarAjustesLogistica, handleCarregarNecessidades]);

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
      } else if (activeTab === 'logistica') {
        // Logística: NEC LOG -> CONF NUTRI
        if (!necessidadeAtual?.necessidade_id) {
          toast.error('Nenhuma necessidade selecionada');
          return;
        }
        resultado = await enviarParaNutricionista({
          necessidade_id: necessidadeAtual.necessidade_id,
          escola_id: filtros.escola_id
        });
      } else {
        // Coordenação: NEC COORD -> NEC LOG; CONF COORD -> CONF
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
          // NEC COORD vai para NEC LOG (não mais para CONF NUTRI)
          resultado = await liberarParaLogistica([necessidadeAtual.necessidade_id]);
        } else if (status === 'CONF COORD') {
          resultado = await confirmarFinal([necessidadeAtual.necessidade_id]);
        }
      }
      
      if (resultado.success) {
        let mensagem;
        if (activeTab === 'nutricionista') {
          mensagem = 'Necessidades liberadas para coordenação (NEC COORD)!';
        } else if (activeTab === 'logistica') {
          mensagem = 'Enviado para Confirmação Nutri (CONF NUTRI)!';
        } else {
          const status = necessidades[0]?.status;
          mensagem = status === 'NEC COORD'
            ? 'Enviado para Logística (NEC LOG)!'
            : (status === 'CONF COORD' ? 'Necessidades confirmadas (CONF)!' : 'Necessidades liberadas!');
        }
        toast.success(mensagem);
        handleCarregarNecessidades();
      }
    } catch (error) {
      console.error('Erro ao liberar:', error);
      toast.error('Erro ao liberar');
    }
  }, [activeTab, filtros, necessidadeAtual, liberarCoordenacao, confirmarFinal, liberarParaLogistica, enviarParaNutricionista, handleCarregarNecessidades, necessidades]);

  const handleAbrirModalProdutoExtra = useCallback(async () => {
    if (activeTab === 'coordenacao' || activeTab === 'logistica') {
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
        : activeTab === 'coordenacao'
        ? buscarProdutosParaModalCoordenacao
        : buscarProdutosParaModalLogistica;

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
  }, [activeTab, filtros, necessidadeAtual, buscarProdutosParaModalNutricionista, buscarProdutosParaModalCoordenacao, buscarProdutosParaModalLogistica]);

  const handleIncluirProdutosExtra = useCallback(async (produtosComQuantidade) => {
    const produtosAIncluir = produtosComQuantidade || produtosSelecionados;
    
    if (produtosAIncluir.length === 0) {
      toast.error('Selecione pelo menos um produto');
      return;
    }

    try {
      let sucessos = 0;
      let erros = 0;

      const incluirProduto = activeTab === 'nutricionista'
        ? incluirProdutoExtraNutricionista
        : activeTab === 'coordenacao'
        ? incluirProdutoExtraCoordenacao
        : incluirProdutoExtraLogistica;

      for (const produto of produtosAIncluir) {
        try {
          const dadosParaIncluir = {
            escola_id: filtros.escola_id,
            grupo: filtros.grupo,
            periodo: {
              consumo_de: filtros.consumo_de,
              consumo_ate: filtros.consumo_ate
            },
            semana_consumo: filtros.semana_consumo,
            semana_abastecimento: filtros.semana_abastecimento,
            produto_id: produto.produto_id,
            quantidade: produto.quantidade || 0  // Incluir quantidade se existir
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
  }, [activeTab, produtosSelecionados, filtros, incluirProdutoExtraNutricionista, incluirProdutoExtraCoordenacao, incluirProdutoExtraLogistica, handleCarregarNecessidades]);

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
        : activeTab === 'coordenacao'
        ? buscarProdutosParaModalCoordenacao
        : buscarProdutosParaModalLogistica;

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
  }, [activeTab, filtros, buscarProdutosParaModalNutricionista, buscarProdutosParaModalCoordenacao, buscarProdutosParaModalLogistica]);

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
      loadingSemanaAbastecimento,
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
