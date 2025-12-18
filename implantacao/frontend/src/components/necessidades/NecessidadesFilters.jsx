import React, { useState, useEffect } from 'react';
import { FaSchool, FaBox, FaCalendarAlt, FaSearch, FaTimes, FaCalendarWeek } from 'react-icons/fa';
import { Input, SearchableSelect, Button } from '../ui';
import { useSemanasConsumo } from '../../hooks/useSemanasConsumo';
import necessidadesService from '../../services/necessidadesService';

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
  
  // Estados para opções filtradas da tabela necessidades
  const [opcoesEscolas, setOpcoesEscolas] = useState([]);
  const [opcoesGrupos, setOpcoesGrupos] = useState([]);
  const [opcoesSemanasAbastecimento, setOpcoesSemanasAbastecimento] = useState([]);
  const [loadingEscolas, setLoadingEscolas] = useState(false);
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  const [loadingSemanaAbastecimento, setLoadingSemanaAbastecimento] = useState(false);
  
  // Buscar escolas disponíveis na tabela necessidades
  useEffect(() => {
    const buscarEscolas = async () => {
      setLoadingEscolas(true);
      try {
        const filtrosParaBusca = {};
        // Não passar 'aba' para buscar todas as necessidades independente do status
        
        // Se grupo está selecionado, filtrar escolas por grupo
        if (filtros.grupo) {
          const grupoNome = typeof filtros.grupo === 'object' ? filtros.grupo.nome : filtros.grupo;
          filtrosParaBusca.grupo = grupoNome;
        }
        
        const response = await necessidadesService.buscarEscolasDisponiveis(filtrosParaBusca);
        if (response.success && response.data) {
          const escolasFormatadas = response.data.map(escola => ({
            value: escola.id,
            label: escola.nome || escola.nome_escola || '',
            description: escola.cidade || '',
            ...escola
          }));
          setOpcoesEscolas(escolasFormatadas);
          
          // Se há escola selecionada mas ela não está mais na lista, limpar
          if (filtros.escola) {
            const escolaId = typeof filtros.escola === 'object' ? filtros.escola.id : filtros.escola;
            const escolaEncontrada = escolasFormatadas.find(e => e.id == escolaId || e.value == escolaId);
            if (!escolaEncontrada) {
              onFilterChange({ escola: null });
            }
          }
        } else {
          setOpcoesEscolas([]);
          // Limpar escola selecionada se não há opções
          if (filtros.escola) {
            onFilterChange({ escola: null });
          }
        }
      } catch (error) {
        console.error('Erro ao buscar escolas disponíveis:', error);
        setOpcoesEscolas([]);
      } finally {
        setLoadingEscolas(false);
      }
    };
    
    buscarEscolas();
  }, [filtros.grupo, onFilterChange]);

  // Buscar grupos disponíveis na tabela necessidades
  useEffect(() => {
    const buscarGrupos = async () => {
      setLoadingGrupos(true);
      try {
        const filtrosParaBusca = {};
        // Não passar 'aba' para buscar todas as necessidades independente do status
        
        // Se escola está selecionada, filtrar grupos por escola
        if (filtros.escola) {
          const escolaId = typeof filtros.escola === 'object' ? filtros.escola.id : filtros.escola;
          filtrosParaBusca.escola_id = escolaId;
        }
        
        const response = await necessidadesService.buscarGruposDisponiveis(filtrosParaBusca);
        if (response.success && response.data) {
          const gruposFormatados = response.data.map(grupo => ({
            value: grupo.id || grupo.grupo_id,
            label: grupo.nome || grupo.grupo,
            ...grupo
          }));
          setOpcoesGrupos(gruposFormatados);
          
          // Se há grupo selecionado mas ele não está mais na lista, limpar
          if (filtros.grupo) {
            const grupoId = typeof filtros.grupo === 'object' ? (filtros.grupo.id || filtros.grupo.grupo_id) : filtros.grupo;
            const grupoEncontrado = gruposFormatados.find(g => (g.id == grupoId || g.grupo_id == grupoId || g.value == grupoId));
            if (!grupoEncontrado) {
              onFilterChange({ grupo: null });
            }
          }
        } else {
          setOpcoesGrupos([]);
          // Limpar grupo selecionado se não há opções
          if (filtros.grupo) {
            onFilterChange({ grupo: null });
          }
        }
      } catch (error) {
        console.error('Erro ao buscar grupos disponíveis:', error);
        setOpcoesGrupos([]);
      } finally {
        setLoadingGrupos(false);
      }
    };
    
    buscarGrupos();
  }, [filtros.escola, onFilterChange]);
  
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
        // Buscar diretamente da tabela necessidades (sem consultar calendário)
        // Não passar 'aba' para buscar todas as necessidades independente do status
        const response = await necessidadesService.buscarSemanaAbastecimentoPorConsumo(semanaConsumo, null);
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

  const handleStatusChange = (status) => {
    onFilterChange({ status });
  };

  // Opções de status disponíveis
  const opcoesStatus = [
    { value: '', label: 'Todos os Status' },
    { value: 'NEC', label: 'NEC - Criada pela Nutricionista' },
    { value: 'NEC NUTRI', label: 'NEC NUTRI - Necessidade Nutricionista' },
    { value: 'CONF NUTRI', label: 'CONF NUTRI - Confirmada Nutricionista' },
    { value: 'NEC COORD', label: 'NEC COORD - Necessidade Coordenação' },
    { value: 'CONF COORD', label: 'CONF COORD - Confirmada Coordenação' },
    { value: 'NEC LOG', label: 'NEC LOG - Necessidade Logística' },
    { value: 'APROVADA', label: 'APROVADA' },
    { value: 'REJEITADA', label: 'REJEITADA' },
    { value: 'EM_ANALISE', label: 'EM_ANALISE - Em Análise' }
  ];

  const hasActiveFilters = filtros.escola || filtros.grupo || filtros.data || filtros.search || filtros.semana_abastecimento || filtros.status;

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Selecionar Escola */}
        <div>
          <SearchableSelect
            label="Escola"
            value={filtros.escola?.id || ''}
            onChange={(value) => {
              const escola = opcoesEscolas.find(e => e.id == value || e.value == value);
              handleEscolaChange(escola);
            }}
            options={opcoesEscolas.map(escola => ({
              value: escola.id || escola.value,
              label: escola.label || escola.nome || escola.nome_escola || '',
              description: escola.description || escola.cidade || ''
            }))}
            placeholder={loadingEscolas ? "Carregando escolas..." : "Digite para buscar uma escola..."}
            disabled={loading || loadingEscolas}
            loading={loadingEscolas}
            usePortal={false}
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
            value={filtros.grupo?.id || filtros.grupo?.grupo_id || ''}
            onChange={(value) => {
              const grupo = opcoesGrupos.find(g => (g.id == value || g.grupo_id == value || g.value == value));
              handleGrupoChange(grupo);
            }}
            options={opcoesGrupos.map(grupo => ({
              value: grupo.id || grupo.grupo_id || grupo.value,
              label: grupo.label || grupo.nome || grupo.grupo
            }))}
            placeholder={loadingGrupos ? "Carregando grupos..." : "Digite para buscar um grupo..."}
            disabled={loading || loadingGrupos}
            loading={loadingGrupos}
            usePortal={false}
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
            usePortal={false}
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
            usePortal={false}
          />
        </div>

        {/* Status */}
        <div>
          <SearchableSelect
            label="Status"
            value={filtros.status || ''}
            onChange={handleStatusChange}
            options={opcoesStatus}
            placeholder="Selecione o status..."
            disabled={loading}
            usePortal={false}
          />
        </div>

        {/* Buscar por ID da Necessidade */}
        <div>
          <Input
            label="Buscar por ID"
            type="text"
            value={filtros.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Digite o ID da necessidade..."
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default NecessidadesFilters;
