/**
 * Componente da aba de Cabeçalho do Modal de Necessidades
 * Contém os campos de filtro: Escola, Grupo, Ano, Mês, Semana de Consumo
 */

import React from 'react';
import { SearchableSelect } from '../ui';
import { gerarAnos, gerarMeses } from './utils/necessidadeModalUtils';

const NecessidadeModalCabecalho = ({
  formData,
  onInputChange,
  escolas = [],
  grupos = [],
  anoFiltro,
  mesFiltro,
  onAnoFiltroChange,
  onMesFiltroChange,
  opcoesSemanasConsumo = [],
  loading = false,
  necessidadesLoading = false
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg transition-opacity duration-300">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações da Necessidade</h3>
      
      {/* Primeira linha: Ano, Mês e Semana de Consumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <SearchableSelect
            label="Ano"
            value={anoFiltro}
            onChange={(value) => {
              onAnoFiltroChange(value);
              // Limpar mês, semana de consumo, grupo e escola quando ano mudar
              onMesFiltroChange('');
              onInputChange('data', '');
              onInputChange('grupo_id', '');
              onInputChange('escola_id', '');
            }}
            options={gerarAnos()}
            placeholder="Selecione o ano..."
            disabled={necessidadesLoading || loading}
            required
            usePortal={false}
          />
        </div>
        
        <div>
          <SearchableSelect
            label="Mês"
            value={mesFiltro}
            onChange={(value) => {
              onMesFiltroChange(value || '');
              // Limpar semana de consumo, grupo e escola quando mês mudar
              onInputChange('data', '');
              onInputChange('grupo_id', '');
              onInputChange('escola_id', '');
            }}
            options={gerarMeses()}
            placeholder="Selecione o mês..."
            disabled={necessidadesLoading || loading || !anoFiltro}
            required
            usePortal={false}
          />
        </div>
        
        <div>
          <SearchableSelect
            label="Semana de Consumo"
            value={formData.data}
            onChange={(value) => {
              onInputChange('data', value);
              // Limpar grupo e escola quando semana mudar
              onInputChange('grupo_id', '');
              onInputChange('escola_id', '');
            }}
            options={opcoesSemanasConsumo}
            placeholder="Selecione a semana de consumo..."
            disabled={necessidadesLoading || loading || !anoFiltro || !mesFiltro}
            required
            usePortal={false}
          />
        </div>
      </div>

      {/* Segunda linha: Grupo de Produtos e Escola */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
        <div>
          <SearchableSelect
            label="Grupo de Produtos"
            value={formData.grupo_id}
            onChange={(value) => {
              onInputChange('grupo_id', value);
              // Limpar escola quando grupo mudar
              onInputChange('escola_id', '');
            }}
            options={grupos.map(grupo => ({
              value: grupo.id,
              label: grupo.nome
            }))}
            placeholder="Digite para buscar um grupo..."
            disabled={necessidadesLoading || loading || !formData.data}
            required
            usePortal={false}
          />
        </div>
        
        <div>
          <SearchableSelect
            label="Escola"
            value={formData.escola_id}
            onChange={(value) => onInputChange('escola_id', value)}
            options={escolas.map(escola => ({
              value: escola.id,
              label: `${escola.nome_escola} - ${escola.rota}`,
              description: escola.cidade
            }))}
            placeholder={!formData.data || !formData.grupo_id ? "Selecione primeiro a semana e o grupo..." : "Digite para buscar uma escola..."}
            disabled={necessidadesLoading || loading || !formData.data || !formData.grupo_id}
            required
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
      </div>

      {/* Mensagem informativa */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Dica:</strong> Preencha todos os campos obrigatórios acima e clique em "Carregar Produtos" para prosseguir.
        </p>
      </div>
    </div>
  );
};

export default NecessidadeModalCabecalho;
