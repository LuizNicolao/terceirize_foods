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
  loading
}) => {
  // Adapt the boolean props to functions that the FoodsFiliaisTable expects
  const canViewFn = () => canView;
  const canEditFn = () => canEdit;
  const canDeleteFn = () => canDelete;

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
      // Pass the local FiliaisActions adaptor
      FiliaisActionsComponent={FiliaisActions}
    />
  );
};

export default FiliaisTable;
