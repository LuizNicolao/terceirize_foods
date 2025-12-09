import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import pratosService from '../services/pratos';
import { useBaseEntity } from './common/useBaseEntity';

/**
 * Hook para gerenciar pratos
 * Inclui CRUD completo, paginação, filtros e busca
 */
export const usePratos = () => {
  const baseEntity = useBaseEntity('pratos', pratosService, {
    initialFilters: {
      search: ''
    }
  });

  // Estados de ordenação
  const [sortField, setSortField] = useState('data_cadastro');
  const [sortDirection, setSortDirection] = useState('DESC');

  /**
   * Carregar pratos
   */
  const carregarPratos = useCallback(async () => {
    await baseEntity.loadData({
      sortBy: sortField,
      sortOrder: sortDirection
    });
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
   * Criar prato
   */
  const criarPrato = useCallback(async (dados) => {
    try {
      const response = await pratosService.criar(dados);
      
      if (response.success) {
        toast.success(response.message || 'Prato criado com sucesso!');
        await carregarPratos();
        return response;
      } else {
        toast.error(response.error || 'Erro ao criar prato');
        return response;
      }
    } catch (err) {
      toast.error('Erro ao criar prato');
      return {
        success: false,
        error: err.message || 'Erro ao criar prato'
      };
    }
  }, [carregarPratos]);

  /**
   * Atualizar prato
   */
  const atualizarPrato = useCallback(async (id, dados) => {
    try {
      const response = await pratosService.atualizar(id, dados);
      
      if (response.success) {
        toast.success(response.message || 'Prato atualizado com sucesso!');
        await carregarPratos();
        return response;
      } else {
        toast.error(response.error || 'Erro ao atualizar prato');
        return response;
      }
    } catch (err) {
      toast.error('Erro ao atualizar prato');
      return {
        success: false,
        error: err.message || 'Erro ao atualizar prato'
      };
    }
  }, [carregarPratos]);

  /**
   * Excluir prato
   */
  const excluirPrato = useCallback(async (id) => {
    try {
      const response = await pratosService.excluir(id);
      
      if (response.success) {
        toast.success(response.message || 'Prato excluído com sucesso!');
        await carregarPratos();
        return response;
      } else {
        toast.error(response.error || 'Erro ao excluir prato');
        return response;
      }
    } catch (err) {
      toast.error('Erro ao excluir prato');
      return {
        success: false,
        error: err.message || 'Erro ao excluir prato'
      };
    }
  }, [carregarPratos]);

  /**
   * Exportar pratos
   */
  const exportarJson = async () => {
    try {
      const result = await pratosService.exportarJson();
      if (result.success) {
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `pratos_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Pratos exportados com sucesso');
      } else {
        toast.error(result.error || 'Erro ao exportar pratos');
      }
    } catch (error) {
      console.error('Erro ao exportar pratos:', error);
      toast.error('Erro ao exportar pratos');
    }
  };

  return {
    // Estados
    pratos: baseEntity.items,
    loading: baseEntity.loading,
    error: null,
    pagination: {
      currentPage: baseEntity.currentPage,
      totalPages: baseEntity.totalPages,
      totalItems: baseEntity.totalItems,
      itemsPerPage: baseEntity.itemsPerPage
    },
    filters: {
      search: baseEntity.searchTerm || ''
    },
    sortField,
    sortDirection,

    // Ações
    carregarPratos,
    criarPrato,
    atualizarPrato,
    excluirPrato,
    exportarJson,
    handleSort,

    // Handlers do baseEntity
    handlePageChange: baseEntity.handlePageChange,
    handleFilterChange: baseEntity.updateFilter,
    handleSearchChange: baseEntity.setSearchTerm,
    clearFilters: baseEntity.clearFilters
  };
};

