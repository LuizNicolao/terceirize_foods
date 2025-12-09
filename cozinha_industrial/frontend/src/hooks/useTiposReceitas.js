import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import tiposReceitasService from '../services/tiposReceitas';
import { useBaseEntity } from './common/useBaseEntity';

/**
 * Hook para gerenciar tipos de receitas
 * Inclui CRUD completo, paginação, filtros e busca
 */
export const useTiposReceitas = () => {
  const baseEntity = useBaseEntity('tipos_receitas', tiposReceitasService, {
    initialFilters: {
      search: ''
    }
  });

  // Estados de ordenação
  const [sortField, setSortField] = useState('data_cadastro');
  const [sortDirection, setSortDirection] = useState('DESC');

  /**
   * Carregar tipos de receitas
   */
  const carregarTiposReceitas = useCallback(async () => {
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
   * Criar tipo de receita
   */
  const criarTipoReceita = useCallback(async (dados) => {
    try {
      const response = await tiposReceitasService.criar(dados);
      
      if (response.success) {
        toast.success(response.message || 'Tipo de receita criado com sucesso!');
        await carregarTiposReceitas();
        return response;
      } else {
        toast.error(response.error || 'Erro ao criar tipo de receita');
        return response;
      }
    } catch (err) {
      toast.error('Erro ao criar tipo de receita');
      return {
        success: false,
        error: err.message || 'Erro ao criar tipo de receita'
      };
    }
  }, [carregarTiposReceitas]);

  /**
   * Atualizar tipo de receita
   */
  const atualizarTipoReceita = useCallback(async (id, dados) => {
    try {
      const response = await tiposReceitasService.atualizar(id, dados);
      
      if (response.success) {
        toast.success(response.message || 'Tipo de receita atualizado com sucesso!');
        await carregarTiposReceitas();
        return response;
      } else {
        toast.error(response.error || 'Erro ao atualizar tipo de receita');
        return response;
      }
    } catch (err) {
      toast.error('Erro ao atualizar tipo de receita');
      return {
        success: false,
        error: err.message || 'Erro ao atualizar tipo de receita'
      };
    }
  }, [carregarTiposReceitas]);

  /**
   * Excluir tipo de receita
   */
  const excluirTipoReceita = useCallback(async (id) => {
    try {
      const response = await tiposReceitasService.excluir(id);
      
      if (response.success) {
        toast.success(response.message || 'Tipo de receita excluído com sucesso!');
        await carregarTiposReceitas();
        return response;
      } else {
        toast.error(response.error || 'Erro ao excluir tipo de receita');
        return response;
      }
    } catch (err) {
      toast.error('Erro ao excluir tipo de receita');
      return {
        success: false,
        error: err.message || 'Erro ao excluir tipo de receita'
      };
    }
  }, [carregarTiposReceitas]);

  /**
   * Exportar tipos de receitas
   */
  const exportarJson = async () => {
    try {
      const result = await tiposReceitasService.exportarJson();
      if (result.success) {
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tipos_receitas_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Tipos de receitas exportados com sucesso');
      } else {
        toast.error(result.error || 'Erro ao exportar tipos de receitas');
      }
    } catch (error) {
      console.error('Erro ao exportar tipos de receitas:', error);
      toast.error('Erro ao exportar tipos de receitas');
    }
  };

  return {
    // Estados
    tiposReceitas: baseEntity.items,
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
    carregarTiposReceitas,
    criarTipoReceita,
    atualizarTipoReceita,
    excluirTipoReceita,
    exportarJson,
    handleSort,

    // Handlers do baseEntity
    handlePageChange: baseEntity.handlePageChange,
    handleFilterChange: baseEntity.updateFilter,
    handleSearchChange: baseEntity.setSearchTerm,
    clearFilters: baseEntity.clearFilters
  };
};

