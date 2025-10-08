// Adaptador: Converte booleans para funções antes de usar componente do Foods
import React from 'react';
import FoodsUnidadesEscolaresTable from 'foods-frontend/src/components/unidades-escolares/UnidadesEscolaresTable';

const UnidadesEscolaresTable = (props) => {
  const { canView, canEdit, canDelete, ...otherProps } = props;

  // Converter booleans para funções mock (compatibilidade com Foods)
  const canViewFn = () => canView;
  const canEditFn = () => canEdit;
  const canDeleteFn = () => canDelete;

  return (
    <FoodsUnidadesEscolaresTable
      {...otherProps}
      canView={canViewFn}
      canEdit={canEditFn}
      canDelete={canDeleteFn}
    />
  );
};

export default UnidadesEscolaresTable;