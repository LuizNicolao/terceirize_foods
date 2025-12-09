import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import periodosAtendimentoService from '../services/periodosAtendimento';
import { useBaseEntity } from './common/useBaseEntity';

/**
 * Hook para gerenciar períodos de atendimento
 * Inclui CRUD completo, paginação, filtros e busca
 */
export const usePeriodosAtendimento = () => {
  const baseEntity = useBaseEntity('periodos_atendimento', periodosAtendimentoService, {
    initialFilters: {
      search: '',
      status: ''
    }
  });

  // Estados de ordenação
  const [sortField, setSortField] = useState('criado_em');
  const [sortDirection, setSortDirection] = useState('DESC');

  /**
   * Carregar períodos de atendimento
   */
  const carregarPeriodosAtendimento = useCallback(async () => {
    try {
      await baseEntity.loadData({
        sortBy: sortField,
        sortOrder: sortDirection
      });
    } catch (error) {
      console.error('Erro ao carregar períodos de atendimento:', error);
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
   * Criar período de atendimento
   */
  const criarPeriodoAtendimento = useCallback(async (dados) => {
    try {
      const response = await periodosAtendimentoService.criar(dados);
      
      if (response.success) {
        toast.success(response.message || 'Período de atendimento criado com sucesso!');
        await carregarPeriodosAtendimento();
        return response;
      } else {
        toast.error(response.error || 'Erro ao criar período de atendimento');
        return response;
      }
    } catch (err) {
      toast.error('Erro ao criar período de atendimento');
      return {
        success: false,
        error: err.message || 'Erro ao criar período de atendimento'
      };
    }
  }, [carregarPeriodosAtendimento]);

  /**
   * Atualizar período de atendimento
   */
  const atualizarPeriodoAtendimento = useCallback(async (id, dados) => {
    try {
      const response = await periodosAtendimentoService.atualizar(id, dados);
      
      if (response.success) {
        toast.success(response.message || 'Período de atendimento atualizado com sucesso!');
        await carregarPeriodosAtendimento();
        return response;
      } else {
        toast.error(response.error || 'Erro ao atualizar período de atendimento');
        return response;
      }
    } catch (err) {
      toast.error('Erro ao atualizar período de atendimento');
      return {
        success: false,
        error: err.message || 'Erro ao atualizar período de atendimento'
      };
    }
  }, [carregarPeriodosAtendimento]);

  /**
   * Vincular unidades a um período
   */
  const vincularUnidades = useCallback(async (id, cozinha_industrial_ids) => {
    try {
      const response = await periodosAtendimentoService.vincularUnidades(id, cozinha_industrial_ids);
      
      if (response.success) {
        toast.success(response.message || 'Unidades vinculadas com sucesso!');
        await carregarPeriodosAtendimento();
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
  }, [carregarPeriodosAtendimento]);

  /**
   * Desvincular unidade de um período
   */
  const desvincularUnidade = useCallback(async (id, unidadeId) => {
    try {
      const response = await periodosAtendimentoService.desvincularUnidade(id, unidadeId);
      
      if (response.success) {
        toast.success(response.message || 'Unidade desvinculada com sucesso!');
        await carregarPeriodosAtendimento();
        return response;
      } else {
        toast.error(response.error || 'Erro ao desvincular unidade');
        return response;
      }
    } catch (err) {
      toast.error('Erro ao desvincular unidade');
      return {
        success: false,
        error: err.message || 'Erro ao desvincular unidade'
      };
    }
  }, [carregarPeriodosAtendimento]);

  /**
   * Excluir período de atendimento
   */
  const excluirPeriodoAtendimento = useCallback(async (id) => {
    try {
      const response = await periodosAtendimentoService.excluir(id);
      
      if (response.success) {
        toast.success(response.message || 'Período de atendimento excluído com sucesso!');
        await carregarPeriodosAtendimento();
        return response;
      } else {
        toast.error(response.error || 'Erro ao excluir período de atendimento');
        return response;
      }
    } catch (err) {
      toast.error('Erro ao excluir período de atendimento');
      return {
        success: false,
        error: err.message || 'Erro ao excluir período de atendimento'
      };
    }
  }, [carregarPeriodosAtendimento]);

  /**
   * Exportar períodos de atendimento
   */
  const exportarJson = async () => {
    try {
      const result = await periodosAtendimentoService.exportarJson();
      if (result.success) {
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `periodos_atendimento_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Períodos de atendimento exportados com sucesso');
      } else {
        toast.error(result.error || 'Erro ao exportar períodos de atendimento');
      }
    } catch (err) {
      toast.error('Erro ao exportar períodos de atendimento');
    }
  };

  return {
    // Estados do baseEntity (seguindo padrão de pratos)
    periodosAtendimento: baseEntity.items,
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
    carregarPeriodosAtendimento,
    handleSearchChange: baseEntity.setSearchTerm,
    handlePageChange: baseEntity.handlePageChange,
    clearFilters: baseEntity.clearFilters,
    
    // Funções específicas
    handleSort,
    criarPeriodoAtendimento,
    atualizarPeriodoAtendimento,
    excluirPeriodoAtendimento,
    vincularUnidades,
    desvincularUnidade,
    exportarJson
  };
};

