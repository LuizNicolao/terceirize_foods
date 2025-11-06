import { useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Hook para gerenciar modal de produto extra e inclusão de produtos
 */
export const useModalProdutoExtra = ({
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
}) => {
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
  }, [activeTab, filtros, necessidadeAtual, buscarProdutosParaModalNutricionista, buscarProdutosParaModalCoordenacao, buscarProdutosParaModalLogistica, setProdutosDisponiveis, setModalProdutoExtraAberto]);

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
            quantidade: produto.quantidade || 0
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
  }, [activeTab, produtosSelecionados, filtros, incluirProdutoExtraNutricionista, incluirProdutoExtraCoordenacao, incluirProdutoExtraLogistica, handleCarregarNecessidades, setModalProdutoExtraAberto, setProdutosSelecionados, setSearchProduto]);

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
  }, [activeTab, filtros, buscarProdutosParaModalNutricionista, buscarProdutosParaModalCoordenacao, buscarProdutosParaModalLogistica, setSearchProduto, setProdutosDisponiveis]);

  return {
    handleAbrirModalProdutoExtra,
    handleIncluirProdutosExtra,
    handleSearchProduto
  };
};

