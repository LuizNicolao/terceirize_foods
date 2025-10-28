import React from 'react';
import { FaSearch, FaEraser } from 'react-icons/fa';
import { Button, SearchableSelect } from '../../../components/ui';

const SubstituicoesFilters = ({
  grupos,
  semanasAbastecimento,
  semanasConsumo,
  filtros,
  loading,
  onFiltroChange,
  onLimparFiltros
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onLimparFiltros}
            className="flex items-center"
          >
            <FaEraser className="mr-2" />
            Limpar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Grupo de Produtos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Grupo de Produtos
          </label>
          <SearchableSelect
            value={filtros.grupo || ''}
            onChange={(value) => onFiltroChange({ grupo: value })}
            options={grupos.map(grupo => ({
              value: grupo.nome,
              label: grupo.nome
            }))}
            placeholder="Todos os grupos"
            disabled={loading}
          />
        </div>

        {/* Semana de Abastecimento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Semana de Abastecimento
          </label>
          <SearchableSelect
            value={filtros.semana_abastecimento || ''}
            onChange={(value) => onFiltroChange({ semana_abastecimento: value })}
            options={semanasAbastecimento.map(semana => ({
              value: semana.semana_abastecimento,
              label: semana.semana_abastecimento
            }))}
            placeholder="Selecione a semana..."
            disabled={loading}
          />
        </div>

        {/* Semana de Consumo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Semana de Consumo
          </label>
          <input
            type="text"
            value={filtros.semana_consumo || ''}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
            placeholder="Será preenchido automaticamente..."
          />
        </div>
      </div>

      {/* Hint */}
      <div className="mt-4 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="flex items-start">
          <FaSearch className="mr-2 mt-0.5 flex-shrink-0" />
          <span>
            Selecione os filtros acima para visualizar as necessidades disponíveis para substituição. 
            Ao selecionar a semana de abastecimento, a semana de consumo será preenchida automaticamente.
          </span>
        </p>
      </div>
    </div>
  );
};

export default SubstituicoesFilters;
