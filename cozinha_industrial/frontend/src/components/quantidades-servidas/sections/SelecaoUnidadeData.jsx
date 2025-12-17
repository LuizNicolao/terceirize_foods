import React from 'react';
import { Input, SearchableSelect } from '../../ui';

const SelecaoUnidadeData = ({
  formData,
  filiais,
  filialId,
  loadingFiliais,
  unidadesEscolares,
  loadingEscolas,
  isViewMode,
  onFilialChange,
  onInputChange
}) => {
  // Garantir que filiais e unidadesEscolares sejam sempre arrays
  const filiaisArray = Array.isArray(filiais) ? filiais : [];
  const unidadesEscolaresArray = Array.isArray(unidadesEscolares) ? unidadesEscolares : [];
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <SearchableSelect
            label="Filial"
            value={filialId}
            onChange={onFilialChange}
            options={filiaisArray.map(filial => ({
              value: String(filial.id),
              label: filial.filial || filial.nome || `Filial ${filial.id}`
            }))}
            placeholder="Selecione uma filial..."
            disabled={isViewMode || loadingFiliais}
            required
            usePortal={false}
          />
        </div>
        
        <div>
          <SearchableSelect
            label="Cozinha Industrial"
            value={formData.unidade_id}
            onChange={(value) => onInputChange('unidade_id', value)}
            options={unidadesEscolaresArray.map(escola => ({
              value: escola.id,
              label: escola.nome_escola,
              description: `${escola.cidade} - ${escola.rota_nome || 'Sem rota'}`
            }))}
            placeholder={!filialId ? 'Selecione primeiro uma filial' : loadingEscolas ? 'Carregando...' : 'Selecione uma cozinha industrial...'}
            disabled={isViewMode || loadingEscolas || !filialId}
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
    </div>
  );
};

export default SelecaoUnidadeData;

