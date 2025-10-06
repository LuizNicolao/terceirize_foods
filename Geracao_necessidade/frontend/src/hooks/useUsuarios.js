import { useState, useEffect, useCallback } from 'react';
import usuariosService from '../services/usuariosService';

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
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

  const carregarUsuarios = useCallback(async (filtros = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await usuariosService.listar(filtros);
      if (response.success) {
        setUsuarios(response.data || []);
        if (response.meta?.pagination) {
          setPagination(response.meta.pagination);
        }
      } else {
        setError(response.message || 'Erro ao carregar usuários');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar usuários');
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const criarUsuario = async (usuario) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await usuariosService.criar(usuario);
      await carregarUsuarios();
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao criar usuário';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const atualizarUsuario = async (id, usuario) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await usuariosService.atualizar(id, usuario);
      await carregarUsuarios();
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar usuário';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const deletarUsuario = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await usuariosService.deletar(id);
      await carregarUsuarios();
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao deletar usuário';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const buscarUsuario = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await usuariosService.buscar(id);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao buscar usuário';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const buscarPorEmail = async (email) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await usuariosService.buscarPorEmail(email);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao buscar usuários';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  return {
    usuarios,
    loading,
    error,
    pagination,
    carregarUsuarios,
    criarUsuario,
    atualizarUsuario,
    deletarUsuario,
    buscarUsuario,
    buscarPorEmail
  };
};
