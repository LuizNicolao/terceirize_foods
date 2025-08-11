import React from 'react';
import { FaFilter, FaTimes, FaSearch, FaCalendar, FaUser } from 'react-icons/fa';

const AprovacoesFilters = ({ 
  filtros, 
  updateFiltros, 
  clearFiltros 
}) => {
  const handleStatusChange = (e) => {
    updateFiltros({ status: e.target.value });
  };

  const handleTipoChange = (e) => {
    updateFiltros({ tipo: e.target.value });
  };

  const handleCompradorChange = (e) => {
    updateFiltros({ comprador: e.target.value });
  };

  const handleDataInicioChange = (e) => {
    updateFiltros({ dataInicio: e.target.value });
  };

  const handleDataFimChange = (e) => {
    updateFiltros({ dataFim: e.target.value });
  };

  const hasActiveFilters = filtros.status || filtros.tipo || filtros.comprador || filtros.dataInicio || filtros.dataFim;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <FaFilter className="mr-2" />
          Filtros
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFiltros}
            className="text-red-600 hover:text-red-800 flex items-center text-sm"
          >
            <FaTimes className="mr-1" />
            Limpar Filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filtros.status}
            onChange={handleStatusChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos os status</option>
            <option value="aguardando_aprovacao">Aguardando Aprovação</option>
            <option value="aguardando_aprovacao_supervisor">Aguardando Supervisor</option>
            <option value="aprovado">Aprovado</option>
            <option value="rejeitado">Rejeitado</option>
            <option value="renegociacao">Em Renegociação</option>
          </select>
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Compra
          </label>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={filtros.tipo}
              onChange={handleTipoChange}
              placeholder="Buscar por tipo..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Comprador */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comprador
          </label>
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={filtros.comprador}
              onChange={handleCompradorChange}
              placeholder="Buscar por comprador..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Data Início */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Início
          </label>
          <div className="relative">
            <FaCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={filtros.dataInicio}
              onChange={handleDataInicioChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Data Fim */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Fim
          </label>
          <div className="relative">
            <FaCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={filtros.dataFim}
              onChange={handleDataFimChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AprovacoesFilters;
