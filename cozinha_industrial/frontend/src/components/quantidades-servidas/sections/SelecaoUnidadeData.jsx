import React from 'react';
import { Input, SearchableSelect } from '../../ui';

const SelecaoUnidadeData = ({
  formData,
  unidadesEscolares,
  loadingEscolas,
  isViewMode,
  onInputChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <SearchableSelect
          label="Escola"
          value={formData.unidade_id}
          onChange={(value) => onInputChange('unidade_id', value)}
          options={unidadesEscolares.map(escola => ({
            value: escola.id,
            label: escola.nome_escola,
            description: `${escola.cidade} - ${escola.rota_nome || 'Sem rota'}`
          }))}
          placeholder="Selecione uma escola..."
          disabled={isViewMode || loadingEscolas}
          required
          usePortal={false}
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Data <span className="text-red-500">*</span>
        </label>
        <Input
          type="date"
          value={formData.data}
          onChange={(e) => onInputChange('data', e.target.value)}
          disabled={isViewMode}
          required
        />
      </div>
    </div>
  );
};

export default SelecaoUnidadeData;

