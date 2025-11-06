import { useState, useCallback } from 'react';

/**
 * Hook para gerenciar a tabela de produtos na geração de necessidades
 */
export const useNecessidadesTabela = () => {
  const [produtosTabela, setProdutosTabela] = useState([]);

  // Inicializar tabela de produtos
  const inicializarTabelaProdutos = useCallback((produtos, percapitas, mediasPeriodo) => {
    if (!produtos || produtos.length === 0) {
      setProdutosTabela([]);
      return;
    }

    const tabela = produtos.map(produto => {
      const percapita = parseFloat(percapitas[produto.produto_id]) || 0;
      
      // As médias vêm organizadas por tipo, não por produto
      // Vamos usar a média do almoço como padrão para exibição
      const mediaAlmoco = mediasPeriodo.almoco?.media || 0;
      
      return {
        id: produto.produto_id,
        nome: produto.produto_nome,
        unidade_medida: produto.unidade_medida,
        per_capita: percapita,
        media_periodo: mediaAlmoco,
        frequencia: 0, // Valor padrão
        ajuste: 0, // Valor padrão
        quantidade_final: 0, // Calculado automaticamente
        medias: {
          almoco: mediasPeriodo.almoco?.media || 0,
          parcial: mediasPeriodo.parcial?.media || 0,
          lanche: mediasPeriodo.lanche?.media || 0,
          eja: mediasPeriodo.eja?.media || 0
        }
      };
    });

    setProdutosTabela(tabela);
  }, []);

  // Atualizar frequência de um produto
  const atualizarFrequencia = useCallback((produtoId, frequencia) => {
    setProdutosTabela(prev => prev.map(produto => {
      if (produto.id === produtoId) {
        return {
          ...produto,
          frequencia
        };
      }
      return produto;
    }));
  }, []);

  // Atualizar ajuste de um produto
  const atualizarAjuste = useCallback((produtoId, ajuste) => {
    setProdutosTabela(prev => prev.map(produto => {
      if (produto.id === produtoId) {
        return { 
          ...produto, 
          ajuste
        };
      }
      return produto;
    }));
  }, []);

  return {
    produtosTabela,
    inicializarTabelaProdutos,
    atualizarFrequencia,
    atualizarAjuste
  };
};

