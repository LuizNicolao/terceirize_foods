import React from 'react';
import { FornecedoresTable as FoodsFornecedoresTable } from 'foods-frontend/src/components/fornecedores';
import FornecedoresActions from './FornecedoresActions'; // Local adaptor

const FornecedoresTable = ({ 
  fornecedores, 
  canView, 
  canEdit, 
  canDelete, 
  onView, 
  onEdit, 
  onDelete, 
  loading
}) => {
  // Adapt the boolean props to functions that the FoodsFornecedoresTable expects
  const canViewFn = () => canView;
  const canEditFn = () => canEdit;
  const canDeleteFn = () => canDelete;

  return (
    <FoodsFornecedoresTable
      fornecedores={fornecedores}
      canView={canViewFn}
      canEdit={canEditFn}
      canDelete={canDeleteFn}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      loading={loading}
      // Pass the local FornecedoresActions adaptor
      FornecedoresActionsComponent={FornecedoresActions}
    />
  );
};

export default FornecedoresTable;