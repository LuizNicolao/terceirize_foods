import React, { useState } from 'react';
import { Button, FormInput } from '../ui';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

const TiposCardapioFilters = ({ 
  onApplyFilters, 
  onClearFilters, 
  loading = false,
  filiais = []
}) => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    filial_id: ''
  });

  // Manipular mudanças nos filtros
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Aplicar filtros
  const handleApplyFilters = () => {
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '')
    );
    onApplyFilters(activeFilters);
  };

  // Limpar filtros
  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      filial_id: ''
    });
    onClearFilters();
  };

  // Verificar se há filtros ativos
  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <FaFilter className="text-gray-500 mr-2" />
          <span className="font-medium text-gray-900">Filtros</span>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Busca */}
          <div className="md:col-span-4">
            <FormInput
              label="Buscar"
              type="text"
              placeholder="Nome, código ou descrição..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
              icon={<FaSearch className="text-gray-400" />}
            />
          </div>

          {/* Status */}
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>

          {/* Filial */}
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filial
            </label>
            <select
              value={filters.filial_id}
              onChange={(e) => handleFilterChange('filial_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Todas</option>
              {filiais.map(filial => (
                <option key={filial.id} value={filial.id}>
                  {filial.filial}
                </option>
              ))}
            </select>
          </div>

          {/* Botões */}
          <div className="md:col-span-2">
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={handleApplyFilters}
                disabled={loading}
                className="flex-1"
              >
                <FaFilter className="mr-1" />
                Filtrar
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  disabled={loading}
                  title="Limpar filtros"
                >
                  <FaTimes />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TiposCardapioFilters;
