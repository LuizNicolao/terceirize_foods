import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import receitasService from '../services/receitas';

/**
 * Hook para gerenciar receitas
 * Inclui CRUD completo, paginação, filtros e busca
 */
export const useReceitas = () => {
  // Estados principais
  const [receitas, setReceitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de paginação
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  // Estados de filtros
  const [filters, setFilters] = useState({
    search: '',
    tipo_receita: '',
    filial: '',
    centro_custo: ''
  });

  // Estados de ordenação
  const [sortField, setSortField] = useState('data_cadastro');
  const [sortDirection, setSortDirection] = useState('DESC');

  // Estados de estatísticas
  const [stats, setStats] = useState({
    total: 0,
    total_produtos: 0
  });

  /**
   * Carregar receitas
   */
  const carregarReceitas = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: filters.search || '',
        tipo_receita: filters.tipo_receita || '',
        filial: filters.filial || '',
        centro_custo: filters.centro_custo || '',
        sortBy: sortField,
        sortOrder: sortDirection
      };

      const response = await receitasService.listar(params);

      if (response.success) {
        setReceitas(response.data || []);
        
        if (response.pagination) {
          setPagination(prev => ({
            ...prev,
            currentPage: response.pagination.currentPage || prev.currentPage,
            totalPages: response.pagination.totalPages || prev.totalPages,
            totalItems: response.pagination.totalItems || prev.totalItems,
            itemsPerPage: response.pagination.itemsPerPage || prev.itemsPerPage
          }));
        }

        // Calcular estatísticas
        const total = response.pagination?.totalItems || response.data?.length || 0;
        const totalProdutos = response.data?.reduce((acc, receita) => {
          return acc + (receita.total_produtos || 0);
        }, 0) || 0;

        setStats({
          total,
          total_produtos: totalProdutos
        });
      } else {
        setError(response.error || 'Erro ao carregar receitas');
        toast.error(response.error || 'Erro ao carregar receitas');
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro ao carregar receitas';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, filters, sortField, sortDirection]);

  /**
   * Carregar receita por ID
   */
  const carregarReceitaPorId = useCallback(async (id) => {
    try {
      const response = await receitasService.buscarPorId(id);
      
      if (response.success) {
        return response.data;
      } else {
        toast.error(response.error || 'Erro ao carregar receita');
        return null;
      }
    } catch (err) {
      toast.error('Erro ao carregar receita');
      return null;
    }
  }, []);

  /**
   * Criar receita
   */
  const criarReceita = useCallback(async (data) => {
    try {
      const response = await receitasService.criar(data);
      
      if (response.success) {
        toast.success(response.message || 'Receita criada com sucesso!');
        await carregarReceitas();
        return response.data;
      } else {
        toast.error(response.message || response.error || 'Erro ao criar receita');
        return null;
      }
    } catch (err) {
      toast.error('Erro ao criar receita');
      return null;
    }
  }, [carregarReceitas]);

  /**
   * Atualizar receita
   */
  const atualizarReceita = useCallback(async (id, data) => {
    try {
      const response = await receitasService.atualizar(id, data);
      
      if (response.success) {
        toast.success(response.message || 'Receita atualizada com sucesso!');
        await carregarReceitas();
        return response.data;
      } else {
        toast.error(response.message || response.error || 'Erro ao atualizar receita');
        return null;
      }
    } catch (err) {
      toast.error('Erro ao atualizar receita');
      return null;
    }
  }, [carregarReceitas]);

  /**
   * Excluir receita
   */
  const excluirReceita = useCallback(async (id) => {
    try {
      const response = await receitasService.excluir(id);
      
      if (response.success) {
        toast.success(response.message || 'Receita excluída com sucesso!');
        await carregarReceitas();
        return true;
      } else {
        toast.error(response.error || 'Erro ao excluir receita');
        return false;
      }
    } catch (err) {
      toast.error('Erro ao excluir receita');
      return false;
    }
  }, [carregarReceitas]);

  /**
   * Exportar receitas
   */
  const exportarReceitas = useCallback(async () => {
    try {
      const response = await receitasService.exportarJSON();
      
      if (response.success) {
        toast.success(response.message || 'Receitas exportadas com sucesso!');
        return true;
      } else {
        toast.error(response.error || 'Erro ao exportar receitas');
        return false;
      }
    } catch (err) {
      toast.error('Erro ao exportar receitas');
      return false;
    }
  }, []);

  /**
   * Atualizar filtros
   */
  const atualizarFiltros = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  /**
   * Limpar filtros
   */
  const limparFiltros = useCallback(() => {
    setFilters({
      search: '',
      tipo_receita: '',
      filial: '',
      centro_custo: ''
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  /**
   * Atualizar paginação
   */
  const atualizarPaginacao = useCallback((newPagination) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  /**
   * Ordenar por campo
   */
  const handleSort = useCallback((field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortField(field);
      setSortDirection('ASC');
    }
  }, [sortField]);

  /**
   * Recarregar dados
   */
  const recarregar = useCallback(() => {
    carregarReceitas();
  }, [carregarReceitas]);

  // Carregar receitas quando os parâmetros mudarem
  useEffect(() => {
    carregarReceitas();
  }, [carregarReceitas]);

  return {
    // Dados
    receitas,
    loading,
    error,
    stats,
    
    // Paginação
    pagination,
    atualizarPaginacao,
    
    // Filtros
    filters,
    atualizarFiltros,
    limparFiltros,
    
    // Ordenação
    sortField,
    sortDirection,
    handleSort,
    
    // Ações CRUD
    carregarReceitaPorId,
    criarReceita,
    atualizarReceita,
    excluirReceita,
    exportarReceitas,
    
    // Utilitários
    recarregar
  };
};

