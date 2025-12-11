import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import cardapiosService from '../services/cardapios';
import { useBaseEntity } from './common/useBaseEntity';

/**
 * Hook para gerenciar cardápios
 * Inclui CRUD completo, paginação, filtros e busca
 */
export const useCardapios = () => {
  const baseEntity = useBaseEntity('cardapios', cardapiosService, {
    initialFilters: {
      search: '',
      mes_referencia: '',
      ano_referencia: '',
      status: ''
    }
  });

  // Estados de ordenação
  const [sortField, setSortField] = useState('criado_em');
  const [sortDirection, setSortDirection] = useState('DESC');

  /**
   * Carregar cardápios
   */
  const carregarCardapios = useCallback(async () => {
    try {
      await baseEntity.loadData({
        sortField: sortField,
        sortDirection: sortDirection
      });
    } catch (error) {
      console.error('Erro ao carregar cardápios:', error);
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
      newSortDirection = sortDirection === 'ASC' ? 'DESC' : 'ASC';
    } else {
      newSortField = field;
      newSortDirection = 'ASC';
    }
    
    setSortField(newSortField);
    setSortDirection(newSortDirection);
    
    await baseEntity.loadData({
      sortField: newSortField,
      sortDirection: newSortDirection
    });
  }, [sortField, sortDirection, baseEntity.loadData]);

  /**
   * Criar cardápio
   */
  const criarCardapio = useCallback(async (dados) => {
    try {
      const response = await cardapiosService.criar(dados);
      
      if (response.success) {
        toast.success(response.message || 'Cardápio criado com sucesso!');
        await carregarCardapios();
        return response;
      } else {
        toast.error(response.error || 'Erro ao criar cardápio');
        return response;
      }
    } catch (err) {
      toast.error('Erro ao criar cardápio');
      return {
        success: false,
        error: err.message || 'Erro ao criar cardápio'
      };
    }
  }, [carregarCardapios]);

  /**
   * Atualizar cardápio
   */
  const atualizarCardapio = useCallback(async (id, dados) => {
    try {
      const response = await cardapiosService.atualizar(id, dados);
      
      if (response.success) {
        toast.success(response.message || 'Cardápio atualizado com sucesso!');
        await carregarCardapios();
        return response;
      } else {
        toast.error(response.error || 'Erro ao atualizar cardápio');
        return response;
      }
    } catch (err) {
      toast.error('Erro ao atualizar cardápio');
      return {
        success: false,
        error: err.message || 'Erro ao atualizar cardápio'
      };
    }
  }, [carregarCardapios]);

  /**
   * Excluir cardápio
   */
  const excluirCardapio = useCallback(async (id) => {
    try {
      const response = await cardapiosService.excluir(id);
      
      if (response.success) {
        toast.success(response.message || 'Cardápio excluído com sucesso!');
        await carregarCardapios();
        return response;
      } else {
        toast.error(response.error || 'Erro ao excluir cardápio');
        return response;
      }
    } catch (err) {
      toast.error('Erro ao excluir cardápio');
      return {
        success: false,
        error: err.message || 'Erro ao excluir cardápio'
      };
    }
  }, [carregarCardapios]);

  /**
   * Exportar cardápios em JSON
   */
  const exportarJson = useCallback(async () => {
    try {
      const response = await cardapiosService.exportarJSON(baseEntity.filters);
      
      if (response.success) {
        // Criar arquivo JSON para download
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cardapios_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success('Cardápios exportados com sucesso!');
        return response;
      } else {
        toast.error(response.error || 'Erro ao exportar cardápios');
        return response;
      }
    } catch (err) {
      toast.error('Erro ao exportar cardápios');
      return {
        success: false,
        error: err.message || 'Erro ao exportar cardápios'
      };
    }
  }, [baseEntity.filters]);

  return {
    // Estados do baseEntity
    cardapios: baseEntity.items,
    loading: baseEntity.loading,
    pagination: baseEntity.pagination,
    filters: baseEntity.filters,
    sortField,
    sortDirection,
    
    // Funções do baseEntity
    handlePageChange: baseEntity.handlePageChange,
    handleSearchChange: baseEntity.handleSearchChange,
    clearFilters: baseEntity.clearFilters,
    
    // Funções específicas
    carregarCardapios,
    handleSort,
    criarCardapio,
    atualizarCardapio,
    excluirCardapio,
    exportarJson
  };
};

