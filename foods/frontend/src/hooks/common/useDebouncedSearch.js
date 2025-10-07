/**
 * Hook para busca com debounce
 * Implementa busca com delay para otimizar performance e evitar muitas requisições
 */

import { useState, useEffect, useCallback } from 'react';

export const useDebouncedSearch = (delay = 500) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounce effect
  useEffect(() => {
    setIsSearching(true);
    
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, delay);

    return () => {
      clearTimeout(timer);
      setIsSearching(false);
    };
  }, [searchTerm, delay]);

  // Função para atualizar o termo de busca
  const updateSearchTerm = useCallback((term) => {
    setSearchTerm(term);
  }, []);

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

  return {
    searchTerm,
    debouncedSearchTerm,
    isSearching,
    updateSearchTerm,
    clearSearch,
    getSearchParams
  };
};

export default useDebouncedSearch;
