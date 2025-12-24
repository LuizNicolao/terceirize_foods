import React from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import SearchableSelect from './SearchableSelect';
import MultiSelectCheckbox from './MultiSelectCheckbox';

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
  onApplyFilters,
  placeholder = 'Buscar...',
  useSearchableSelect = false,
  showApplyButton = false
}) => {
  // Determinar layout baseado no número de filtros
  const totalFilters = additionalFilters.length + (typeof statusFilter !== 'undefined' ? 1 : 0);
  const useSingleRow = totalFilters <= 2; // Se tiver 2 ou menos filtros adicionais, usar linha única
  
  return (
    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Grid responsivo para melhor distribuição dos filtros */}
      <div className={useSingleRow 
        ? "flex flex-col sm:flex-row gap-3" 
        : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
      }>
      {/* Campo de busca */}
        <div className={useSingleRow 
          ? "flex-1 relative" 
          : "md:col-span-2 lg:col-span-3 xl:col-span-4 relative"
        }>
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
          <div className={useSingleRow ? "min-w-[140px]" : ""}>
        <select 
          value={statusFilter} 
          onChange={e => onStatusFilterChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white"
        >
          <option value="todos">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
          </div>
      )}

      {/* Filtros adicionais */}
      {additionalFilters.map((filter, index) => {
          // Se for seleção múltipla, usar MultiSelectCheckbox
          if (filter.multiple) {
            return (
              <div key={index} className={useSingleRow ? "min-w-[200px]" : ""}>
                <MultiSelectCheckbox
                  label={filter.label}
                  value={Array.isArray(filter.value) ? filter.value : (filter.value && filter.value !== 'todos' ? [filter.value] : [])}
                  onChange={filter.onChange}
                  options={filter.options.filter(opt => opt.value !== 'todos')} // Remover opção "todos" em seleção múltipla
                  placeholder={`Selecionar ${filter.label.toLowerCase()}...`}
                  disabled={filter.disabled}
                />
              </div>
            );
          }
          
        // Usar SearchableSelect se useSearchableSelect=true E (lista grande OU useSearchable=true no filtro)
        const shouldUseSearchable = (useSearchableSelect && filter.options && filter.options.length > 10) || filter.useSearchable;
        
        if (shouldUseSearchable) {
          // Usar SearchableSelect para listas grandes ou quando explicitamente solicitado
          return (
              <div key={index} className={useSingleRow ? "min-w-[200px]" : ""}>
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
              <div key={index} className={useSingleRow ? "min-w-[140px]" : ""}>
            <select
              value={filter.value}
              onChange={e => filter.onChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white"
              disabled={filter.disabled}
            >
              {filter.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
              </div>
          );
        }
      })}

      {/* Botões de ação */}
        <div className={useSingleRow 
          ? "flex gap-2 justify-end" 
          : "md:col-span-2 lg:col-span-3 xl:col-span-4 flex gap-2 justify-end"
        }>
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
        {showApplyButton && onApplyFilters && (
          <button 
            onClick={onApplyFilters} 
            title="Aplicar filtros"
            className="px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <FaSearch className="text-xs" />
            <span className="hidden sm:inline">Aplicar Filtros</span>
            <span className="sm:hidden">Aplicar</span>
          </button>
        )}
        </div>
      </div>
    </div>
  );
};

export default CadastroFilterBarSearchable;


