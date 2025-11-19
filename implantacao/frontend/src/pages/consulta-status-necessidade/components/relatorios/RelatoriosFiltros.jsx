import React from 'react';
import { FaFilter, FaSync } from 'react-icons/fa';
import { SearchableSelect, Button } from '../../../../components/ui';

const RelatoriosFiltros = ({
  filtros,
  semanasAbastecimento,
  loading,
  loadingOpcoes,
  onFiltroChange,
  onAplicarFiltros,
  onLimparFiltros
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FaFilter className="mr-2" />
          Filtros de Relatório
        </h3>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={onLimparFiltros}
            className="flex items-center"
          >
            Limpar Filtros
          </Button>
          <Button
            variant="primary"
            onClick={onAplicarFiltros}
            disabled={loading}
            className="flex items-center"
          >
            <FaSync className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Aplicar Filtros
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SearchableSelect
          label="Semana Abastecimento"
          value={filtros.semana_abastecimento}
          onChange={(value) => onFiltroChange('semana_abastecimento', value)}
          options={semanasAbastecimento}
          placeholder="Selecione uma semana..."
          disabled={loading || loadingOpcoes}
          usePortal={false}
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data Início
          </label>
          <input
            type="date"
            value={filtros.data_inicio}
            onChange={(e) => onFiltroChange('data_inicio', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data Fim
          </label>
          <input
            type="date"
            value={filtros.data_fim}
            onChange={(e) => onFiltroChange('data_fim', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default RelatoriosFiltros;

