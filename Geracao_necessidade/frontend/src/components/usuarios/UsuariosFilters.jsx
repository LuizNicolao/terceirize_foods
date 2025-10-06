import React from 'react';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import Button from '../ui/Button';

const UsuariosFilters = ({ 
  filtros = { search: '', tipo_usuario: '', ativo: 'true' },
  onFilterChange, 
  onClearFilters,
  loading = false 
}) => {
  const handleInputChange = (field, value) => {
    const novosFiltros = { ...filtros, [field]: value };
    onFilterChange(novosFiltros);
  };

  const handleClearFilters = () => {
    onClearFilters();
  };

  const hasActiveFilters = filtros.search || (filtros.tipo_usuario && filtros.tipo_usuario !== '') || (filtros.ativo && filtros.ativo !== 'true');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Campo de Busca */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={filtros.search}
              onChange={(e) => handleInputChange('search', e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
              disabled={loading}
            />
          </div>
        </div>

        {/* Filtro de Tipo de Usuário */}
        <div className="sm:w-48">
          <select
            value={filtros.tipo_usuario}
            onChange={(e) => handleInputChange('tipo_usuario', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            disabled={loading}
          >
            <option value="">Todos os tipos</option>
            <option value="Coordenacao">Coordenador</option>
            <option value="Supervisao">Supervisor</option>
            <option value="Nutricionista">Nutricionista</option>
          </select>
        </div>

        {/* Filtro de Status */}
        <div className="sm:w-48">
          <select
            value={filtros.ativo}
            onChange={(e) => handleInputChange('ativo', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            disabled={loading}
          >
            <option value="">Todos os status</option>
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </select>
        </div>

        {/* Botão Limpar Filtros */}
        {hasActiveFilters && (
          <Button
            onClick={handleClearFilters}
            variant="secondary"
            size="sm"
            className="flex items-center"
            disabled={loading}
          >
            <FaTimes className="mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {/* Indicador de Filtros Ativos */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          {filtros.search && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Busca: "{filtros.search}"
            </span>
          )}
          {filtros.tipo_usuario && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Tipo: {filtros.tipo_usuario}
            </span>
          )}
          {filtros.ativo && filtros.ativo !== 'true' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Status: {filtros.ativo === 'true' ? 'Ativo' : 'Inativo'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default UsuariosFilters;
