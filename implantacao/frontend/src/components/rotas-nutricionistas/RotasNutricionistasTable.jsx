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
  loading
}) => {
  // Adapt the boolean props to functions that the FoodsRotasNutricionistasTable expects
  const canViewFn = () => canView;
  const canEditFn = () => canEdit;
  const canDeleteFn = () => canDelete;

  return (
    <FoodsRotasNutricionistasTable
      rotasNutricionistas={rotasNutricionistas}
      canView={canViewFn}
      canEdit={canEditFn}
      canDelete={canDeleteFn}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      loading={loading}
      // Pass the local RotasNutricionistasActions adaptor
      RotasNutricionistasActionsComponent={RotasNutricionistasActions}
    />
  );
};

export default RotasNutricionistasTable;
