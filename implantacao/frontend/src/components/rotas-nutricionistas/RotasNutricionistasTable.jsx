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
  loadingUsuarios,
  mode // Adicionar prop mode para controlar modo consulta
}) => {
  // Adapt the boolean props to functions that the FoodsRotasNutricionistasTable expects
  const canViewFn = () => canView;
  // Em modo consulta, não permite editar ou deletar
  const canEditFn = () => mode === 'consulta' ? false : (canEdit || false);
  const canDeleteFn = () => mode === 'consulta' ? false : (canDelete || false);

  return (
    <FoodsRotasNutricionistasTable
      rotasNutricionistas={rotasNutricionistas}
      canView={canViewFn}
      canEdit={canEditFn}
      canDelete={canDeleteFn}
      onView={onView}
      onEdit={onEdit || (() => {})} // Passar função vazia se não fornecida
      onDelete={onDelete || (() => {})} // Passar função vazia se não fornecida
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