import React from 'react';
import { FiliaisTable as FoodsFiliaisTable } from 'foods-frontend/src/components/filiais';
import FiliaisActions from './FiliaisActions'; // Local adaptor

const FiliaisTable = ({ 
  filiais, 
  canView, 
  canEdit, 
  canDelete, 
  onView, 
  onEdit, 
  onDelete, 
  loading,
  sortField,
  sortDirection,
  onSort,
  ...otherProps
}) => {
  // Adapt the boolean props to functions that the FoodsFiliaisTable expects
  // O componente do foods chama canEdit('filiais') e canDelete('filiais'), então precisa ser função
  const canViewFn = () => canView;
  // No modo consulta, sempre retornar false para edit e delete
  const canEditFn = canEdit !== undefined ? () => canEdit : () => false;
  const canDeleteFn = canDelete !== undefined ? () => canDelete : () => false;

  return (
    <FoodsFiliaisTable
      filiais={filiais}
      canView={canViewFn}
      canEdit={canEditFn}
      canDelete={canDeleteFn}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      loading={loading}
      sortField={sortField}
      sortDirection={sortDirection}
      onSort={onSort}
      {...otherProps}
    />
  );
};

export default FiliaisTable;
