import React from 'react';
import { FaFilter, FaTimes, FaSearch } from 'react-icons/fa';

const SupervisorFilters = ({ 
  searchTerm, 
  selectedFornecedor, 
  sortBy, 
  sortOrder, 
  updateFilters, 
  clearFilters,
  fornecedores 
}) => {
  const handleSearchChange = (e) => {
    updateFilters({ searchTerm: e.target.value });
  };

  const handleFornecedorChange = (e) => {
    updateFilters({ selectedFornecedor: e.target.value });
  };

  const handleSortChange = (e) => {
    updateFilters({ sortBy: e.target.value });
  };

  const handleOrderChange = (e) => {
    updateFilters({ sortOrder: e.target.value });
  };

  const hasActiveFilters = searchTerm || selectedFornecedor;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <FaFilter className="mr-2" />
          Filtros
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-red-600 hover:text-red-800 flex items-center text-sm"
          >
            <FaTimes className="mr-1" />
            Limpar Filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Busca */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar
          </label>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Buscar por comprador, local..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Fornecedor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fornecedor
          </label>
          <select
            value={selectedFornecedor}
            onChange={handleFornecedorChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos os fornecedores</option>
            {fornecedores?.map((fornecedor) => (
              <option key={fornecedor} value={fornecedor}>
                {fornecedor}
              </option>
            ))}
          </select>
        </div>

        {/* Ordenar por */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ordenar por
          </label>
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="nome">Nome</option>
            <option value="data">Data</option>
            <option value="status">Status</option>
            <option value="valor">Valor</option>
          </select>
        </div>

        {/* Ordem */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ordem
          </label>
          <select
            value={sortOrder}
            onChange={handleOrderChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="asc">Crescente</option>
            <option value="desc">Decrescente</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SupervisorFilters;
