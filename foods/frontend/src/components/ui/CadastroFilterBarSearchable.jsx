import React from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import SearchableSelect from './SearchableSelect';

/**
 * Componente de filtro para telas de cadastro com suporte a SearchableSelect
 * Props:
 * - searchTerm: valor do campo de busca
 * - onSearchChange: função para atualizar o campo de busca
 * - statusFilter: valor do filtro de status (opcional)
 * - onStatusFilterChange: função para atualizar o filtro de status (opcional)
 * - additionalFilters: array de filtros adicionais (opcional)
 * - onClear: função para limpar filtros (opcional)
 * - placeholder: placeholder do campo de busca (opcional)
 * - useSearchableSelect: boolean para usar SearchableSelect nos filtros adicionais
 */
const CadastroFilterBarSearchable = ({
  searchTerm,
  onSearchChange,
  onSearchExecute,
  onKeyPress,
  statusFilter,
  onStatusFilterChange,
  additionalFilters = [],
  onClear,
  placeholder = 'Buscar...',
  useSearchableSelect = false
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
          onKeyPress={onKeyPress}
          className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
        />
      </div>

      {/* Filtro de status */}
      {typeof statusFilter !== 'undefined' && onStatusFilterChange && (
        <select 
          value={statusFilter} 
          onChange={e => onStatusFilterChange(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white min-w-[140px]"
        >
          <option value="todos">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      )}

      {/* Filtros adicionais */}
      {additionalFilters.map((filter, index) => {
        // Usar SearchableSelect se useSearchableSelect=true E (lista grande OU useSearchable=true no filtro)
        const shouldUseSearchable = (useSearchableSelect && filter.options && filter.options.length > 10) || filter.useSearchable;
        
        if (shouldUseSearchable) {
          // Usar SearchableSelect para listas grandes ou quando explicitamente solicitado
          return (
            <div key={index} className="min-w-[200px]">
              <SearchableSelect
                label=""
                value={filter.value}
                onChange={filter.onChange}
                options={filter.options}
                placeholder={`Selecionar ${filter.label.toLowerCase()}...`}
                disabled={filter.disabled}
                showClearButton={true}
                usePortal={false}
                filterBy={(option, searchTerm) => {
                  const label = option.label.toLowerCase();
                  const term = searchTerm.toLowerCase();
                  return label.includes(term);
                }}
                renderOption={(option) => (
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{option.label}</span>
                    {option.description && (
                      <span className="text-xs text-gray-500 mt-1">{option.description}</span>
                    )}
                  </div>
                )}
              />
            </div>
          );
        } else {
          // Usar select normal para listas pequenas
          return (
            <select
              key={index}
              value={filter.value}
              onChange={e => filter.onChange(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white min-w-[140px]"
              disabled={filter.disabled}
            >
              {filter.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          );
        }
      })}

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

export default CadastroFilterBarSearchable;
