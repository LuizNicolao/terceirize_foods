import React from 'react';
import { FaFilter, FaTimes } from 'react-icons/fa';

const CotacoesFilters = ({ filters, updateFilters, clearFilters }) => {
  const handleInputChange = (field, value) => {
    updateFilters({ [field]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        </div>
        <button
          onClick={clearFilters}
          className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <FaTimes />
          Limpar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="aprovada">Aprovada</option>
            <option value="rejeitada">Rejeitada</option>
            <option value="em_analise">Em Análise</option>
          </select>
        </div>

        {/* Comprador */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comprador
          </label>
          <input
            type="text"
            value={filters.comprador}
            onChange={(e) => handleInputChange('comprador', e.target.value)}
            placeholder="Nome do comprador"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Tipo de Compra */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Compra
          </label>
          <select
            value={filters.tipoCompra}
            onChange={(e) => handleInputChange('tipoCompra', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Todos</option>
            <option value="normal">Normal</option>
            <option value="emergencial">Emergencial</option>
          </select>
        </div>

        {/* Data Início */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Início
          </label>
          <input
            type="date"
            value={filters.dataInicio}
            onChange={(e) => handleInputChange('dataInicio', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Data Fim */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Fim
          </label>
          <input
            type="date"
            value={filters.dataFim}
            onChange={(e) => handleInputChange('dataFim', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

export default CotacoesFilters;
