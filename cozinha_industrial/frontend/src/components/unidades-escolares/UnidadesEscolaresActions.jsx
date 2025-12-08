import React from 'react';
import { ActionButtons } from '../ui';

// Adaptador para o componente do Foods
// Implantação passa booleans, não funções
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
      canView={canView}  // ← Já é boolean
      canEdit={canEdit}  // ← Já é boolean
      canDelete={canDelete}  // ← Já é boolean
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      item={unidade}
    />
  );
};

export default UnidadesEscolaresActions;