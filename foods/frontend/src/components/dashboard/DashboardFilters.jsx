import React, { useState } from 'react';
import { 
  FaCalendar, 
  FaFilter, 
  FaSearch, 
  FaTimes,
  FaSync
} from 'react-icons/fa';

export const DashboardFilters = ({ onFilterChange, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('hoje');
  const [activeFilters, setActiveFilters] = useState([]);

  const periods = [
    { value: 'hoje', label: 'Hoje' },
    { value: 'semana', label: 'Esta Semana' },
    { value: 'mes', label: 'Este Mês' },
    { value: 'trimestre', label: 'Este Trimestre' },
    { value: 'ano', label: 'Este Ano' }
  ];

  const quickFilters = [
    { id: 'estoque_baixo', label: 'Estoque Baixo', color: 'red' },
    { id: 'documentacao_vencendo', label: 'Doc. Vencendo', color: 'orange' },
    { id: 'atividades_recentes', label: 'Atividades Recentes', color: 'blue' },
    { id: 'alertas_criticos', label: 'Alertas Críticos', color: 'red' }
  ];

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    onFilterChange({ search: value, period: selectedPeriod, filters: activeFilters });
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    onFilterChange({ search: searchTerm, period, filters: activeFilters });
  };

  const toggleFilter = (filterId) => {
    const newFilters = activeFilters.includes(filterId)
      ? activeFilters.filter(f => f !== filterId)
      : [...activeFilters, filterId];
    
    setActiveFilters(newFilters);
    onFilterChange({ search: searchTerm, period: selectedPeriod, filters: newFilters });
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedPeriod('hoje');
    setActiveFilters([]);
    onFilterChange({ search: '', period: 'hoje', filters: [] });
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
        {/* Busca */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar na dashboard..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <FaTimes className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Período */}
        <div className="flex items-center space-x-2">
          <FaCalendar className="text-gray-400 h-4 w-4" />
          <select
            value={selectedPeriod}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {periods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <FaSync className="mr-2 h-4 w-4" />
            Atualizar
          </button>
          
          {(searchTerm || activeFilters.length > 0) && (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <FaTimes className="mr-2 h-4 w-4" />
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Filtros Rápidos */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2 mb-3">
          <FaFilter className="text-gray-400 h-4 w-4" />
          <span className="text-sm font-medium text-gray-700">Filtros Rápidos:</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => toggleFilter(filter.id)}
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                activeFilters.includes(filter.id)
                  ? `bg-${filter.color}-100 text-${filter.color}-800 border border-${filter.color}-200`
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Filtros Ativos */}
        {activeFilters.length > 0 && (
          <div className="mt-3 flex items-center space-x-2">
            <span className="text-xs text-gray-500">Filtros ativos:</span>
            {activeFilters.map((filterId) => {
              const filter = quickFilters.find(f => f.id === filterId);
              return (
                <span
                  key={filterId}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${filter.color}-100 text-${filter.color}-800`}
                >
                  {filter.label}
                  <button
                    onClick={() => toggleFilter(filterId)}
                    className="ml-1 hover:text-red-600"
                  >
                    <FaTimes className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
