/**
 * Hook base para gerenciamento de filtros
 * Gerencia estado e lógica de filtros de forma reutilizável
 * Segue padrão do foods
 */

import { useState, useCallback } from 'react';

export const useFilters = (initialFilters = {}, semanaPadrao = '') => {
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState(''); // Termo aplicado na busca
  const [statusFilter, setStatusFilter] = useState('todos');
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
    setAppliedSearchTerm(searchTerm);
  }, [searchTerm]);

  /**
   * Limpa todos os filtros
   */
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setAppliedSearchTerm('');
    setStatusFilter('todos');
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
   * Mapeia nomes de filtros para nomes de parâmetros da API (padrão foods)
   */
  const getFilterParams = useCallback(() => {
    const params = {
      search: appliedSearchTerm || undefined,
      status: statusFilter === 'ativo' ? 1 : statusFilter === 'inativo' ? 0 : undefined,
      semana_abastecimento: semanaAbastecimento || undefined
    };

    // Mapeamento de nomes de filtros para nomes de parâmetros da API (padrão foods)
    const filterMapping = {
      'rotaFilter': 'rota_id',
      'filialFilter': 'filial_id',
      'grupoFilter': 'grupo_id',
      'subgrupoFilter': 'subgrupo_id',
      'classeFilter': 'classe_id',
      'produtoOrigemFilter': 'produto_origem_id',
      'produtoFilter': 'produto_id',
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
  }, [appliedSearchTerm, statusFilter, semanaAbastecimento, filters]);

  /**
   * Verifica se há filtros ativos
   */
  const hasActiveFilters = useCallback(() => {
    return appliedSearchTerm !== '' || 
           statusFilter !== 'todos' ||
           semanaAbastecimento !== '' || 
           Object.values(filters).some(value => value && value !== 'todos' && value !== '');
  }, [appliedSearchTerm, statusFilter, semanaAbastecimento, filters]);

  return {
    // Estados básicos
    searchTerm,
    appliedSearchTerm,
    statusFilter,
    semanaAbastecimento,
    filters,
    
    // Setters básicos
    setSearchTerm,
    setStatusFilter,
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