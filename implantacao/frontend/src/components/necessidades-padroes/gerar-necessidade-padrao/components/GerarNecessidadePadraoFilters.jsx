import React from 'react';
import { FaFilter, FaTimes } from 'react-icons/fa';
import { SearchableSelect, Button } from '../../../ui';
import { gerarAnos, gerarMeses } from '../../../necessidades/utils/necessidadeModalUtils';
import GerarNecessidadePadraoEscolasSelector from './GerarNecessidadePadraoEscolasSelector';

/**
 * Componente de filtros para Gerar Necessidade Padrão
 * Segue o padrão das outras telas do sistema
 */
const GerarNecessidadePadraoFilters = ({
  filtros,
  anoFiltro,
  mesFiltro,
  filiais,
  grupos,
  opcoesSemanasConsumo,
  semanasAbastecimento,
  loading,
  loadingEscolas,
  loadingSemanasConsumo,
  loadingSemanaAbastecimento,
  onAnoChange,
  onMesChange,
  onFiltroChange,
  onLimparFiltros,
  escolasSelecionadas,
  onEscolasChange
}) => {
  const hasActiveFilters = filtros.filial_id || (escolasSelecionadas && escolasSelecionadas.length > 0) || filtros.semana_consumo || filtros.grupo_id || anoFiltro || mesFiltro;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FaFilter className="mr-2" />
          Filtros
        </h3>
        {hasActiveFilters && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onLimparFiltros}
            className="flex items-center gap-2"
          >
            <FaTimes className="text-xs" />
            Limpar Filtros
          </Button>
        )}
      </div>

      {/* Primeira linha: Ano e Mês */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <SearchableSelect
          label="Ano"
          value={anoFiltro}
          onChange={onAnoChange}
          options={gerarAnos()}
          placeholder="Selecione o ano..."
          loading={loading}
          required
          usePortal={false}
        />
        
        <SearchableSelect
          label="Mês"
          value={mesFiltro}
          onChange={onMesChange}
          options={gerarMeses()}
          placeholder="Selecione o mês..."
          loading={loading}
          disabled={!anoFiltro}
          required
          usePortal={false}
        />
      </div>

      {/* Segunda linha: Semana de Consumo e Semana de Abastecimento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 mb-4">
        <SearchableSelect
          label="Semana de Consumo"
          name="semana_consumo"
          options={opcoesSemanasConsumo || []}
          value={filtros.semana_consumo || ''}
          onChange={(value) => onFiltroChange('semana_consumo', value)}
          placeholder="Selecione a semana de consumo..."
          loading={loadingSemanasConsumo || loading}
          disabled={!anoFiltro || !mesFiltro}
          required
          usePortal={false}
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Semana de Abastecimento (AB)
            {filtros.semana_consumo && (
              <span className="ml-2 text-xs text-gray-500 font-normal">(Preenchido automaticamente)</span>
            )}
          </label>
          <SearchableSelect
            name="semana_abastecimento"
            options={filtros.semana_abastecimento && filtros.semana_consumo
              ? [{ value: filtros.semana_abastecimento, label: filtros.semana_abastecimento }]
              : semanasAbastecimento
            }
            value={filtros.semana_abastecimento || ''}
            onChange={() => {
              // Campo apenas informativo - não permite mudança manual quando há semana de consumo
            }}
            placeholder={
              !filtros.semana_consumo
                ? "Selecione primeiro a semana de consumo"
                : loadingSemanaAbastecimento
                ? "Carregando semana de abastecimento..."
                : filtros.semana_abastecimento
                ? filtros.semana_abastecimento
                : "Carregando..."
            }
            disabled={true}
            loading={loadingSemanaAbastecimento}
            className={filtros.semana_consumo ? "bg-gray-50 cursor-not-allowed" : ""}
            usePortal={false}
          />
        </div>
      </div>

      {/* Terceira linha: Filial e Grupo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 mb-4">
        <SearchableSelect
          label="Filial"
          name="filial_id"
          options={filiais}
          value={filtros.filial_id || ''}
          onChange={(value) => onFiltroChange('filial_id', value)}
          placeholder="Digite para buscar a filial..."
          loading={loading}
          required
          usePortal={false}
        />
        
        <SearchableSelect
          label="Grupo de Produtos"
          name="grupo_id"
          options={grupos}
          value={filtros.grupo_id || ''}
          onChange={(value) => onFiltroChange('grupo_id', value)}
          placeholder="Digite para buscar um grupo..."
          loading={loading}
          required
          usePortal={false}
        />
      </div>

      {/* Seleção de Escolas com Checkboxes */}
      <div className="border-t pt-4">
        <GerarNecessidadePadraoEscolasSelector
          escolasSelecionadas={escolasSelecionadas || []}
          onEscolasChange={onEscolasChange}
          filialId={filtros.filial_id}
          loading={loadingEscolas || loading}
        />
      </div>
    </div>
  );
};

export default GerarNecessidadePadraoFilters;

