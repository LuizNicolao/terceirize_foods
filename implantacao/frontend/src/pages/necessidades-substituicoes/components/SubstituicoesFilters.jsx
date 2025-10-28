import React from 'react';
import { Button, Input, SearchableSelect } from '../../../components/ui';
import { useSemanasAbastecimento } from '../../../hooks/useSemanasAbastecimento';
import { useSemanasConsumo } from '../../../hooks/useSemanasConsumo';
import useGruposConsulta from '../../../hooks/useGruposConsulta';

const SubstituicoesFilters = ({
  filtros,
  onFiltrosChange,
  onBuscar,
  onLimpar,
  loading = false
}) => {
  const { grupos, loading: loadingGrupos } = useGruposConsulta();
  const { semanas: semanasAbastecimento, loading: loadingSemanasAbast } = useSemanasAbastecimento();
  const { semanasConsumo, loading: loadingSemanasConsumo, buscarPorSemanaAbastecimento } = useSemanasConsumo();

  const handleGrupoChange = (grupo) => {
    onFiltrosChange({ grupo });
  };

  const handleSemanaAbastecimentoChange = async (semana) => {
    onFiltrosChange({ semana_abastecimento: semana });
    
    // Auto-popular semana de consumo
    if (semana) {
      try {
        const semanaConsumo = await buscarPorSemanaAbastecimento(semana);
        if (semanaConsumo) {
          onFiltrosChange({ 
            semana_abastecimento: semana,
            semana_consumo: semanaConsumo 
          });
        }
      } catch (error) {
        console.error('Erro ao buscar semana de consumo:', error);
      }
    }
  };

  const handleSemanaConsumoChange = (semana) => {
    onFiltrosChange({ semana_consumo: semana });
  };

  const handleBuscar = () => {
    onBuscar();
  };

  const handleLimpar = () => {
    onFiltrosChange({
      grupo: '',
      semana_abastecimento: '',
      semana_consumo: ''
    });
    onLimpar();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Filtros</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Grupo de Produtos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Grupo de Produtos
          </label>
          <SearchableSelect
            value={filtros.grupo || ''}
            onChange={handleGrupoChange}
            options={(grupos || []).map(grupo => ({
              value: grupo.grupo || grupo.nome,
              label: grupo.grupo || grupo.nome
            }))}
            placeholder="Selecione o grupo..."
            disabled={loadingGrupos}
            className="w-full"
          />
        </div>

        {/* Semana de Abastecimento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Semana de Abastecimento
          </label>
          <SearchableSelect
            value={filtros.semana_abastecimento || ''}
            onChange={handleSemanaAbastecimentoChange}
            options={(semanasAbastecimento || []).map(semana => ({
              value: semana.semana_abastecimento || semana.label || semana,
              label: semana.semana_abastecimento || semana.label || semana
            }))}
            placeholder="Selecione a semana..."
            disabled={loadingSemanasAbast}
            className="w-full"
          />
        </div>

        {/* Semana de Consumo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Semana de Consumo
          </label>
          <Input
            type="text"
            value={filtros.semana_consumo || ''}
            onChange={(e) => handleSemanaConsumoChange(e.target.value)}
            placeholder="Preenchido automaticamente"
            disabled={true}
            className="w-full bg-gray-100"
          />
        </div>

        {/* Botões de Ação */}
        <div className="flex items-end gap-2">
          <Button
            variant="primary"
            onClick={handleBuscar}
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </Button>
          
          <Button
            variant="secondary"
            onClick={handleLimpar}
            disabled={loading}
            className="flex-1"
          >
            Limpar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubstituicoesFilters;