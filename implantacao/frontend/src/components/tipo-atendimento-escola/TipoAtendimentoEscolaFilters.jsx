import React from 'react';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import { Input, SearchableSelect, Button } from '../ui';

const TipoAtendimentoEscolaFilters = ({
  escolas = [],
  tiposAtendimento = [],
  searchTerm,
  escolaFilter,
  tipoAtendimentoFilter,
  ativoFilter,
  onSearchChange,
  onEscolaFilterChange,
  onTipoAtendimentoFilterChange,
  onAtivoFilterChange,
  onClearFilters,
  loading = false
}) => {
  const hasActiveFilters = searchTerm || escolaFilter || tipoAtendimentoFilter || ativoFilter !== 'todos';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <FaFilter className="mr-2" />
          Filtros
        </h2>
        {hasActiveFilters && (
          <Button
            onClick={onClearFilters}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes className="mr-1" />
            Limpar Filtros
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Busca */}
        <div>
          <Input
            label="Buscar"
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por escola, rota ou cidade..."
            disabled={loading}
            icon={<FaSearch className="text-gray-400" />}
          />
        </div>

        {/* Filtro por Escola */}
        <div>
          <SearchableSelect
            label="Escola"
            value={escolaFilter}
            onChange={onEscolaFilterChange}
            options={escolas.map(escola => ({
              value: escola.id,
              label: `${escola.nome_escola}${escola.rota ? ` - ${escola.rota}` : ''}`,
              description: escola.cidade
            }))}
            placeholder="Todas as escolas"
            disabled={loading}
            filterBy={(option, searchTerm) => {
              const label = option.label.toLowerCase();
              const description = option.description?.toLowerCase() || '';
              const term = searchTerm.toLowerCase();
              return label.includes(term) || description.includes(term);
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

        {/* Filtro por Tipo de Atendimento */}
        <div>
          <SearchableSelect
            label="Tipo de Atendimento"
            value={tipoAtendimentoFilter}
            onChange={onTipoAtendimentoFilterChange}
            options={[
              { value: '', label: 'Todos os tipos' },
              ...tiposAtendimento.map(tipo => ({
                value: tipo.value,
                label: tipo.label
              }))
            ]}
            placeholder="Todos os tipos"
            disabled={loading}
          />
        </div>

        {/* Filtro por Status */}
        <div>
          <SearchableSelect
            label="Status"
            value={ativoFilter}
            onChange={onAtivoFilterChange}
            options={[
              { value: 'todos', label: 'Todos' },
              { value: 'ativo', label: 'Ativo' },
              { value: 'inativo', label: 'Inativo' }
            ]}
            placeholder="Todos"
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default TipoAtendimentoEscolaFilters;

