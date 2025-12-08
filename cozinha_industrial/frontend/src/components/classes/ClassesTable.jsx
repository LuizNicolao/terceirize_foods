// Adaptador: Converte booleans para funções antes de usar componente do Foods
import React from 'react';
import FoodsClassesTable from 'foods-frontend/src/components/classes/ClassesTable';

const ClassesTable = (props) => {
  const { canView, canEdit, canDelete, ...otherProps } = props;

  // Converter booleans para funções mock (compatibilidade com Foods)
  const canViewFn = () => canView;
  const canEditFn = () => canEdit;
  const canDeleteFn = () => canDelete;

  return (
    <FoodsClassesTable
      {...otherProps}
      canView={canViewFn}
      canEdit={canEditFn}
      canDelete={canDeleteFn}
    />
  );
};

export default ClassesTable;
