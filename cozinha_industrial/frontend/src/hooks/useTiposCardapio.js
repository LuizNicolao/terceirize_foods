import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import tiposCardapioService from '../services/tiposCardapio';
import { useBaseEntity } from './common/useBaseEntity';

/**
 * Hook para gerenciar tipos de cardápio
 * Inclui CRUD completo, paginação, filtros e busca
 */
export const useTiposCardapio = () => {
  const baseEntity = useBaseEntity('tipos-cardapio', tiposCardapioService, {
    initialFilters: {
      search: ''
    }
  });

  // Estados de ordenação
  const [sortField, setSortField] = useState('criado_em');
  const [sortDirection, setSortDirection] = useState('DESC');

  /**
   * Carregar tipos de cardápio
   */
  const carregarTiposCardapio = useCallback(async () => {
    try {
      await baseEntity.loadData({
        sortBy: sortField,
        sortOrder: sortDirection
      });
    } catch (error) {
      console.error('Erro ao carregar tipos de cardápio:', error);
      throw error;
    }
  }, [baseEntity.loadData, sortField, sortDirection]);

  /**
   * Handler de ordenação
   */
  const handleSort = useCallback(async (field) => {
    let newSortField = sortField;
    let newSortDirection = sortDirection;
    
    if (sortField === field) {
      // Se já está ordenando por este campo, inverter direção
      newSortDirection = sortDirection === 'ASC' ? 'DESC' : 'ASC';
    } else {
      // Se é um novo campo, ordenar ASC
      newSortField = field;
      newSortDirection = 'ASC';
    }
    
    setSortField(newSortField);
    setSortDirection(newSortDirection);
    
    // Recarregar dados com nova ordenação
    await baseEntity.loadData({
      sortBy: newSortField,
      sortOrder: newSortDirection
    });
  }, [sortField, sortDirection, baseEntity.loadData]);

  /**
   * Criar tipo de cardápio
   */
  const criarTipoCardapio = useCallback(async (dados) => {
    try {
      const response = await tiposCardapioService.criar(dados);
      
      if (response.success) {
        toast.success(response.message || 'Tipo de cardápio criado com sucesso!');
        await carregarTiposCardapio();
        return response;
      } else {
        toast.error(response.error || 'Erro ao criar tipo de cardápio');
        return response;
      }
    } catch (err) {
      toast.error('Erro ao criar tipo de cardápio');
      return {
        success: false,
        error: err.message || 'Erro ao criar tipo de cardápio'
      };
    }
  }, [carregarTiposCardapio]);

  /**
   * Atualizar tipo de cardápio
   */
  const atualizarTipoCardapio = useCallback(async (id, dados) => {
    try {
      const response = await tiposCardapioService.atualizar(id, dados);
      
      if (response.success) {
        toast.success(response.message || 'Tipo de cardápio atualizado com sucesso!');
        await carregarTiposCardapio();
        return response;
      } else {
        toast.error(response.error || 'Erro ao atualizar tipo de cardápio');
        return response;
      }
    } catch (err) {
      toast.error('Erro ao atualizar tipo de cardápio');
      return {
        success: false,
        error: err.message || 'Erro ao atualizar tipo de cardápio'
      };
    }
  }, [carregarTiposCardapio]);

  /**
   * Excluir tipo de cardápio
   */
  const excluirTipoCardapio = useCallback(async (id) => {
    try {
      const response = await tiposCardapioService.excluir(id);
      
      if (response.success) {
        toast.success(response.message || 'Tipo de cardápio excluído com sucesso!');
        await carregarTiposCardapio();
        return response;
      } else {
        toast.error(response.error || 'Erro ao excluir tipo de cardápio');
        return response;
      }
    } catch (err) {
      toast.error('Erro ao excluir tipo de cardápio');
      return {
        success: false,
        error: err.message || 'Erro ao excluir tipo de cardápio'
      };
    }
  }, [carregarTiposCardapio]);

  /**
   * Exportar tipos de cardápio em JSON
   */
  const exportarJson = useCallback(async () => {
    try {
      const response = await tiposCardapioService.exportarJson();
      
      if (response.success) {
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tipos-cardapio-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Tipos de cardápio exportados com sucesso!');
      } else {
        toast.error(response.error || 'Erro ao exportar tipos de cardápio');
      }
      
      return response;
    } catch (err) {
      toast.error('Erro ao exportar tipos de cardápio');
      return {
        success: false,
        error: err.message || 'Erro ao exportar tipos de cardápio'
      };
    }
  }, []);

  return {
    tiposCardapio: baseEntity.items || [],
    loading: baseEntity.loading,
    pagination: baseEntity.pagination,
    filters: baseEntity.filters,
    sortField,
    sortDirection,
    carregarTiposCardapio,
    criarTipoCardapio,
    atualizarTipoCardapio,
    excluirTipoCardapio,
    exportarJson,
    handleSort,
    handlePageChange: baseEntity.handlePageChange,
    handleSearchChange: baseEntity.handleSearchChange,
    clearFilters: baseEntity.clearFilters
  };
};

