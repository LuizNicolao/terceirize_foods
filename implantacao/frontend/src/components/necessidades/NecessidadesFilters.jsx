import React, { useState, useEffect } from 'react';
import { FaSchool, FaBox, FaCalendarAlt, FaSearch, FaTimes, FaCalendarWeek } from 'react-icons/fa';
import { Input, SearchableSelect, Button } from '../ui';
import { useSemanasConsumo } from '../../hooks/useSemanasConsumo';
import calendarioService from '../../services/calendarioService';

const NecessidadesFilters = ({ 
  escolas = [], 
  grupos = [], 
  filtros, 
  onFilterChange,
  onClearFilters,
  loading = false 
}) => {
  // Hook para semanas de consumo da tabela necessidades (não do calendário)
  const { opcoes: opcoesSemanasConsumo } = useSemanasConsumo(null, false, {});
  
  const [opcoesSemanasAbastecimento, setOpcoesSemanasAbastecimento] = useState([]);
  const [loadingSemanaAbastecimento, setLoadingSemanaAbastecimento] = useState(false);
  
  // Buscar semana de abastecimento quando semana de consumo mudar
  useEffect(() => {
    const buscarSemanaAbastecimento = async (semanaConsumo) => {
      if (!semanaConsumo) {
        setOpcoesSemanasAbastecimento([]);
        // Só limpar se o filtro atual tiver semana_abastecimento
        if (filtros.semana_abastecimento) {
          onFilterChange({ semana_abastecimento: '' });
        }
        return;
      }
      
      // Evitar busca duplicada se já está carregado
      if (filtros.semana_abastecimento && filtros.data === semanaConsumo) {
        setOpcoesSemanasAbastecimento([{ 
          value: filtros.semana_abastecimento, 
          label: filtros.semana_abastecimento 
        }]);
        return;
      }
      
      setLoadingSemanaAbastecimento(true);
      try {
        const response = await calendarioService.buscarSemanaAbastecimentoPorConsumo(semanaConsumo);
        if (response.success && response.data && response.data.semana_abastecimento) {
          const semanaAbastecimento = response.data.semana_abastecimento;
          setOpcoesSemanasAbastecimento([{ 
            value: semanaAbastecimento, 
            label: semanaAbastecimento 
          }]);
          // Só atualizar se mudou
          if (filtros.semana_abastecimento !== semanaAbastecimento) {
            onFilterChange({ 
              semana_abastecimento: semanaAbastecimento 
            });
          }
        } else {
          setOpcoesSemanasAbastecimento([]);
          if (filtros.semana_abastecimento) {
            onFilterChange({ semana_abastecimento: '' });
          }
        }
      } catch (error) {
        console.error('Erro ao buscar semana de abastecimento:', error);
        setOpcoesSemanasAbastecimento([]);
        if (filtros.semana_abastecimento) {
          onFilterChange({ semana_abastecimento: '' });
        }
      } finally {
        setLoadingSemanaAbastecimento(false);
      }
    };
    
    if (filtros.data) {
      buscarSemanaAbastecimento(filtros.data);
    } else {
      setOpcoesSemanasAbastecimento([]);
    }
  }, [filtros.data, filtros.semana_abastecimento, onFilterChange]);
  
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
    // Não permitir mudança manual - apenas informativo
  };

  const hasActiveFilters = filtros.escola || filtros.grupo || filtros.data || filtros.search || filtros.semana_abastecimento;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        
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

        {/* Semana de Consumo */}
        <div>
          <SearchableSelect
            label="Semana de Consumo"
            value={filtros.data}
            onChange={handleDataChange}
            options={opcoesSemanasConsumo || []}
            placeholder="Selecione a semana de consumo..."
            disabled={loading}
          />
        </div>

        {/* Semana de Abastecimento (AB) */}
        <div>
          <SearchableSelect
            label="Semana de Abastecimento (AB)"
            value={filtros.semana_abastecimento || ''}
            onChange={handleSemanaChange}
            options={opcoesSemanasAbastecimento || []}
            placeholder={
              loadingSemanaAbastecimento
                ? "Carregando semana de abastecimento..."
                : filtros.data && filtros.semana_abastecimento
                ? filtros.semana_abastecimento
                : filtros.data
                ? "Carregando..."
                : "Selecione primeiro a semana de consumo"
            }
            disabled={true}
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
