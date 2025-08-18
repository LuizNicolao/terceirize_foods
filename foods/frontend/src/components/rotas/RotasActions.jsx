import React from 'react';
import { ActionButtons } from '../ui';

const RotasActions = ({ 
  rota, 
  canView, 
  canEdit, 
  canDelete, 
  onView, 
  onEdit, 
  onDelete 
}) => {
  // Verificar se as funções de permissão são válidas
  const canViewRotas = typeof canView === 'function' ? canView('rotas') : false;
  const canEditRotas = typeof canEdit === 'function' ? canEdit('rotas') : false;
  const canDeleteRotas = typeof canDelete === 'function' ? canDelete('rotas') : false;

  return (
    <ActionButtons
      canView={canViewRotas}
      canEdit={canEditRotas}
      canDelete={canDeleteRotas}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      item={rota}
    />
  );
};

export default RotasActions;
