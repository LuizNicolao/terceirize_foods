import React, { useState } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

/**
 * Componente de filtro para telas de cadastro
 * Segue padrão do sistema Foods com pesquisa por Enter
 * Props:
 * - searchTerm: valor do campo de busca
 * - onSearchChange: função para atualizar o campo de busca
 * - onSearchSubmit: função para executar a busca (chamada ao pressionar Enter)
 * - statusFilter: valor do filtro de status (opcional)
 * - onStatusFilterChange: função para atualizar o filtro de status (opcional)
 * - additionalFilters: array de filtros adicionais (opcional)
 * - onClear: função para limpar filtros (opcional)
 * - placeholder: placeholder do campo de busca (opcional)
 * - loading: estado de carregamento (opcional)
 */
const CadastroFilterBar = ({
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  statusFilter,
  onStatusFilterChange,
  additionalFilters = [],
  onClear,
  placeholder = 'Buscar...',
  loading = false
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || '');
  
  // Debug: verificar se o componente está sendo renderizado
  console.log('🔍 CadastroFilterBar renderizado:', { searchTerm, statusFilter, loading });

  // Função para lidar com mudanças no campo de busca
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    onSearchChange(value);
  };

  // Função para lidar com Enter no campo de busca
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (onSearchSubmit) {
        onSearchSubmit(localSearchTerm);
      }
    }
  };

  // Função para limpar filtros
  const handleClear = () => {
    setLocalSearchTerm('');
    if (onClear) {
      onClear();
    }
  };

  // Verificar se há filtros ativos
  const hasActiveFilters = localSearchTerm || 
    (statusFilter && statusFilter !== 'todos') ||
    additionalFilters.some(filter => filter.value && filter.value !== '');

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6 p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Campo de busca */}
      <div className="flex-1 relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
        <input
          type="text"
          placeholder={placeholder}
          value={localSearchTerm}
          onChange={handleSearchChange}
          onKeyPress={handleKeyPress}
          disabled={loading}
          className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        {localSearchTerm && (
          <button
            onClick={() => {
              setLocalSearchTerm('');
              onSearchChange('');
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            title="Limpar busca"
          >
            <FaTimes className="text-xs" />
          </button>
        )}
      </div>

      {/* Filtro de status */}
      {typeof statusFilter !== 'undefined' && onStatusFilterChange && (
        <select 
          value={statusFilter} 
          onChange={e => onStatusFilterChange(e.target.value)}
          disabled={loading}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white min-w-[140px] disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="todos">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      )}

      {/* Filtros adicionais */}
      {additionalFilters.map((filter, index) => (
        <select
          key={index}
          value={filter.value}
          onChange={e => filter.onChange(e.target.value)}
          disabled={loading}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white min-w-[140px] disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          {filter.options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ))}

      {/* Botão limpar */}
      {onClear && hasActiveFilters && (
        <button 
          onClick={handleClear} 
          title="Limpar filtros"
          disabled={loading}
          className="px-3 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <FaTimes className="text-xs" />
          <span className="hidden sm:inline">Limpar</span>
        </button>
      )}
    </div>
  );
};

export default CadastroFilterBar;
