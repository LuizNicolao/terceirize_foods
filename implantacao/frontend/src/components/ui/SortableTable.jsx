import React, { useState } from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

/**
 * Componente de cabeçalho clicável para ordenação
 */
const SortableHeader = ({ field, currentSort, onSort, children, className = "" }) => {
  const isActive = currentSort.field === field;
  const getSortIcon = () => {
    if (!isActive) return <FaSort className="ml-1 text-gray-400" />;
    return currentSort.direction === 'asc' 
      ? <FaSortUp className="ml-1 text-green-600" />
      : <FaSortDown className="ml-1 text-green-600" />;
  };

  return (
    <th 
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors ${className}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center">
        {children}
        {getSortIcon()}
      </div>
    </th>
  );
};

/**
 * Hook para gerenciar ordenação
 */
export const useSorting = (initialField = null, initialDirection = 'asc') => {
  const [sortConfig, setSortConfig] = useState({
    field: initialField,
    direction: initialDirection
  });

  const handleSort = (field) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortData = (data) => {
    if (!sortConfig.field) return data;

    return [...data].sort((a, b) => {
      let aValue = a[sortConfig.field];
      let bValue = b[sortConfig.field];

      // Tratar valores nulos/undefined
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      // Converter para string para comparação
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();

      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  return {
    sortConfig,
    handleSort,
    sortData
  };
};

export { SortableHeader };
