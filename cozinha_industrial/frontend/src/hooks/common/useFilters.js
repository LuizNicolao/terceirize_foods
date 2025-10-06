/**
 * Hook base para gerenciamento de filtros
 * Gerencia estado e lógica de filtros de forma reutilizável
 */

import { useState, useCallback, useEffect } from 'react';

export const useFilters = (initialFilters = {}, semanaPadrao = '') => {
  const [searchTerm, setSearchTerm] = useState('');
  const [semanaAbastecimento, setSemanaAbastecimento] = useState(semanaPadrao);
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
    setSemanaAbastecimento('');
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
      semana_abastecimento: semanaAbastecimento || undefined
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
  }, [searchTerm, semanaAbastecimento, filters]);

  /**
   * Verifica se há filtros ativos
   */
  const hasActiveFilters = useCallback(() => {
    return searchTerm !== '' || 
           semanaAbastecimento !== '' || 
           Object.values(filters).some(value => value && value !== 'todos' && value !== '');
  }, [searchTerm, semanaAbastecimento, filters]);

  return {
    // Estados básicos
    searchTerm,
    semanaAbastecimento,
    filters,
    
    // Setters básicos
    setSearchTerm,
    setSemanaAbastecimento,
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