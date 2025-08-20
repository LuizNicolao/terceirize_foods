import React from 'react';
import { FaSearch } from 'react-icons/fa';

const UsuariosFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter 
}) => {
  return (
    <div className="flex gap-4 mb-6 items-center">
      <input
        type="text"
        placeholder="Buscar por nome ou email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg text-base transition-all duration-300 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-200"
      />
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="px-4 py-2 border-2 border-gray-300 rounded-lg text-base bg-white cursor-pointer transition-all duration-300 focus:border-green-600 focus:outline-none min-w-[200px]"
      >
        <option value="todos">Todos os status</option>
        <option value="ativo">Ativo</option>
        <option value="inativo">Inativo</option>
      </select>
    </div>
  );
};

export default UsuariosFilters;
