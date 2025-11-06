import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Hook para gerenciar modal de produto extra e seleção de produtos
 */
export const useProdutoExtra = () => {
  const [modalProdutoExtraAberto, setModalProdutoExtraAberto] = useState(false);
  const [produtosDisponiveis, setProdutosDisponiveis] = useState([]);
  const [produtosSelecionados, setProdutosSelecionados] = useState([]);
  const [searchProduto, setSearchProduto] = useState('');

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

  const handleAbrirModal = useCallback(() => {
    setModalProdutoExtraAberto(true);
  }, []);

  const handleFecharModal = useCallback(() => {
    setModalProdutoExtraAberto(false);
    setProdutosSelecionados([]);
    setSearchProduto('');
  }, []);

  const handleSearchProduto = useCallback((search) => {
    setSearchProduto(search);
  }, []);

  return {
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
    handleAbrirModal,
    handleFecharModal,
    handleSearchProduto
  };
};

