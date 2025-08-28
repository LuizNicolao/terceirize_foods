import React from 'react';
import { FaWarehouse } from 'react-icons/fa';
import { ActionButtons, Button } from '../ui';

const UnidadesEscolaresActions = ({ 
  unidade, 
  canView, 
  canEdit, 
  canDelete, 
  onView, 
  onEdit, 
  onDelete,
  onAlmoxarifados
}) => {
  return (
    <div className="flex gap-1">
      <ActionButtons
        canView={canView('unidades_escolares')}
        canEdit={canEdit('unidades_escolares')}
        canDelete={canDelete('unidades_escolares')}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        item={unidade}
      />
      {onAlmoxarifados && (
        <Button
          variant="ghost"
          size="xs"
          onClick={() => onAlmoxarifados(unidade)}
          title="Almoxarifados"
        >
          <FaWarehouse />
        </Button>
      )}
    </div>
  );
};

export default UnidadesEscolaresActions;
