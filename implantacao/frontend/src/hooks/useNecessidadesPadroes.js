import { useState, useEffect, useCallback } from 'react';
import NecessidadesPadroesService from '../services/necessidadesPadroes';
import toast from 'react-hot-toast';

export const useNecessidadesPadroes = () => {
  const [padroes, setPadroes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50
  });

  // Filtros
  const [filtros, setFiltros] = useState({
    escola_id: '',
    grupo_id: '',
    produto_id: '',
    ativo: 1
  });

  /**
   * Carregar padrões
   */
  const carregarPadroes = useCallback(async (filtrosAdicionais = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        ...filtros,
        ...filtrosAdicionais,
        page: pagination.currentPage,
        limit: pagination.itemsPerPage
      };

      const response = await NecessidadesPadroesService.listar(params);
      
      if (response.success) {
        setPadroes(response.data.data || []);
        setPagination(response.data.pagination || pagination);
      } else {
        setError(response.message || 'Erro ao carregar padrões');
        setPadroes([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar padrões');
      console.error('Erro ao carregar padrões:', err);
      setPadroes([]);
    } finally {
      setLoading(false);
    }
  }, [filtros, pagination.currentPage, pagination.itemsPerPage]);

  /**
   * Buscar padrões por escola e grupo
   */
  const buscarPorEscolaGrupo = useCallback(async (escola_id, grupo_id) => {
    if (!escola_id || !grupo_id) return [];
    
    try {
      const response = await NecessidadesPadroesService.buscarPorEscolaGrupo(escola_id, grupo_id);
      return response.success ? response.data : [];
    } catch (err) {
      console.error('Erro ao buscar padrões por escola e grupo:', err);
      return [];
    }
  }, []);

  /**
   * Criar padrão
   */
  const criarPadrao = useCallback(async (dados) => {
    try {
      const response = await NecessidadesPadroesService.criar(dados);
      
      if (response.success) {
        toast.success('Padrão criado com sucesso');
        await carregarPadroes();
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || 'Erro ao criar padrão');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao criar padrão';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [carregarPadroes]);

  /**
   * Atualizar padrão
   */
  const atualizarPadrao = useCallback(async (id, dados) => {
    try {
      const response = await NecessidadesPadroesService.atualizar(id, dados);
      
      if (response.success) {
        toast.success('Padrão atualizado com sucesso');
        await carregarPadroes();
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || 'Erro ao atualizar padrão');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar padrão';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [carregarPadroes]);

  /**
   * Excluir padrão
   */
  const excluirPadrao = useCallback(async (id) => {
    try {
      const response = await NecessidadesPadroesService.excluir(id);
      
      if (response.success) {
        toast.success('Padrão excluído com sucesso');
        await carregarPadroes();
        return { success: true };
      } else {
        toast.error(response.message || 'Erro ao excluir padrão');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao excluir padrão';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [carregarPadroes]);

  /**
   * Salvar padrão completo
   */
  const salvarPadrao = useCallback(async (dados) => {
    try {
      const response = await NecessidadesPadroesService.salvarPadrao(dados);
      
      if (response.success) {
        toast.success('Padrão salvo com sucesso');
        await carregarPadroes();
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || 'Erro ao salvar padrão');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao salvar padrão';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [carregarPadroes]);

  /**
   * Atualizar filtros
   */
  const atualizarFiltros = useCallback((novosFiltros) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  /**
   * Limpar filtros
   */
  const limparFiltros = useCallback(() => {
    setFiltros({
      escola_id: '',
      grupo_id: '',
      produto_id: '',
      ativo: 1
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  /**
   * Atualizar paginação
   */
  const atualizarPaginacao = useCallback((novaPaginacao) => {
    setPagination(prev => ({ ...prev, ...novaPaginacao }));
  }, []);

  // Carregar padrões quando filtros ou paginação mudarem
  useEffect(() => {
    carregarPadroes();
  }, [carregarPadroes]);

  return {
    // Estados
    padroes,
    loading,
    error,
    pagination,
    filtros,
    
    // Ações
    carregarPadroes,
    buscarPorEscolaGrupo,
    criarPadrao,
    atualizarPadrao,
    excluirPadrao,
    salvarPadrao,
    atualizarFiltros,
    limparFiltros,
    atualizarPaginacao
  };
};
