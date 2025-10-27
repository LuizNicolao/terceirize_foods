// Adaptador: Converte booleans para funções antes de usar componente do Foods
import React from 'react';
import FoodsProdutoOrigemTable from 'foods-frontend/src/components/produto-origem/ProdutoOrigemTable';

const ProdutosOrigemTable = (props) => {
  const { canView, canEdit, canDelete, ...otherProps } = props;

  // Converter booleans para funções mock (compatibilidade com Foods)
  const canViewFn = () => canView;
  const canEditFn = () => canEdit;
  const canDeleteFn = () => canDelete;

  return (
    <FoodsProdutoOrigemTable
      {...otherProps}
      canView={canViewFn}
      canEdit={canEditFn}
      canDelete={canDeleteFn}
    />
  );
};

export default ProdutosOrigemTable;