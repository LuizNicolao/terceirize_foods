import { useState, useEffect } from 'react';
import escolasService from '../../services/escolasService';
import toast from 'react-hot-toast';

const useEscolas = () => {
  const [escolas, setEscolas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const carregarEscolas = async (filtros = {}, todasEscolas = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = todasEscolas 
        ? await escolasService.listarTodas(filtros)
        : await escolasService.listar(filtros);
      
      if (response.success) {
        setEscolas(response.data);
      } else {
        setError(response.message || 'Erro ao carregar escolas');
      }
    } catch (error) {
      console.error('Erro ao carregar escolas:', error);
      setError('Erro ao carregar escolas');
    } finally {
      setLoading(false);
    }
  };

  const carregarTodasEscolas = async (filtros = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await escolasService.listarTodas(filtros);
      
      if (response.success) {
        setEscolas(response.data);
      } else {
        setError(response.message || 'Erro ao carregar todas as escolas');
      }
    } catch (error) {
      console.error('Erro ao carregar todas as escolas:', error);
      setError('Erro ao carregar todas as escolas');
    } finally {
      setLoading(false);
    }
  };

  const buscarEscola = async (id) => {
    try {
      const response = await escolasService.buscarPorId(id);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao buscar escola');
      }
    } catch (error) {
      console.error('Erro ao buscar escola:', error);
      throw error;
    }
  };

  const criarEscola = async (dados) => {
    try {
      const response = await escolasService.criar(dados);
      if (response.success) {
        toast.success('Escola criada com sucesso!');
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao criar escola');
      }
    } catch (error) {
      console.error('Erro ao criar escola:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar escola');
      throw error;
    }
  };

  const atualizarEscola = async (id, dados) => {
    try {
      const response = await escolasService.atualizar(id, dados);
      if (response.success) {
        toast.success('Escola atualizada com sucesso!');
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao atualizar escola');
      }
    } catch (error) {
      console.error('Erro ao atualizar escola:', error);
      toast.error(error.response?.data?.message || 'Erro ao atualizar escola');
      throw error;
    }
  };

  const deletarEscola = async (id) => {
    try {
      const response = await escolasService.deletar(id);
      if (response.success) {
        toast.success('Escola deletada com sucesso!');
        return response.data;
      } else {
        throw new Error(response.message || 'Erro ao deletar escola');
      }
    } catch (error) {
      console.error('Erro ao deletar escola:', error);
      toast.error(error.response?.data?.message || 'Erro ao deletar escola');
      throw error;
    }
  };

  return {
    escolas,
    loading,
    error,
    carregarEscolas,
    carregarTodasEscolas,
    buscarEscola,
    criarEscola,
    atualizarEscola,
    deletarEscola
  };
};

export default useEscolas;
