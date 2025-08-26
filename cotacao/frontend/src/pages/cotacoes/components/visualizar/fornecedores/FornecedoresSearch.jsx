import React from 'react';
import { FaSearch } from 'react-icons/fa';

const FornecedoresSearch = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="relative">
      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Buscar fornecedor..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
      />
    </div>
  );
};

export default FornecedoresSearch;
