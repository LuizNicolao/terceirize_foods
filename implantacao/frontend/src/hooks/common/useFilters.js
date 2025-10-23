/**
 * Hook base para gerenciamento de filtros
 * Gerencia estado e lógica de filtros de forma reutilizável
 */

import { useState, useCallback, useEffect } from 'react';

export const useFilters = (initialFilters = {}, semanaPadrao = '') => {
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState(''); // Termo aplicado na busca
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
   * Aplica o termo de busca (chamado quando pressiona Enter)
   */
  const applySearch = useCallback(() => {
    console.log('applySearch chamado com searchTerm:', searchTerm);
    setAppliedSearchTerm(searchTerm);
  }, [searchTerm]);

  /**
   * Limpa todos os filtros
   */
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setAppliedSearchTerm('');
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
      search: appliedSearchTerm || undefined,
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
  }, [appliedSearchTerm, semanaAbastecimento, filters]);

  /**
   * Verifica se há filtros ativos
   */
  const hasActiveFilters = useCallback(() => {
    return appliedSearchTerm !== '' || 
           semanaAbastecimento !== '' || 
           Object.values(filters).some(value => value && value !== 'todos' && value !== '');
  }, [appliedSearchTerm, semanaAbastecimento, filters]);

  return {
    // Estados básicos
    searchTerm,
    appliedSearchTerm,
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
    applySearch,
    getFilterParams,
    hasActiveFilters
  };
};