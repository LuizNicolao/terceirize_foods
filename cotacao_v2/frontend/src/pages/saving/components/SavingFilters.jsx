import React from 'react';
import { FaFilter, FaTimes, FaSearch, FaCalendar, FaUser } from 'react-icons/fa';

const SavingFilters = ({ 
  filtros, 
  compradores,
  updateFiltros, 
  aplicarFiltros,
  limparFiltros 
}) => {
  const handleCompradorChange = (e) => {
    updateFiltros({ comprador: e.target.value });
  };

  const handleTipoChange = (e) => {
    updateFiltros({ tipo: e.target.value });
  };

  const handleStatusChange = (e) => {
    updateFiltros({ status: e.target.value });
  };

  const handleDataInicioChange = (e) => {
    updateFiltros({ data_inicio: e.target.value });
  };

  const handleDataFimChange = (e) => {
    updateFiltros({ data_fim: e.target.value });
  };

  const hasActiveFilters = filtros.comprador || filtros.tipo || filtros.status || filtros.data_inicio || filtros.data_fim;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <FaFilter className="mr-2" />
          Filtros
        </h3>
        {hasActiveFilters && (
          <button
            onClick={limparFiltros}
            className="text-red-600 hover:text-red-800 flex items-center text-sm"
          >
            <FaTimes className="mr-1" />
            Limpar Filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        {/* Comprador */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comprador
          </label>
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filtros.comprador}
              onChange={handleCompradorChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos os compradores</option>
              {compradores.map((comprador) => (
                <option key={comprador} value={comprador}>
                  {comprador}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo
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
            <option value="aprovado">Aprovado</option>
            <option value="pendente">Pendente</option>
            <option value="rejeitado">Rejeitado</option>
          </select>
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
              value={filtros.data_inicio}
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
              value={filtros.data_fim}
              onChange={handleDataFimChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={limparFiltros}
          className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          Limpar
        </button>
        <button
          onClick={aplicarFiltros}
          className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
        >
          Aplicar Filtros
        </button>
      </div>
    </div>
  );
};

export default SavingFilters;
