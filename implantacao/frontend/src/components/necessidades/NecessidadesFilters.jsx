import React from 'react';
import { FaSchool, FaBox, FaCalendarAlt, FaSearch, FaTimes, FaCalendarWeek } from 'react-icons/fa';
import { Input, SearchableSelect, Button } from '../ui';
import { useSemanasAbastecimento } from '../../hooks/useSemanasAbastecimento';

const NecessidadesFilters = ({ 
  escolas = [], 
  grupos = [], 
  filtros, 
  onFilterChange,
  onClearFilters,
  loading = false 
}) => {
  // Hook para semanas de abastecimento
  const { opcoes: opcoesSemanas, obterValorPadrao } = useSemanasAbastecimento();
  const handleEscolaChange = (escola) => {
    onFilterChange({ escola });
  };

  const handleGrupoChange = (grupo) => {
    onFilterChange({ grupo });
  };

  const handleDataChange = (data) => {
    onFilterChange({ data });
  };

  const handleSearchChange = (search) => {
    onFilterChange({ search });
  };

  const handleSemanaChange = (semana) => {
    onFilterChange({ semana_abastecimento: semana });
  };

  const hasActiveFilters = filtros.escola || filtros.grupo || filtros.data || filtros.search || filtros.semana_abastecimento;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaSearch className="mr-2 text-green-600" />
                Filtros de Consulta
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                Filtre as necessidades por escola, grupo, data e semana de abastecimento
              </p>
            </div>
        
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Selecionar Escola */}
        <div>
          <SearchableSelect
            label="Escola"
            value={filtros.escola?.id || ''}
            onChange={(value) => {
              const escola = escolas.find(e => e.id == value);
              handleEscolaChange(escola);
            }}
            options={escolas.map(escola => ({
              value: escola.id,
              label: `${escola.nome_escola} - ${escola.rota}`,
              description: escola.cidade
            }))}
            placeholder="Digite para buscar uma escola..."
            disabled={loading}
            required
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

        {/* Selecionar Grupo */}
        <div>
          <SearchableSelect
            label="Grupo de Produtos"
            value={filtros.grupo?.id || ''}
            onChange={(value) => {
              const grupo = grupos.find(g => g.id == value);
              handleGrupoChange(grupo);
            }}
            options={grupos.map(grupo => ({
              value: grupo.id,
              label: grupo.nome
            }))}
            placeholder="Digite para buscar um grupo..."
            disabled={loading}
            required
          />
        </div>

        {/* Selecionar Data */}
        <div>
          <Input
            label="Semana de Consumo"
            type="date"
            value={filtros.data}
            onChange={(e) => handleDataChange(e.target.value)}
            disabled={loading}
            min="2020-01-01"
            placeholder="Selecione uma data..."
          />
        </div>

        {/* Semana de Abastecimento (AB) */}
        <div>
          <SearchableSelect
            label="Semana de Abastecimento (AB)"
            value={filtros.semana_abastecimento}
            onChange={handleSemanaChange}
            options={opcoesSemanas || []}
            placeholder="Selecione a semana..."
            disabled={loading}
          />
        </div>

        {/* Buscar Produto */}
        <div>
          <Input
            label="Buscar Produto"
            type="text"
            value={filtros.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Digite para buscar..."
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default NecessidadesFilters;
