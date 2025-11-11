import { useState, useCallback } from 'react';

export const useFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setSearchTerm('');
    setStatusFilter('todos');
  }, [initialFilters]);

  const getFilterParams = useCallback(() => ({
    ...filters,
    search: searchTerm || undefined,
    status: statusFilter !== 'todos' ? statusFilter : undefined
  }), [filters, searchTerm, statusFilter]);

  return {
    filters,
    searchTerm,
    statusFilter,
    setFilters,
    setSearchTerm,
    setStatusFilter,
    updateFilter,
    updateFilters,
    clearFilters,
    getFilterParams
  };
};

