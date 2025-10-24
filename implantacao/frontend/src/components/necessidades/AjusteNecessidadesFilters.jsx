import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { Button, SearchableSelect } from '../../ui';

const AjusteNecessidadesFilters = ({
  filtros,
  escolas,
  grupos,
  nutricionistas,
  semanasConsumo,
  semanasAbastecimento,
  onFiltroChange,
  onCarregarNecessidades,
  loading,
  modoCoordenacao
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        <Button
          onClick={onCarregarNecessidades}
          variant="primary"
          size="sm"
          disabled={!filtros.escola_id || !filtros.grupo || !filtros.semana_consumo || loading}
          className="flex items-center"
        >
          <FaSearch className="mr-2" />
          Filtrar
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Escola
          </label>
          <SearchableSelect
            options={escolas}
            value={filtros.escola_id}
            onChange={(selectedOption) => onFiltroChange('escola_id', selectedOption?.value || '')}
            placeholder="Selecione a escola"
            isClearable
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Grupo
          </label>
          <SearchableSelect
            options={grupos}
            value={filtros.grupo}
            onChange={(selectedOption) => onFiltroChange('grupo', selectedOption?.value || '')}
            placeholder="Selecione o grupo"
            isClearable
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Semana de Consumo
          </label>
          <SearchableSelect
            options={semanasConsumo}
            value={filtros.semana_consumo}
            onChange={(selectedOption) => onFiltroChange('semana_consumo', selectedOption?.value || '')}
            placeholder="Selecione a semana"
            isClearable
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Semana de Abastecimento (AB)
          </label>
          <SearchableSelect
            options={semanasAbastecimento}
            value={filtros.semana_abastecimento}
            onChange={(selectedOption) => onFiltroChange('semana_abastecimento', selectedOption?.value || '')}
            placeholder="Selecione a semana"
            isClearable
          />
        </div>
        
        {modoCoordenacao && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nutricionista
            </label>
            <SearchableSelect
              options={nutricionistas}
              value={filtros.nutricionista_id}
              onChange={(selectedOption) => onFiltroChange('nutricionista_id', selectedOption?.value || '')}
              placeholder="Selecione a nutricionista"
              isClearable
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AjusteNecessidadesFilters;
