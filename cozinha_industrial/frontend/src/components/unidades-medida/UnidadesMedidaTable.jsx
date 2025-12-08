// Adaptador: Converte booleans para funções antes de usar componente do Foods
import React from 'react';
import FoodsUnidadesTable from 'foods-frontend/src/components/unidades/UnidadesTable';

const UnidadesMedidaTable = (props) => {
  const { canView, canEdit, canDelete, ...otherProps } = props;

  // Converter booleans para funções mock (compatibilidade com Foods)
  const canViewFn = () => canView;
  const canEditFn = () => canEdit;
  const canDeleteFn = () => canDelete;

  return (
    <FoodsUnidadesTable
      {...otherProps}
      canView={canViewFn}
      canEdit={canEditFn}
      canDelete={canDeleteFn}
    />
  );
};

export default UnidadesMedidaTable;
