import { useState, useEffect } from 'react';
import produtosService from '../services/produtosService';
import toast from 'react-hot-toast';

const useProdutos = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const carregarProdutos = async (filtros = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Para recebimentos, sempre carregar todos os produtos (sem paginação)
      const filtrosCompletos = { ...filtros, limit: 1000 }; // Limite alto para pegar todos
      const response = await produtosService.listar(filtrosCompletos);
      if (response.success) {
        setProdutos(response.data);
      } else {
        setError(response.message || 'Erro ao carregar produtos');
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setError('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const buscarProduto = async (id) => {
    try {
      const response = await produtosService.buscarPorId(id);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao buscar produto');
      }
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      throw error;
    }
  };

  const criarProduto = async (dados) => {
    try {
      const response = await produtosService.criar(dados);
      if (response.success) {
        toast.success('Produto criado com sucesso!');
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao criar produto');
      }
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar produto');
      throw error;
    }
  };

  const atualizarProduto = async (id, dados) => {
    try {
      const response = await produtosService.atualizar(id, dados);
      if (response.success) {
        toast.success('Produto atualizado com sucesso!');
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao atualizar produto');
      }
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      toast.error(error.response?.data?.message || 'Erro ao atualizar produto');
      throw error;
    }
  };

  const deletarProduto = async (id) => {
    try {
      const response = await produtosService.deletar(id);
      if (response.success) {
        toast.success('Produto deletado com sucesso!');
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao deletar produto');
      }
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      toast.error(error.response?.data?.message || 'Erro ao deletar produto');
      throw error;
    }
  };

  return {
    produtos,
    loading,
    error,
    carregarProdutos,
    buscarProduto,
    criarProduto,
    atualizarProduto,
    deletarProduto
  };
};

export default useProdutos;
