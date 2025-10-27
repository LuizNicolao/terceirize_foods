// Adaptador: Converte booleans para funções antes de usar componente do Foods
import React from 'react';
import FoodsUnidadesMedidaTable from 'foods-frontend/src/components/unidades/UnidadesMedidaTable';

const UnidadesMedidaTable = (props) => {
  const { canView, canEdit, canDelete, ...otherProps } = props;

  // Converter booleans para funções mock (compatibilidade com Foods)
  const canViewFn = () => canView;
  const canEditFn = () => canEdit;
  const canDeleteFn = () => canDelete;

  return (
    <FoodsUnidadesMedidaTable
      {...otherProps}
      canView={canViewFn}
      canEdit={canEditFn}
      canDelete={canDeleteFn}
    />
  );
};

export default UnidadesMedidaTable;
