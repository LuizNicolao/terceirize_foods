import React from 'react';
import { SearchableSelect } from '../../ui';

/**
 * Seção de Seleção de Filial, Centro de Custo e Contrato
 */
const SelecaoFilialCentroCustoContrato = ({
  filialId,
  centroCustoId,
  contratoId,
  filiais,
  centrosCusto,
  contratos,
  loadingFiliais,
  loadingCentrosCusto,
  loadingContratos,
  isViewMode,
  isEditing,
  errors,
  onFilialChange,
  onCentroCustoChange,
  onContratoChange
}) => {
  return (
    <div className="space-y-3">
      {/* Filial */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Filial <span className="text-red-500">*</span>
        </label>
        <SearchableSelect
          value={filialId ? String(filialId) : ''}
          onChange={onFilialChange}
          options={filiais.map(f => ({
            value: String(f.id),
            label: f.filial || f.nome || `Filial ${f.id}`
          }))}
          placeholder="Selecione uma filial..."
          disabled={loadingFiliais || isViewMode}
          required
          error={errors.filial_id}
          usePortal={false}
        />
      </div>

      {/* Centro de Custo */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Centro de Custo <span className="text-red-500">*</span>
        </label>
        <SearchableSelect
          value={centroCustoId ? String(centroCustoId) : ''}
          onChange={onCentroCustoChange}
          options={centrosCusto.map(c => ({
            value: String(c.id),
            label: c.nome || `Centro de Custo ${c.id}`
          }))}
          placeholder={!filialId ? 'Selecione primeiro uma filial' : loadingCentrosCusto ? 'Carregando...' : 'Selecione um centro de custo'}
          disabled={loadingCentrosCusto || isViewMode || !filialId}
          required
          error={errors.centro_custo_id}
          usePortal={false}
        />
      </div>

      {/* Contrato */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Contrato <span className="text-red-500">*</span>
        </label>
        <SearchableSelect
          value={contratoId ? String(contratoId) : ''}
          onChange={onContratoChange}
          options={contratos.map(c => ({
            value: String(c.id),
            label: c.nome || `Contrato ${c.id}`
          }))}
          placeholder={!centroCustoId ? 'Selecione primeiro um centro de custo' : loadingContratos ? 'Carregando...' : 'Selecione um contrato'}
          disabled={loadingContratos || isViewMode || !centroCustoId}
          required
          error={errors.contrato_id}
          usePortal={false}
        />
      </div>
    </div>
  );
};

export default SelecaoFilialCentroCustoContrato;

