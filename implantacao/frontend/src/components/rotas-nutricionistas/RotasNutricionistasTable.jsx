// Adaptador: Converte booleans para funções antes de usar componente do Foods
import React from 'react';
import FoodsRotasNutricionistasTable from 'foods-frontend/src/components/rotas-nutricionistas/RotasNutricionistasTable';

const RotasNutricionistasTable = (props) => {
  const { canView, canEdit, canDelete, ...otherProps } = props;

  // Converter booleans para funções mock (compatibilidade com Foods)
  const canViewFn = () => canView;
  const canEditFn = () => canEdit;
  const canDeleteFn = () => canDelete;

  return (
    <FoodsRotasNutricionistasTable
      {...otherProps}
      canView={canViewFn}
      canEdit={canEditFn}
      canDelete={canDeleteFn}
    />
  );
};

export default RotasNutricionistasTable;