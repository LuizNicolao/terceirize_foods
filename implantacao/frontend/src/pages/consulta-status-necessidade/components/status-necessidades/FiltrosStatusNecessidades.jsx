import React from 'react';
import { SearchableSelect } from '../../../../components/ui';

const FiltrosStatusNecessidades = ({
  filtros,
  onFiltroChange,
  onAplicarFiltros,
  onLimparFiltros,
  onSemanaAtual,
  temFiltrosAtivos,
  loading,
  loadingOpcoes,
  isNutricionista,
  opcoesStatusNecessidade,
  opcoesStatusSubstituicao,
  grupos,
  semanasAbastecimento,
  semanasConsumo,
  escolas,
  produtos,
  filiais,
  nutricionistas
}) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">🔍 Filtros</h3>
          {isNutricionista && (
            <p className="text-sm text-blue-600 mt-1">
              📍 Visualizando apenas suas {escolas.length} escolas
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onAplicarFiltros}
            className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Aplicar Filtros
          </button>
            <button
              onClick={onLimparFiltros}
              className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Limpar Filtros
            </button>
          <button
            onClick={onSemanaAtual}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Semana Atual
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Filtro por Status da Necessidade */}
        <div>
          <SearchableSelect
            label="Status da Necessidade"
            value={filtros.status_necessidade}
            onChange={(value) => onFiltroChange('status_necessidade', value)}
            options={opcoesStatusNecessidade}
            placeholder="Selecione o status..."
            disabled={loading}
            usePortal={false}
          />
        </div>

        {/* Filtro por Status da Substituição */}
        <div>
          <SearchableSelect
            label="Status da Substituição"
            value={filtros.status_substituicao}
            onChange={(value) => onFiltroChange('status_substituicao', value)}
            options={opcoesStatusSubstituicao}
            placeholder="Selecione o status..."
            disabled={loading}
            usePortal={false}
          />
        </div>

        {/* Filtro por Grupo */}
        <div>
          <SearchableSelect
            label="Grupo de Produtos"
            value={filtros.grupo}
            onChange={(value) => onFiltroChange('grupo', value)}
            options={grupos}
            placeholder="Selecione o grupo..."
            disabled={loading || loadingOpcoes}
            usePortal={false}
          />
        </div>

        {/* Filtro por Semana AB */}
        <div>
          <SearchableSelect
            label="Semana Abastecimento (AB)"
            value={filtros.semana_abastecimento}
            onChange={(value) => onFiltroChange('semana_abastecimento', value)}
            options={semanasAbastecimento}
            placeholder="Selecione uma semana..."
            disabled={loading || loadingOpcoes}
            usePortal={false}
          />
        </div>

        {/* Filtro por Semana Consumo */}
        <div>
          <SearchableSelect
            label="Semana Consumo"
            value={filtros.semana_consumo}
            onChange={(value) => onFiltroChange('semana_consumo', value)}
            options={semanasConsumo}
            placeholder="Selecione uma semana..."
            disabled={loading || loadingOpcoes}
            usePortal={false}
          />
        </div>

        {/* Filtro por Escola */}
        <div>
          <SearchableSelect
            label={isNutricionista ? "Escola (Suas Rotas)" : "Escola"}
            value={filtros.escola_id}
            onChange={(value) => onFiltroChange('escola_id', value)}
            options={[
              { value: '', label: isNutricionista ? 'Todas as minhas escolas' : 'Todas as escolas' },
              ...escolas
            ]}
            placeholder={isNutricionista ? "Selecione uma das suas escolas..." : "Selecione uma escola..."}
            disabled={loading || loadingOpcoes}
            usePortal={false}
          />
        </div>

        {/* Filtro por Produto */}
        <div>
          <SearchableSelect
            label="Produto"
            value={filtros.produto_id}
            onChange={(value) => onFiltroChange('produto_id', value)}
            options={produtos}
            placeholder="Selecione um produto..."
            disabled={loading || loadingOpcoes}
            usePortal={false}
          />
        </div>

        {/* Filtro por Filial */}
        <div>
          <SearchableSelect
            label="Filial"
            value={filtros.filial}
            onChange={(value) => onFiltroChange('filial', value)}
            options={filiais}
            placeholder="Selecione uma filial..."
            disabled={loading || loadingOpcoes}
            usePortal={false}
          />
        </div>

        {/* Filtro por Nutricionista */}
        <div>
          <SearchableSelect
            label="Nutricionista"
            value={filtros.nutricionista_email}
            onChange={(value) => onFiltroChange('nutricionista_email', value)}
            options={nutricionistas || []}
            placeholder="Selecione um nutricionista..."
            disabled={loading || loadingOpcoes}
            usePortal={false}
          />
        </div>
      </div>
    </div>
  );
};

export default FiltrosStatusNecessidades;

