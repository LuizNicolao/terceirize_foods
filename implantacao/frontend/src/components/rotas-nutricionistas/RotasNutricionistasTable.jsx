import React from 'react';
import { RotasNutricionistasTable as FoodsRotasNutricionistasTable } from 'foods-frontend/src/components/rotas-nutricionistas';
import RotasNutricionistasActions from './RotasNutricionistasActions'; // Local adaptor

const RotasNutricionistasTable = ({ 
  rotasNutricionistas, 
  canView, 
  canEdit, 
  canDelete, 
  onView, 
  onEdit, 
  onDelete,
  getUsuarioName,
  getSupervisorName,
  getCoordenadorName,
  loadingUsuarios
}) => {
  // Adapt the boolean props to functions that the FoodsRotasNutricionistasTable expects
  // Only pass the function if the permission is true
  const canViewFn = canView ? () => canView : undefined;
  const canEditFn = canEdit ? () => canEdit : undefined;
  const canDeleteFn = canDelete ? () => canDelete : undefined;

  return (
    <FoodsRotasNutricionistasTable
      rotasNutricionistas={rotasNutricionistas}
      canView={canViewFn}
      canEdit={canEditFn}
      canDelete={canDeleteFn}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      getUsuarioName={getUsuarioName}
      getSupervisorName={getSupervisorName}
      getCoordenadorName={getCoordenadorName}
      loadingUsuarios={loadingUsuarios}
      // Pass the local RotasNutricionistasActions adaptor
      RotasNutricionistasActionsComponent={RotasNutricionistasActions}
    />
  );
};

export default RotasNutricionistasTable;