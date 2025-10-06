import React from 'react';
import { FaSearch, FaTimes, FaFilter } from 'react-icons/fa';
import { Button, Input } from '../ui';

/**
 * Componente de filtros para Produtos Per Capita
 * Segue padrão de excelência do sistema
 */
const ProdutosPerCapitaFilters = ({
  filtros = {},
  onFilterChange,
  onClearFilters,
  loading = false,
  produtosDisponiveis = []
}) => {
  const handleSearchChange = (e) => {
    onFilterChange('search', e.target.value);
  };

  const handleStatusChange = (e) => {
    onFilterChange('status', e.target.value);
  };

  const handleProdutoChange = (e) => {
    onFilterChange('produto_id', e.target.value);
  };

  const handleClearFilters = () => {
    onClearFilters();
  };

  const hasActiveFilters = filtros.search || 
                          (filtros.status && filtros.status !== 'todos') ||
                          (filtros.produto_id && filtros.produto_id !== '');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <FaFilter className="text-gray-500" />
        <h3 className="text-sm font-medium text-gray-700">Filtros</h3>
        {hasActiveFilters && (
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            Filtros ativos
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Busca */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Buscar por produto..."
            value={filtros.search || ''}
            onChange={handleSearchChange}
            className="pl-10"
            disabled={loading}
          />
        </div>

        {/* Status */}
        <div>
          <select
            value={filtros.status || 'todos'}
            onChange={handleStatusChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="todos">Todos os Status</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>
        </div>

        {/* Produto */}
        <div>
          <select
            value={filtros.produto_id || ''}
            onChange={handleProdutoChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Todos os Produtos</option>
            {produtosDisponiveis.map(produto => (
              <option key={produto.id} value={produto.id}>
                {produto.nome} ({produto.codigo})
              </option>
            ))}
          </select>
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          <Button
            onClick={handleClearFilters}
            variant="outline"
            size="sm"
            disabled={loading || !hasActiveFilters}
            className="flex items-center gap-2"
          >
            <FaTimes className="w-4 h-4" />
            <span className="hidden sm:inline">Limpar</span>
          </Button>
        </div>
      </div>

      {/* Filtros ativos */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filtros.search && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                Busca: {filtros.search}
                <button
                  onClick={() => onFilterChange('search', '')}
                  className="ml-1 hover:text-blue-600"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </span>
            )}
            {filtros.status && filtros.status !== 'todos' && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                Status: {filtros.status === 'ativo' ? 'Ativos' : 'Inativos'}
                <button
                  onClick={() => onFilterChange('status', 'todos')}
                  className="ml-1 hover:text-green-600"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </span>
            )}
            {filtros.produto_id && (
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                Produto: {produtosDisponiveis.find(p => p.id === filtros.produto_id)?.nome || 'Selecionado'}
                <button
                  onClick={() => onFilterChange('produto_id', '')}
                  className="ml-1 hover:text-purple-600"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProdutosPerCapitaFilters;
