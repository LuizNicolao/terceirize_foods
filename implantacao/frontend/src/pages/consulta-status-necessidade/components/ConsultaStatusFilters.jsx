import React, { useState } from 'react';
import { FaFilter, FaTimes, FaCalendarAlt } from 'react-icons/fa';
import { SearchableSelect } from '../../../components/ui';

const ConsultaStatusFilters = ({
  filtros,
  opcoesSemanasAbastecimento,
  opcoesSemanasConsumo,
  unidadesEscolares,
  grupos,
  produtos,
  opcoesStatus,
  opcoesStatusSubstituicao,
  onFilterChange,
  onClearFilters,
  loading
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  const handleClearFilters = () => {
    onClearFilters();
    setShowFilters(false);
  };

  const hasActiveFilters = Object.values(filtros).some(value => value !== '' && value !== null && value !== undefined);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaFilter className="mr-2" />
            Filtros
          </h3>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-red-600 hover:text-red-800 flex items-center"
              >
                <FaTimes className="mr-1" />
                Limpar Filtros
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
            </button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Status da Necessidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status da Necessidade
              </label>
              <select
                value={filtros.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                disabled={loading}
              >
                {opcoesStatus.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Grupo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grupo de Produtos
              </label>
              <SearchableSelect
                options={grupos.map(grupo => ({ value: grupo.grupo, label: grupo.grupo }))}
                value={filtros.grupo || ''}
                onChange={(value) => handleFilterChange('grupo', value)}
                placeholder="Selecione o grupo"
                disabled={loading}
                usePortal={false}
              />
            </div>

            {/* Semana de Abastecimento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semana de Abastecimento
              </label>
              <SearchableSelect
                options={opcoesSemanasAbastecimento}
                value={filtros.semana_abastecimento || ''}
                onChange={(value) => handleFilterChange('semana_abastecimento', value)}
                placeholder="Selecione a semana"
                disabled={loading}
                usePortal={false}
              />
            </div>

            {/* Semana de Consumo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semana de Consumo
              </label>
              <SearchableSelect
                options={opcoesSemanasConsumo}
                value={filtros.semana_consumo || ''}
                onChange={(value) => handleFilterChange('semana_consumo', value)}
                placeholder="Selecione a semana"
                disabled={loading}
                usePortal={false}
              />
            </div>

            {/* Escola */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unidade Escolar
              </label>
              <SearchableSelect
                options={unidadesEscolares.map(escola => ({ 
                  value: escola.id, 
                  label: `${escola.nome_escola || escola.escola_nome} (${escola.rota || escola.escola_rota})` 
                }))}
                value={filtros.escola_id || ''}
                onChange={(value) => handleFilterChange('escola_id', value)}
                placeholder="Selecione a escola"
                disabled={loading}
                usePortal={false}
              />
            </div>

            {/* Produto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Produto
              </label>
              <SearchableSelect
                options={produtos.map(produto => ({ 
                  value: produto.id, 
                  label: `${produto.codigo || produto.produto_codigo} - ${produto.nome || produto.produto_nome}` 
                }))}
                value={filtros.produto_id || ''}
                onChange={(value) => handleFilterChange('produto_id', value)}
                placeholder="Selecione o produto"
                disabled={loading}
                usePortal={false}
              />
            </div>

            {/* Status da Substituição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status da Substituição
              </label>
              <select
                value={filtros.status_substituicao || ''}
                onChange={(e) => handleFilterChange('status_substituicao', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                disabled={loading}
              >
                {opcoesStatusSubstituicao.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Data Início */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Início
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filtros.data_inicio || ''}
                  onChange={(e) => handleFilterChange('data_inicio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  disabled={loading}
                />
                <FaCalendarAlt className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Data Fim */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Fim
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filtros.data_fim || ''}
                  onChange={(e) => handleFilterChange('data_fim', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  disabled={loading}
                />
                <FaCalendarAlt className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Resumo dos filtros ativos */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700">Filtros ativos:</span>
                {filtros.status && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Status: {opcoesStatus.find(s => s.value === filtros.status)?.label}
                  </span>
                )}
                {filtros.grupo && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Grupo: {filtros.grupo}
                  </span>
                )}
                {filtros.semana_abastecimento && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Sem. Abast.: {filtros.semana_abastecimento}
                  </span>
                )}
                {filtros.semana_consumo && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Sem. Consumo: {filtros.semana_consumo}
                  </span>
                )}
                {filtros.escola_id && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Escola: {unidadesEscolares.find(e => e.id.toString() === filtros.escola_id)?.nome_escola || filtros.escola_id}
                  </span>
                )}
                {filtros.produto_id && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    Produto: {produtos.find(p => p.id.toString() === filtros.produto_id)?.nome || filtros.produto_id}
                  </span>
                )}
                {filtros.data_inicio && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Início: {filtros.data_inicio}
                  </span>
                )}
                {filtros.data_fim && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Fim: {filtros.data_fim}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConsultaStatusFilters;
