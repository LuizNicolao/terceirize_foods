import React from 'react';
import { ActionButtons } from '../ui';

const TipoRotaActions = ({ 
  tipoRota, 
  canView, 
  canEdit, 
  canDelete, 
  onView, 
  onEdit, 
  onDelete 
}) => {
  const canViewTipoRotas = typeof canView === 'function' ? canView('tipo_rota') : false;
  const canEditTipoRotas = typeof canEdit === 'function' ? canEdit('tipo_rota') : false;
  const canDeleteTipoRotas = typeof canDelete === 'function' ? canDelete('tipo_rota') : false;

  return (
    <ActionButtons
      canView={canViewTipoRotas}
      canEdit={canEditTipoRotas}
      canDelete={canDeleteTipoRotas}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      item={tipoRota}
    />
  );
};

export default TipoRotaActions;

