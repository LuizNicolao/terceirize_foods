import { useState, useEffect } from 'react';
import recebimentosEscolasService from '../services/recebimentosEscolasService';
import toast from 'react-hot-toast';

const useRecebimentosEscolas = () => {
  const [recebimentos, setRecebimentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  });

  const carregarRecebimentos = async (filtros = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Incluir parâmetros de paginação nos filtros
      const filtrosComPaginacao = {
        ...filtros,
        page: pagination.currentPage,
        limit: pagination.itemsPerPage
      };
      
      const response = await recebimentosEscolasService.listar(filtrosComPaginacao);
      
      if (response.success) {
        setRecebimentos(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        setError(response.message || 'Erro ao carregar recebimentos');
      }
    } catch (error) {
      console.error('Erro ao carregar recebimentos:', error);
      setError('Erro ao carregar recebimentos');
    } finally {
      setLoading(false);
    }
  };

  const buscarRecebimento = async (id) => {
    try {
      const response = await recebimentosEscolasService.buscarPorId(id);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao buscar recebimento');
      }
    } catch (error) {
      console.error('Erro ao buscar recebimento:', error);
      throw error;
    }
  };

  const criarRecebimento = async (dados) => {
    try {
      const response = await recebimentosEscolasService.criar(dados);
      if (response.success) {
        toast.success('Recebimento criado com sucesso!');
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao criar recebimento');
      }
    } catch (error) {
      console.error('Erro ao criar recebimento:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar recebimento');
      throw error;
    }
  };

  const atualizarRecebimento = async (id, dados) => {
    try {
      const response = await recebimentosEscolasService.atualizar(id, dados);
      if (response.success) {
        toast.success('Recebimento atualizado com sucesso!');
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao atualizar recebimento');
      }
    } catch (error) {
      console.error('Erro ao atualizar recebimento:', error);
      toast.error(error.response?.data?.message || 'Erro ao atualizar recebimento');
      throw error;
    }
  };

  const deletarRecebimento = async (id) => {
    try {
      const response = await recebimentosEscolasService.deletar(id);
      if (response.success) {
        toast.success('Recebimento deletado com sucesso!');
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao deletar recebimento');
      }
    } catch (error) {
      console.error('Erro ao deletar recebimento:', error);
      toast.error(error.response?.data?.message || 'Erro ao deletar recebimento');
      throw error;
    }
  };

  const setPage = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  const setLimit = (limit) => {
    setPagination(prev => ({
      ...prev,
      itemsPerPage: limit,
      currentPage: 1 // Reset para primeira página ao mudar limite
    }));
  };

  return {
    recebimentos,
    loading,
    error,
    pagination,
    carregarRecebimentos,
    buscarRecebimento,
    criarRecebimento,
    atualizarRecebimento,
    deletarRecebimento,
    setPage,
    setLimit
  };
};

export default useRecebimentosEscolas;
