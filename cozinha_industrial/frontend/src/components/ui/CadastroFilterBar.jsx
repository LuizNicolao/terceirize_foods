import React from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import SearchableSelect from './SearchableSelect';
import SemanaAbastecimentoFilter from './SemanaAbastecimentoFilter';

/**
 * Componente de filtro para telas de cadastro
 * Props:
 * - searchTerm: valor do campo de busca
 * - onSearchChange: função para atualizar o campo de busca
 * - semanaAbastecimento: valor do filtro de semana de abastecimento (opcional)
 * - onSemanaAbastecimentoChange: função para atualizar o filtro de semana (opcional)
 * - opcoesSemanas: array de opções de semanas (opcional)
 * - additionalFilters: array de filtros adicionais (opcional)
 * - onClear: função para limpar filtros (opcional)
 * - placeholder: placeholder do campo de busca (opcional)
 */
const CadastroFilterBar = ({
  searchTerm,
  onSearchChange,
  semanaAbastecimento,
  onSemanaAbastecimentoChange,
  opcoesSemanas = [],
  additionalFilters = [],
  onClear,
  placeholder = 'Buscar...'
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6 p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Campo de busca */}
      <div className="flex-1 relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
        />
      </div>

      {/* Filtro de semana de abastecimento */}
      {semanaAbastecimento !== undefined && onSemanaAbastecimentoChange && (
        <SemanaAbastecimentoFilter
          value={semanaAbastecimento}
          onChange={onSemanaAbastecimentoChange}
          opcoes={opcoesSemanas}
          placeholder="Selecione uma semana..."
          className="min-w-[200px]"
        />
      )}

      {/* Filtros adicionais */}
      {additionalFilters.map((filter, index) => (
        filter.searchable ? (
          <SearchableSelect
            key={index}
            value={filter.value}
            onChange={filter.onChange}
            options={filter.options}
            placeholder={filter.placeholder || "Selecionar..."}
            size="sm"
            className="min-w-[140px]"
            filterBy={filter.filterBy}
            renderOption={filter.renderOption}
            disabled={filter.disabled}
          />
        ) : (
          <select
            key={index}
            value={filter.value}
            onChange={e => filter.onChange(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white min-w-[140px]"
          >
            {filter.options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )
      ))}

      {/* Botão limpar */}
      {onClear && (
        <button 
          onClick={onClear} 
          title="Limpar filtros"
          className="px-3 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <FaTimes className="text-xs" />
          <span className="hidden sm:inline">Limpar</span>
        </button>
      )}
    </div>
  );
};

export default CadastroFilterBar;
