import React from 'react';
import { RotasNutricionistasTable as FoodsRotasNutricionistasTable } from 'foods-frontend/src/components/rotas-nutricionistas';

const RotasNutricionistasTable = ({ 
  rotasNutricionistas, 
  canView, 
  canEdit, 
  canDelete, 
  onView, 
  onEdit, 
  onDelete, 
  loading,
  getUsuarioName,
  getSupervisorName,
  getCoordenadorName,
  loadingUsuarios
}) => {
  // A tabela de RotasNutricionistas do Foods usa boolean direto (não funções)
  // Diferente de outras tabelas que usam ActionButtons
  return (
    <FoodsRotasNutricionistasTable
      rotasNutricionistas={rotasNutricionistas}
      canView={canView}
      canEdit={canEdit}
      canDelete={canDelete}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      loading={loading}
      getUsuarioName={getUsuarioName}
      getSupervisorName={getSupervisorName}
      getCoordenadorName={getCoordenadorName}
      loadingUsuarios={loadingUsuarios}
    />
  );
};

export default RotasNutricionistasTable;
