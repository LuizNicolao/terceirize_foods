import React from 'react';
import { FaSearch, FaTimes, FaFilter } from 'react-icons/fa';
import { Input, Button } from '../../../components/ui';

const ProdutosPerCapitaFilters = ({ 
  filtros = {}, 
  onFilterChange, 
  onClearFilters, 
  loading 
}) => {
  const handleSearchChange = (e) => {
    onFilterChange({ ...filtros, search: e.target.value });
  };

  const handleStatusChange = (e) => {
    onFilterChange({ ...filtros, status: e.target.value });
  };

  const hasActiveFilters = filtros?.search || filtros?.status;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <FaFilter className="w-4 h-4 text-gray-500" />
        <h3 className="text-sm font-medium text-gray-700">Filtros</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Busca */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Buscar por nome ou código..."
            value={filtros?.search || ''}
            onChange={handleSearchChange}
            className="pl-10"
            disabled={loading}
          />
        </div>

        {/* Status */}
        <div>
          <select
            value={filtros?.status || ''}
            onChange={handleStatusChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>

        {/* Botão Limpar */}
        {hasActiveFilters && (
          <div className="flex items-end">
            <Button
              onClick={onClearFilters}
              variant="outline"
              size="sm"
              className="text-gray-600 border-gray-300 hover:bg-gray-50 flex items-center gap-2"
              disabled={loading}
            >
              <FaTimes className="w-4 h-4" />
              Limpar Filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProdutosPerCapitaFilters;
