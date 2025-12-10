import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import contratosService from '../services/contratos';
import { useBaseEntity } from './common/useBaseEntity';

/**
 * Hook para gerenciar contratos
 * Inclui CRUD completo, paginação, filtros e busca
 */
export const useContratos = () => {
  const baseEntity = useBaseEntity('contratos', contratosService, {
    initialFilters: {
      search: '',
      status: ''
    }
  });

  // Estados de ordenação
  const [sortField, setSortField] = useState('criado_em');
  const [sortDirection, setSortDirection] = useState('DESC');

  /**
   * Carregar contratos
   */
  const carregarContratos = useCallback(async () => {
    try {
      await baseEntity.loadData({
        sortBy: sortField,
        sortOrder: sortDirection
      });
    } catch (error) {
      console.error('Erro ao carregar contratos:', error);
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
   * Criar contrato
   */
  const criarContrato = useCallback(async (dados) => {
    try {
      const response = await contratosService.criar(dados);
      
      if (response.success) {
        toast.success(response.message || 'Contrato criado com sucesso!');
        await carregarContratos();
        return response;
      } else {
        toast.error(response.error || 'Erro ao criar contrato');
        return response;
      }
    } catch (err) {
      toast.error('Erro ao criar contrato');
      return {
        success: false,
        error: err.message || 'Erro ao criar contrato'
      };
    }
  }, [carregarContratos]);

  /**
   * Atualizar contrato
   */
  const atualizarContrato = useCallback(async (id, dados) => {
    try {
      const response = await contratosService.atualizar(id, dados);
      
      if (response.success) {
        toast.success(response.message || 'Contrato atualizado com sucesso!');
        await carregarContratos();
        return response;
      } else {
        toast.error(response.error || 'Erro ao atualizar contrato');
        return response;
      }
    } catch (err) {
      toast.error('Erro ao atualizar contrato');
      return {
        success: false,
        error: err.message || 'Erro ao atualizar contrato'
      };
    }
  }, [carregarContratos]);

  /**
   * Vincular unidades a um contrato
   */
  const vincularUnidades = useCallback(async (id, cozinha_industrial_ids) => {
    try {
      const response = await contratosService.vincularUnidades(id, cozinha_industrial_ids);
      
      if (response.success) {
        toast.success(response.message || 'Unidades vinculadas com sucesso!');
        await carregarContratos();
        return response;
      } else {
        toast.error(response.error || 'Erro ao vincular unidades');
        return response;
      }
    } catch (err) {
      toast.error('Erro ao vincular unidades');
      return {
        success: false,
        error: err.message || 'Erro ao vincular unidades'
      };
    }
  }, [carregarContratos]);

  /**
   * Vincular produtos a um contrato
   */
  const vincularProdutos = useCallback(async (id, produtos) => {
    try {
      const response = await contratosService.vincularProdutos(id, produtos);
      
      if (response.success) {
        toast.success(response.message || 'Produtos vinculados com sucesso!');
        await carregarContratos();
        return response;
      } else {
        toast.error(response.error || 'Erro ao vincular produtos');
        return response;
      }
    } catch (err) {
      toast.error('Erro ao vincular produtos');
      return {
        success: false,
        error: err.message || 'Erro ao vincular produtos'
      };
    }
  }, [carregarContratos]);

  /**
   * Excluir contrato
   */
  const excluirContrato = useCallback(async (id) => {
    try {
      const response = await contratosService.excluir(id);
      
      if (response.success) {
        toast.success(response.message || 'Contrato excluído com sucesso!');
        await carregarContratos();
        return response;
      } else {
        toast.error(response.error || 'Erro ao excluir contrato');
        return response;
      }
    } catch (err) {
      toast.error('Erro ao excluir contrato');
      return {
        success: false,
        error: err.message || 'Erro ao excluir contrato'
      };
    }
  }, [carregarContratos]);

  /**
   * Exportar contratos
   */
  const exportarJson = async () => {
    try {
      const result = await contratosService.exportarJson();
      if (result.success) {
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `contratos_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Contratos exportados com sucesso');
      } else {
        toast.error(result.error || 'Erro ao exportar contratos');
      }
    } catch (err) {
      toast.error('Erro ao exportar contratos');
    }
  };

  return {
    // Estados do baseEntity
    contratos: baseEntity.items,
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
    
    // Estados de ordenação
    sortField,
    sortDirection,
    
    // Funções do baseEntity
    carregarContratos,
    handleSearchChange: baseEntity.setSearchTerm,
    handlePageChange: baseEntity.handlePageChange,
    clearFilters: baseEntity.clearFilters,
    
    // Funções específicas
    handleSort,
    criarContrato,
    atualizarContrato,
    excluirContrato,
    vincularUnidades,
    vincularProdutos,
    exportarJson
  };
};

