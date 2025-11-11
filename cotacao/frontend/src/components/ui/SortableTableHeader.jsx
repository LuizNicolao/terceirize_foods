import React from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const SortableTableHeader = ({ label, field, currentSort, currentDirection, onSort }) => {
  const isActive = currentSort === field;

  const renderIcon = () => {
    if (!isActive) {
      return <FaSort className="w-3 h-3 text-gray-400" />;
    }

    if (currentDirection === 'asc') {
      return <FaSortUp className="w-3 h-3 text-green-600" />;
    }

    return <FaSortDown className="w-3 h-3 text-green-600" />;
  };

  return (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {renderIcon()}
      </span>
    </th>
  );
};

export default SortableTableHeader;
