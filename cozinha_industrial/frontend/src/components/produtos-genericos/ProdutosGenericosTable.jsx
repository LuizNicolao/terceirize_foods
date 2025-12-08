import React from 'react';
import FoodsProdutosGenericosTable from 'foods-frontend/src/components/produto-generico/ProdutosGenericosTable';

/**
 * Componente adaptador para ProdutosGenericosTable
 * Converte props booleanas para funções conforme esperado pelo componente do Foods
 */
const ProdutosGenericosTable = (props) => {
  const { canView, canEdit, canDelete, ...otherProps } = props;

  const canViewFn = () => canView;
  const canEditFn = () => canEdit;
  const canDeleteFn = () => canDelete;

  return (
    <FoodsProdutosGenericosTable
      {...otherProps}
      canView={canViewFn}
      canEdit={canEditFn}
      canDelete={canDeleteFn}
    />
  );
};

export default ProdutosGenericosTable;

