import React from 'react';
import { ActionButtons } from '../ui';

const UnidadesEscolaresActions = ({ 
  unidade, 
  canView, 
  canEdit, 
  canDelete, 
  onView, 
  onEdit, 
  onDelete
}) => {
  return (
    <ActionButtons
      canView={canView('unidades_escolares')}
      canEdit={canEdit('unidades_escolares')}
      canDelete={canDelete('unidades_escolares')}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      item={unidade}
    />
  );
};

export default UnidadesEscolaresActions;
