import { useState, useMemo } from 'react';

const useTableSort = ({
  data = [],
  defaultField = null,
  defaultDirection = null,
  threshold = 100,
  totalItems = 0
}) => {
  const [sortField, setSortField] = useState(defaultField);
  const [sortDirection, setSortDirection] = useState(defaultDirection);

  const isSortingLocally = useMemo(() => {
    if (!sortField) return false;
    if (totalItems > threshold) return false;
    return true;
  }, [sortField, totalItems, threshold]);

  const sortedData = useMemo(() => {
    if (!isSortingLocally || !sortField) return data;

    const sorted = [...data].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue, 'pt-BR', { sensitivity: 'base' });
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return aValue - bValue;
      }

      return String(aValue).localeCompare(String(bValue), 'pt-BR', { sensitivity: 'base' });
    });

    if (sortDirection === 'desc') {
      sorted.reverse();
    }

    return sorted;
  }, [data, sortField, sortDirection, isSortingLocally]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return {
    sortedData,
    sortField,
    sortDirection,
    handleSort,
    isSortingLocally,
    setSortField,
    setSortDirection
  };
};

export default useTableSort;

