import React from 'react';
import { SearchableSelect } from '../../ui';

/**
 * Seção de Vinculações do Prato (Tipo de Prato e Status)
 */
const Vinculacoes = ({
  formData,
  isViewMode,
  tiposPratos = [],
  loadingTiposPratos,
  onInputChange
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
        Vinculações
      </h3>
      <div className="space-y-3">
        <div>
          <SearchableSelect
            label="Tipo de Prato"
            value={formData.tipo_prato_id ? tiposPratos.find(t => t.id === formData.tipo_prato_id)?.tipo_prato || formData.tipo_prato_nome || '' : ''}
            onChange={(value) => {
              const tipoSelecionado = tiposPratos.find(t => t.tipo_prato === value);
              if (tipoSelecionado) {
                onInputChange('tipo_prato_id', tipoSelecionado.id);
                onInputChange('tipo_prato_nome', tipoSelecionado.tipo_prato || '');
              } else {
                onInputChange('tipo_prato_id', null);
                onInputChange('tipo_prato_nome', '');
              }
            }}
            options={tiposPratos.map(tipo => ({
              value: tipo.tipo_prato || '',
              label: tipo.tipo_prato || '',
              description: tipo.descricao ? `Descrição: ${tipo.descricao}` : ''
            }))}
            placeholder="Digite para buscar um tipo de prato..."
            disabled={isViewMode}
            loading={loadingTiposPratos}
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

