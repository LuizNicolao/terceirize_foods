import React from 'react';
import { ActionButtons } from 'foods-frontend/src/components/ui'; // Import from Foods

const FornecedoresActions = ({ 
  fornecedor, 
  canView, // This is a boolean from implantacao
  canEdit, // This is a boolean from implantacao
  canDelete, // This is a boolean from implantacao
  onView, 
  onEdit, 
  onDelete 
}) => {
  // Adapt the boolean props to functions that the Foods ActionButtons expects
  const canViewFn = () => canView;
  const canEditFn = () => canEdit;
  const canDeleteFn = () => canDelete;

  return (
    <ActionButtons
      canView={canViewFn}
      canEdit={canEditFn}
      canDelete={canDeleteFn}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      item={fornecedor}
    />
  );
};

export default FornecedoresActions;
