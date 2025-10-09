import React from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

/**
 * Componente de Cabeçalho de Tabela Ordenável
 * 
 * @param {string} label - Texto exibido no cabeçalho
 * @param {string} field - Campo do objeto para ordenar
 * @param {string} currentSort - Campo atualmente ordenado
 * @param {string} currentDirection - Direção atual ('asc', 'desc', null)
 * @param {function} onSort - Callback quando clica no cabeçalho
 * @param {string} align - Alinhamento do texto ('left', 'center', 'right')
 * @param {string} className - Classes CSS adicionais
 */
const SortableTableHeader = ({ 
  label, 
  field, 
  currentSort, 
  currentDirection, 
  onSort,
  align = 'left',
  className = ''
}) => {
  const isActive = currentSort === field;
  const isAscending = isActive && currentDirection === 'asc';
  const isDescending = isActive && currentDirection === 'desc';

  const handleClick = () => {
    onSort(field);
  };

  const getIcon = () => {
    if (isAscending) {
      return <FaSortUp className="text-blue-600" />;
    }
    if (isDescending) {
      return <FaSortDown className="text-blue-600" />;
    }
    return <FaSort className="text-gray-400" />;
  };

  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[align];

  return (
    <th 
      className={`px-6 py-3 ${alignClass} text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none ${className}`}
      onClick={handleClick}
      title={`Ordenar por ${label}`}
    >
      <div className="flex items-center gap-2 justify-between">
        <span className={isActive ? 'text-blue-600 font-semibold' : ''}>
          {label}
        </span>
        <span className="flex-shrink-0">
          {getIcon()}
        </span>
      </div>
    </th>
  );
};

export default SortableTableHeader;

