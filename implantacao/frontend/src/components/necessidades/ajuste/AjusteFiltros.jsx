import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { Button, SearchableSelect } from '../../ui';

const AjusteFiltros = ({
  activeTab,
  filtros,
  escolas,
  grupos,
  nutricionistas,
  opcoesSemanasConsumo,
  opcoesSemanasAbastecimento,
  loading,
  loadingSemanaAbastecimento = false,
  onFiltroChange,
  onFiltrar
}) => {
  const isFiltrarDisabled = activeTab === 'nutricionista' 
    ? (!filtros.escola_id || !filtros.grupo || !filtros.semana_consumo || loading)
    : (!filtros.escola_id && !filtros.nutricionista_id && !filtros.grupo && !filtros.semana_consumo && !filtros.semana_abastecimento || loading);

  return (
    <>
      {/* Filtros e Informações */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          <Button
            onClick={onFiltrar}
            variant="primary"
            size="sm"
            disabled={isFiltrarDisabled}
            className="flex items-center"
          >
            <FaSearch className="mr-2" />
            Filtrar
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Escola</label>
            <SearchableSelect
              value={filtros.escola_id || ''}
              onChange={(value) => {
                const escola = escolas.find(e => e.id == value);
                onFiltroChange('escola_id', escola?.id || null);
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grupo {activeTab === 'nutricionista' && <span className="text-red-500">*</span>}
            </label>
            <SearchableSelect
              value={filtros.grupo || ''}
              onChange={(value) => {
                const grupo = grupos.find(g => g.nome == value);
                onFiltroChange('grupo', grupo?.nome || null);
              }}
              options={grupos.map(grupo => ({
                value: grupo.nome,
                label: grupo.nome
              }))}
              placeholder="Digite para buscar um grupo..."
              disabled={loading}
              required={activeTab === 'nutricionista'}
            />
          </div>
          {activeTab === 'coordenacao' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nutricionista</label>
              <SearchableSelect
                value={filtros.nutricionista_id || ''}
                onChange={(value) => {
                  const nutricionista = nutricionistas.find(n => n.id == value);
                  onFiltroChange('nutricionista_id', nutricionista?.id || null);
                }}
                options={nutricionistas.map(nutricionista => ({
                  value: nutricionista.id,
                  label: nutricionista.nome || nutricionista.email
                }))}
                placeholder="Selecione uma nutricionista..."
                disabled={loading}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Semana de Consumo {activeTab === 'nutricionista' && <span className="text-red-500">*</span>}
            </label>
            <SearchableSelect
              value={filtros.semana_consumo || ''}
              onChange={(value) => {
                const semana = opcoesSemanasConsumo?.find(s => s.value === value);
                onFiltroChange('semana_consumo', semana?.value || null);
              }}
              options={opcoesSemanasConsumo || []}
              placeholder="Selecione a semana de consumo..."
              disabled={loading}
              required={activeTab === 'nutricionista'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Semana de Abastecimento (AB)
              {filtros.semana_consumo && (
                <span className="ml-2 text-xs text-gray-500 font-normal">(Preenchido automaticamente)</span>
              )}
            </label>
            <SearchableSelect
              value={filtros.semana_abastecimento || ''}
              onChange={(value) => {
                // Não permitir mudança manual - apenas informativo
                // Campo será preenchido automaticamente quando semana_consumo for selecionada
              }}
              options={filtros.semana_abastecimento 
                ? [{ value: filtros.semana_abastecimento, label: filtros.semana_abastecimento }]
                : []
              }
              placeholder={
                loadingSemanaAbastecimento
                  ? "Carregando semana de abastecimento..."
                  : filtros.semana_consumo && filtros.semana_abastecimento
                  ? filtros.semana_abastecimento
                  : filtros.semana_consumo
                  ? "Carregando..."
                  : "Selecione primeiro a semana de consumo"
              }
              disabled={true}
              className={filtros.semana_consumo ? "bg-gray-50 cursor-not-allowed" : ""}
            />
          </div>
        </div>
      </div>


    </>
  );
};

export default AjusteFiltros;
