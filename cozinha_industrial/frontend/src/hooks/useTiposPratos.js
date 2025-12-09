import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import tiposPratosService from '../services/tiposPratos';
import { useBaseEntity } from './common/useBaseEntity';

/**
 * Hook para gerenciar tipos de pratos
 * Inclui CRUD completo, paginação, filtros e busca
 */
export const useTiposPratos = () => {
  const baseEntity = useBaseEntity('tipos_pratos', tiposPratosService, {
    initialFilters: {
      search: ''
    }
  });

  // Estados de ordenação
  const [sortField, setSortField] = useState('data_cadastro');
  const [sortDirection, setSortDirection] = useState('DESC');

  /**
   * Carregar tipos de pratos
   */
  const carregarTiposPratos = useCallback(async () => {
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
   * Criar tipo de prato
   */
  const criarTipoPrato = useCallback(async (dados) => {
    try {
      const response = await tiposPratosService.criar(dados);
      
      if (response.success) {
        toast.success(response.message || 'Tipo de prato criado com sucesso!');
        await carregarTiposPratos();
        return response;
      } else {
        toast.error(response.error || 'Erro ao criar tipo de prato');
        return response;
      }
    } catch (err) {
      toast.error('Erro ao criar tipo de prato');
      return {
        success: false,
        error: err.message || 'Erro ao criar tipo de prato'
      };
    }
  }, [carregarTiposPratos]);

  /**
   * Atualizar tipo de prato
   */
  const atualizarTipoPrato = useCallback(async (id, dados) => {
    try {
      const response = await tiposPratosService.atualizar(id, dados);
      
      if (response.success) {
        toast.success(response.message || 'Tipo de prato atualizado com sucesso!');
        await carregarTiposPratos();
        return response;
      } else {
        toast.error(response.error || 'Erro ao atualizar tipo de prato');
        return response;
      }
    } catch (err) {
      toast.error('Erro ao atualizar tipo de prato');
      return {
        success: false,
        error: err.message || 'Erro ao atualizar tipo de prato'
      };
    }
  }, [carregarTiposPratos]);

  /**
   * Excluir tipo de prato
   */
  const excluirTipoPrato = useCallback(async (id) => {
    try {
      const response = await tiposPratosService.excluir(id);
      
      if (response.success) {
        toast.success(response.message || 'Tipo de prato excluído com sucesso!');
        await carregarTiposPratos();
        return response;
      } else {
        toast.error(response.error || 'Erro ao excluir tipo de prato');
        return response;
      }
    } catch (err) {
      toast.error('Erro ao excluir tipo de prato');
      return {
        success: false,
        error: err.message || 'Erro ao excluir tipo de prato'
      };
    }
  }, [carregarTiposPratos]);

  /**
   * Exportar tipos de pratos
   */
  const exportarJson = async () => {
    try {
      const result = await tiposPratosService.exportarJson();
      if (result.success) {
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tipos_pratos_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Tipos de pratos exportados com sucesso');
      } else {
        toast.error(result.error || 'Erro ao exportar tipos de pratos');
      }
    } catch (error) {
      console.error('Erro ao exportar tipos de pratos:', error);
      toast.error('Erro ao exportar tipos de pratos');
    }
  };

  return {
    // Estados
    tiposPratos: baseEntity.items,
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
    carregarTiposPratos,
    criarTipoPrato,
    atualizarTipoPrato,
    excluirTipoPrato,
    exportarJson,
    handleSort,

    // Handlers do baseEntity
    handlePageChange: baseEntity.handlePageChange,
    handleFilterChange: baseEntity.updateFilter,
    handleSearchChange: baseEntity.setSearchTerm,
    clearFilters: baseEntity.clearFilters
  };
};

