import React from 'react';
import { FaCalendarAlt, FaFilter } from 'react-icons/fa';
import { Button } from '../../ui';

const CalendarHeader = ({
  viewMode,
  setViewMode,
  selectedFilial,
  setSelectedFilial,
  loading,
  onRefresh,
  isViewMode
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center">
          <FaCalendarAlt className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-blue-800">
            Calendário de Compras e Entregas
          </h3>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isViewMode}
          >
            <option value="month">Mês</option>
            <option value="week">Semana</option>
            <option value="list">Lista</option>
          </select>
          
          <select
            value={selectedFilial}
            onChange={(e) => setSelectedFilial(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isViewMode}
          >
            <option value="all">Todas as Filiais</option>
            <option value="filial1">Filial 1</option>
            <option value="filial2">Filial 2</option>
          </select>
          
          <Button
            type="button"
            onClick={onRefresh}
            variant="outline"
            size="sm"
            disabled={isViewMode || loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                Atualizando...
              </>
            ) : (
              <>
                <FaFilter className="mr-1" />
                Atualizar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
