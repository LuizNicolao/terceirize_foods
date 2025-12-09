import React from 'react';
import { SearchableSelect } from '../../ui';

/**
 * Seção de Seleção de Filial
 */
const SelecaoFilial = ({
  filialId,
  filiais,
  loadingFiliais,
  isViewMode,
  isEditing,
  errors,
  onFilialChange
}) => {
  return (
    <SearchableSelect
      value={filialId}
      onChange={onFilialChange}
      options={filiais.map(filial => ({
        value: String(filial.id),
        label: filial.filial || filial.nome || `Filial ${filial.id}`
      }))}
      placeholder="Selecione uma filial..."
      disabled={loadingFiliais || isViewMode || isEditing}
      required={!isEditing}
      error={errors.filial_id}
      usePortal={false}
    />
  );
};

export default SelecaoFilial;

