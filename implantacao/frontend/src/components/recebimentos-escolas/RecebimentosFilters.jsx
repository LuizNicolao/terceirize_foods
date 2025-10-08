import React from 'react';
import { FaSearch, FaTimes, FaCalendarWeek } from 'react-icons/fa';
import { Input, SearchableSelect, Button } from '../ui';
import { useSemanasAbastecimento } from '../../hooks/useSemanasAbastecimento';

const RecebimentosFilters = ({ 
  escolas = [], 
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

  const handleTipoRecebimentoChange = (tipo_recebimento) => {
    onFilterChange({ tipo_recebimento });
  };

  const handleTipoEntregaChange = (tipo_entrega) => {
    onFilterChange({ tipo_entrega });
  };

  const handleSearchChange = (search) => {
    onFilterChange({ search });
  };

  const handleSemanaChange = (semana_abastecimento) => {
    onFilterChange({ semana_abastecimento });
  };

  const hasActiveFilters = filtros.escola || filtros.tipo_recebimento || filtros.tipo_entrega || filtros.search || filtros.semana_abastecimento;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaSearch className="mr-2 text-green-600" />
            Filtros de Consulta
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            Filtre os recebimentos por escola, tipo e semana de abastecimento
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Semana de Abastecimento */}
        <div>
          <SearchableSelect
            label="Semana de Abastecimento"
            value={filtros.semana_abastecimento}
            onChange={handleSemanaChange}
            options={opcoesSemanas || []}
            placeholder="Selecione a semana..."
            disabled={loading}
          />
        </div>

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

        {/* Tipo de Recebimento */}
        <div>
          <SearchableSelect
            label="Tipo de Recebimento"
            value={filtros.tipo_recebimento}
            onChange={handleTipoRecebimentoChange}
            options={[
              { value: '', label: 'Todos os tipos' },
              { value: 'Completo', label: 'Completo' },
              { value: 'Parcial', label: 'Parcial' }
            ]}
            placeholder="Selecione o tipo..."
            disabled={loading}
          />
        </div>

        {/* Tipo de Entrega */}
        <div>
          <SearchableSelect
            label="Tipo de Entrega"
            value={filtros.tipo_entrega}
            onChange={handleTipoEntregaChange}
            options={[
              { value: '', label: 'Todos os tipos' },
              { value: 'HORTI', label: 'Hortifruti' },
              { value: 'PAO', label: 'Pão' },
              { value: 'PERECIVEL', label: 'Perecível' },
              { value: 'BASE SECA', label: 'Base Seca' },
              { value: 'LIMPEZA', label: 'Limpeza' }
            ]}
            placeholder="Selecione o tipo..."
            disabled={loading}
          />
        </div>

      </div>

      {/* Botões de ação para semana */}
      <div className="flex gap-2 mt-4">
        <Button
          onClick={() => {
            const semanaAtual = obterValorPadrao();
            if (semanaAtual) {
              handleSemanaChange(semanaAtual);
            }
          }}
          variant="outline"
          size="sm"
          className="text-green-600 border-green-600 hover:bg-green-50"
        >
          <FaCalendarWeek className="mr-1" />
          Semana Atual
        </Button>
        {filtros.semana_abastecimento && (
          <Button
            onClick={() => handleSemanaChange('')}
            variant="outline"
            size="sm"
            className="text-gray-600 border-gray-600 hover:bg-gray-50"
          >
            <FaTimes className="mr-1" />
            Limpar Semana
          </Button>
        )}
      </div>
    </div>
  );
};

export default RecebimentosFilters;