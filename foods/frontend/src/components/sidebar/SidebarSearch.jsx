import React from 'react';
import { FaSearch } from 'react-icons/fa';

const SidebarSearch = ({ searchTerm, onSearchChange, collapsed }) => {
  if (collapsed) return null;

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar menu..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>
    </div>
  );
};

export default SidebarSearch;
