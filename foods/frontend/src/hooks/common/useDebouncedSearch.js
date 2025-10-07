/**
 * Hook para busca com Enter
 * Implementa busca apenas quando Enter é pressionado, ao invés de debounce automático
 */

import { useState, useCallback } from 'react';

export const useDebouncedSearch = (delay = 500) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Função para atualizar o termo de busca (apenas visual)
  const updateSearchTerm = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  // Função para executar a busca (chamada quando Enter é pressionado)
  const executeSearch = useCallback(() => {
    setIsSearching(true);
    setDebouncedSearchTerm(searchTerm);
    setIsSearching(false);
  }, [searchTerm]);

  // Função para limpar a busca
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  }, []);

  // Função para obter parâmetros de busca para API
  const getSearchParams = useCallback(() => {
    return {
      search: debouncedSearchTerm || undefined,
      isSearching
    };
  }, [debouncedSearchTerm, isSearching]);

  // Função para lidar com teclas pressionadas
  const handleKeyPress = useCallback((event) => {
    if (event.key === 'Enter') {
      executeSearch();
    }
  }, [executeSearch]);

  return {
    searchTerm,
    debouncedSearchTerm,
    isSearching,
    updateSearchTerm,
    executeSearch,
    clearSearch,
    getSearchParams,
    handleKeyPress
  };
};

export default useDebouncedSearch;
