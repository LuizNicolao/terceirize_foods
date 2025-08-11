import React from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

const CadastroFilterBar = ({ 
  searchTerm, 
  onSearchChange, 
  onClear, 
  placeholder = "Buscar...",
  className = "" 
}) => {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4 ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          {searchTerm && (
            <button
              onClick={onClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CadastroFilterBar;
