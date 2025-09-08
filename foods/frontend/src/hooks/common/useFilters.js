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
   */
  const getFilterParams = useCallback(() => {
    const params = {
      search: searchTerm || undefined,
      status: statusFilter === 'ativo' ? 1 : statusFilter === 'inativo' ? 0 : undefined
    };

    // Adiciona filtros customizados
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'todos' && value !== '') {
        params[key] = value;
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
