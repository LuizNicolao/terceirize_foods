import { useState, useCallback, useMemo } from 'react';

/**
 * Hook para Ordenação Híbrida de Tabelas
 * 
 * Estratégia:
 * - Se total de itens <= threshold: ordena localmente (frontend)
 * - Se total de itens > threshold: ordena no backend (via callback)
 * 
 * @param {Array} data - Dados a serem ordenados
 * @param {string} defaultField - Campo padrão para ordenação inicial
 * @param {string} defaultDirection - Direção padrão ('asc', 'desc', null)
 * @param {number} threshold - Limite para decidir entre local/backend (padrão: 100)
 * @param {function} onBackendSort - Callback para ordenação no backend (recebe field e direction)
 * @param {number} totalItems - Total de itens no backend (para decisão híbrida)
 * @returns {Object} { sortedData, sortField, sortDirection, handleSort, isSortingLocally }
 */
const useTableSort = ({
  data = [],
  defaultField = null,
  defaultDirection = null,
  threshold = 100,
  onBackendSort = null,
  totalItems = null
}) => {
  const [sortField, setSortField] = useState(defaultField);
  const [sortDirection, setSortDirection] = useState(defaultDirection);

  // Determina se deve ordenar localmente ou no backend
  const shouldSortLocally = useMemo(() => {
    // Se não tem callback de backend, sempre ordena localmente
    if (!onBackendSort) return true;
    
    // Se tem totalItems (do backend), usa ele para decidir
    if (totalItems !== null) {
      return totalItems <= threshold;
    }
    
    // Caso contrário, usa o tamanho dos dados locais
    return data.length <= threshold;
  }, [data.length, totalItems, threshold, onBackendSort]);

  /**
   * Alterna a direção de ordenação
   * Ciclo: null → asc → desc → null
   */
  const getNextDirection = useCallback((currentField, currentDirection) => {
    if (currentField !== sortField) {
      // Novo campo: começa com 'asc'
      return 'asc';
    }
    
    // Mesmo campo: cicla através das direções
    if (currentDirection === null || currentDirection === undefined) {
      return 'asc';
    } else if (currentDirection === 'asc') {
      return 'desc';
    } else {
      return null; // Remove ordenação
    }
  }, [sortField]);

  /**
   * Handler de clique no cabeçalho
   */
  const handleSort = useCallback((field) => {
    const nextDirection = getNextDirection(field, sortField === field ? sortDirection : null);
    
    setSortField(nextDirection === null ? null : field);
    setSortDirection(nextDirection);

    // Se deve ordenar no backend, chama o callback
    if (!shouldSortLocally && onBackendSort) {
      onBackendSort(nextDirection === null ? null : field, nextDirection);
    }
  }, [sortField, sortDirection, getNextDirection, shouldSortLocally, onBackendSort]);

  /**
   * Função de comparação para ordenação
   */
  const compareValues = useCallback((a, b, field, direction) => {
    // Acessa valores aninhados (ex: 'usuario.nome')
    const getNestedValue = (obj, path) => {
      return path.split('.').reduce((value, key) => value?.[key], obj);
    };

    let aValue = getNestedValue(a, field);
    let bValue = getNestedValue(b, field);

    // Trata valores null/undefined
    if (aValue === null || aValue === undefined) aValue = '';
    if (bValue === null || bValue === undefined) bValue = '';

    // Converte para string para comparação case-insensitive
    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();

    // Comparação
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  }, []);

  /**
   * Dados ordenados (apenas se ordenação local)
   */
  const sortedData = useMemo(() => {
    // Se não deve ordenar localmente, retorna dados originais
    if (!shouldSortLocally) {
      return data;
    }

    // Se não tem ordenação ativa, retorna dados originais
    if (!sortField || !sortDirection) {
      return data;
    }

    // Ordena localmente
    return [...data].sort((a, b) => compareValues(a, b, sortField, sortDirection));
  }, [data, sortField, sortDirection, shouldSortLocally, compareValues]);

  /**
   * Reset da ordenação
   */
  const resetSort = useCallback(() => {
    setSortField(null);
    setSortDirection(null);
    
    if (!shouldSortLocally && onBackendSort) {
      onBackendSort(null, null);
    }
  }, [shouldSortLocally, onBackendSort]);

  return {
    sortedData,           // Dados ordenados (se local) ou originais (se backend)
    sortField,            // Campo atual de ordenação
    sortDirection,        // Direção atual ('asc', 'desc', null)
    handleSort,           // Handler para clicar no cabeçalho
    resetSort,            // Função para resetar ordenação
    isSortingLocally: shouldSortLocally, // Flag indicando se ordena localmente
    isActive: sortField !== null && sortDirection !== null // Flag se tem ordenação ativa
  };
};

export default useTableSort;

