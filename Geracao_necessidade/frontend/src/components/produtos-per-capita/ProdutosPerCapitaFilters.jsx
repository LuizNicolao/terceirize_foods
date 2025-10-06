import React from 'react';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import Button from '../ui/Button';

const ProdutosPerCapitaFilters = ({ 
  filtros = { search: '', ativo: 'true', per_capita: '', tipo_produto: '' },
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

  const hasActiveFilters = filtros.search || (filtros.ativo && filtros.ativo !== 'true') || filtros.per_capita || filtros.tipo_produto;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      {/* Campo de Busca */}
      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nome do produto..."
            value={filtros.search}
            onChange={(e) => handleInputChange('search', e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
            disabled={loading}
          />
        </div>
      </div>

      {/* Filtros em Grade */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Filtro de Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
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

        {/* Filtro de Per Capita */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Per Capita</label>
          <select
            value={filtros.per_capita}
            onChange={(e) => handleInputChange('per_capita', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            disabled={loading}
          >
            <option value="">Todos os tipos</option>
            <option value="lanche_manha">🌅 Lanche Manhã</option>
            <option value="almoco">🍽️ Almoço</option>
            <option value="lanche_tarde">🌆 Lanche Tarde</option>
            <option value="parcial">🥗 Parcial</option>
            <option value="eja">🌙 EJA</option>
          </select>
        </div>

        {/* Filtro de Tipo de Produto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Produto</label>
          <select
            value={filtros.tipo_produto}
            onChange={(e) => handleInputChange('tipo_produto', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            disabled={loading}
          >
            <option value="">Todos os tipos</option>
            <option value="Horti">Hortifruti</option>
            <option value="Pao">Pão</option>
            <option value="Pereciveis">Perecíveis</option>
            <option value="Base Seca">Base Seca</option>
            <option value="Limpeza">Limpeza</option>
          </select>
        </div>

        {/* Botão Limpar Filtros */}
        <div className="flex items-end">
          {hasActiveFilters && (
            <Button
              onClick={handleClearFilters}
              variant="secondary"
              size="sm"
              className="flex items-center w-full"
              disabled={loading}
            >
              <FaTimes className="mr-1" />
              Limpar Filtros
            </Button>
          )}
        </div>
      </div>

      {/* Indicador de Filtros Ativos */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          {filtros.search && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Busca: "{filtros.search}"
            </span>
          )}
          {filtros.ativo && filtros.ativo !== 'true' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Status: {filtros.ativo === 'true' ? 'Ativo' : 'Inativo'}
            </span>
          )}
          {filtros.per_capita && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Per Capita: {(() => {
                const tipos = {
                  'lanche_manha': '🌅 Lanche Manhã',
                  'almoco': '🍽️ Almoço',
                  'lanche_tarde': '🌆 Lanche Tarde',
                  'parcial': '🥗 Parcial',
                  'eja': '🌙 EJA'
                };
                return tipos[filtros.per_capita] || filtros.per_capita.charAt(0).toUpperCase() + filtros.per_capita.slice(1);
              })()}
            </span>
          )}
          {filtros.tipo_produto && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              Tipo: {filtros.tipo_produto}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ProdutosPerCapitaFilters;
