/**
 * Hook base para gerenciamento de filtros
 * Gerencia estado e lógica de filtros de forma reutilizável
 */

import { useState, useCallback, useEffect } from 'react';

export const useFilters = (initialFilters = {}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [filters, setFilters] = useState(initialFilters);

  /**
   * Atualiza um filtro específico
   */
  const updateFilter = useCallback((filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  }, []);

  /**
   * Atualiza múltiplos filtros
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  /**
   * Limpa todos os filtros
   */
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('todos');
    setFilters(initialFilters);
  }, [initialFilters]);

  /**
   * Limpa apenas filtros customizados
   */
  const clearCustomFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  /**
   * Gera parâmetros de filtro para API
   * Mapeia nomes de filtros para nomes de parâmetros da API
   */
  const getFilterParams = useCallback(() => {
    const params = {
      search: searchTerm || undefined,
      status: statusFilter === 'ativo' ? 1 : statusFilter === 'inativo' ? 0 : undefined
    };

    // Mapeamento de nomes de filtros para nomes de parâmetros da API
    const filterMapping = {
      'rotaFilter': 'rota_id',
      'filialFilter': 'filial_id',
      'grupoFilter': 'grupo_id',
      'subgrupoFilter': 'subgrupo_id',
      'classeFilter': 'classe_id',
      'produtoOrigemFilter': 'produto_origem_id',
      'ufFilter': 'uf',
      'tipoFilter': 'tipo'
    };

    // Adiciona filtros customizados com mapeamento
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'todos' && value !== '') {
        const apiKey = filterMapping[key] || key;
        params[apiKey] = value;
      }
    });

    // Remove valores undefined
    return Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    );
  }, [searchTerm, statusFilter, filters]);

  /**
   * Verifica se há filtros ativos
   */
  const hasActiveFilters = useCallback(() => {
    return searchTerm !== '' || 
           statusFilter !== 'todos' || 
           Object.values(filters).some(value => value && value !== 'todos' && value !== '');
  }, [searchTerm, statusFilter, filters]);

  return {
    // Estados básicos
    searchTerm,
    statusFilter,
    filters,
    
    // Setters básicos
    setSearchTerm,
    setStatusFilter,
    setFilters,
    
    // Ações
    updateFilter,
    updateFilters,
    clearFilters,
    clearCustomFilters,
    getFilterParams,
    hasActiveFilters
  };
};
