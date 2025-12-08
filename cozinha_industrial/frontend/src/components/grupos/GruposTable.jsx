// Adaptador: Converte booleans para funções antes de usar componente do Foods
import React from 'react';
import FoodsGruposTable from 'foods-frontend/src/components/grupos/GruposTable';

const GruposTable = (props) => {
  const { canView, canEdit, canDelete, ...otherProps } = props;

  // Converter booleans para funções mock (compatibilidade com Foods)
  const canViewFn = () => canView;
  const canEditFn = () => canEdit;
  const canDeleteFn = () => canDelete;

  return (
    <FoodsGruposTable
      {...otherProps}
      canView={canViewFn}
      canEdit={canEditFn}
      canDelete={canDeleteFn}
    />
  );
};

export default GruposTable;
