import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import necessidadesService from '../services/necessidades';
import { useBaseEntity } from './common/useBaseEntity';

/**
 * Hook para gerenciar necessidades
 * Inclui CRUD completo, paginação, filtros e busca
 */
export const useNecessidades = () => {
  const baseEntity = useBaseEntity('necessidades', necessidadesService, {
    initialFilters: {
      search: '',
      filial_id: '',
      centro_custo_id: '',
      contrato_id: '',
      cardapio_id: '',
      mes_ref: '',
      ano: '',
      status: ''
    }
  });

  // Estados de ordenação
  const [sortField, setSortField] = useState('criado_em');
  const [sortDirection, setSortDirection] = useState('DESC');

  /**
   * Carregar necessidades
   */
  const carregarNecessidades = useCallback(async () => {
    try {
      await baseEntity.loadData({
        sortField: sortField,
        sortDirection: sortDirection
      });
    } catch (error) {
      console.error('Erro ao carregar necessidades:', error);
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
   * Pré-visualizar necessidade
   */
  const previsualizarNecessidade = useCallback(async (dados) => {
    try {
      const response = await necessidadesService.previsualizar(dados);
      
      if (response.success) {
        return response;
      } else {
        toast.error(response.error || 'Erro ao pré-visualizar necessidade');
        return response;
      }
    } catch (err) {
      toast.error('Erro ao pré-visualizar necessidade');
      return {
        success: false,
        error: err.message || 'Erro ao pré-visualizar necessidade'
      };
    }
  }, []);

  /**
   * Gerar necessidade
   */
  const gerarNecessidade = useCallback(async (dados) => {
    try {
      const response = await necessidadesService.gerar(dados);
      
      if (response.success) {
        toast.success(response.message || 'Necessidade gerada com sucesso!');
        await carregarNecessidades();
        return response;
      } else {
        // Se for conflito (necessidade já existe), não mostra erro genérico
        if (response.conflict) {
          return response;
        }
        toast.error(response.error || 'Erro ao gerar necessidade');
        return response;
      }
    } catch (err) {
      toast.error('Erro ao gerar necessidade');
      return {
        success: false,
        error: err.message || 'Erro ao gerar necessidade'
      };
    }
  }, [carregarNecessidades]);

  /**
   * Recalcular necessidade
   */
  const recalcularNecessidade = useCallback(async (id) => {
    try {
      const response = await necessidadesService.recalcular(id);
      
      if (response.success) {
        toast.success(response.message || 'Necessidade recalculada com sucesso!');
        await carregarNecessidades();
        return response;
      } else {
        toast.error(response.error || 'Erro ao recalcular necessidade');
        return response;
      }
    } catch (err) {
      toast.error('Erro ao recalcular necessidade');
      return {
        success: false,
        error: err.message || 'Erro ao recalcular necessidade'
      };
    }
  }, [carregarNecessidades]);

  /**
   * Excluir necessidade
   */
  const excluirNecessidade = useCallback(async (id) => {
    try {
      const response = await necessidadesService.excluir(id);
      
      if (response.success) {
        toast.success(response.message || 'Necessidade excluída com sucesso!');
        await carregarNecessidades();
        return response;
      } else {
        toast.error(response.error || 'Erro ao excluir necessidade');
        return response;
      }
    } catch (err) {
      toast.error('Erro ao excluir necessidade');
      return {
        success: false,
        error: err.message || 'Erro ao excluir necessidade'
      };
    }
  }, [carregarNecessidades]);

  /**
   * Exportar necessidades em JSON
   */
  const exportarJson = useCallback(async () => {
    try {
      const response = await necessidadesService.exportarJSON(baseEntity.filters);
      
      if (response.success) {
        // Criar arquivo JSON para download
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `necessidades_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success('Necessidades exportadas com sucesso!');
        return response;
      } else {
        toast.error(response.error || 'Erro ao exportar necessidades');
        return response;
      }
    } catch (err) {
      toast.error('Erro ao exportar necessidades');
      return {
        success: false,
        error: err.message || 'Erro ao exportar necessidades'
      };
    }
  }, [baseEntity.filters]);

  return {
    // Estados do baseEntity
    necessidades: baseEntity.items,
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
    carregarNecessidades,
    handleSort,
    previsualizarNecessidade,
    gerarNecessidade,
    recalcularNecessidade,
    excluirNecessidade,
    exportarJson
  };
};
