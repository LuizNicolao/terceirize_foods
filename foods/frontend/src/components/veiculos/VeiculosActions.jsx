import React from 'react';
import { ActionButtons } from '../ui';

const VeiculosActions = ({ 
  veiculo, 
  canView, 
  canEdit, 
  canDelete, 
  onView, 
  onEdit, 
  onDelete 
}) => {
  return (
    <ActionButtons
      canView={canView('veiculos')}
      canEdit={canEdit('veiculos')}
      canDelete={canDelete('veiculos')}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      item={veiculo}
    />
  );
};

export default VeiculosActions;
