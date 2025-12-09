import React from 'react';
import { SearchableSelect } from '../../ui';
import FiliaisCentrosCusto from './FiliaisCentrosCusto';

/**
 * Seção de Vinculações da Receita (Tipo de Receita e Status)
 * Filiais e Centros de Custo agora estão em componente separado
 */
const Vinculacoes = ({
  formData,
  isViewMode,
  tiposReceitas = [],
  loadingTiposReceitas,
  onInputChange,
  errors = {}
}) => {

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
        Vinculações
      </h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Receita <span className="text-red-500">*</span>
          </label>
          <SearchableSelect
            value={formData.tipo_receita_id ? tiposReceitas.find(t => t.id === formData.tipo_receita_id)?.tipo_receita || formData.tipo_receita_nome || '' : ''}
            onChange={(value) => {
              const tipoSelecionado = tiposReceitas.find(t => t.tipo_receita === value);
              if (tipoSelecionado) {
                onInputChange('tipo_receita_id', tipoSelecionado.id);
                onInputChange('tipo_receita_nome', tipoSelecionado.tipo_receita || '');
              } else {
                onInputChange('tipo_receita_id', null);
                onInputChange('tipo_receita_nome', '');
              }
            }}
            options={tiposReceitas.map(tipo => ({
              value: tipo.tipo_receita || '',
              label: tipo.tipo_receita || '',
              description: tipo.descricao ? `Descrição: ${tipo.descricao}` : ''
            }))}
            placeholder="Digite para buscar um tipo de receita..."
            disabled={isViewMode}
            loading={loadingTiposReceitas}
            filterBy={(option, searchTerm) => {
              const label = option.label?.toLowerCase() || '';
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
          {errors.tipo_receita_id && (
            <p className="mt-1 text-sm text-red-600">{errors.tipo_receita_id}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={formData.status !== undefined ? formData.status : 1}
            onChange={(e) => onInputChange('status', parseInt(e.target.value))}
            disabled={isViewMode}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value={1}>Ativo</option>
            <option value={0}>Inativo</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Vinculacoes;

