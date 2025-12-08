import React from 'react';
import FoodsProdutosComerciaisTable from 'foods-frontend/src/components/produto-comercial/ProdutoComercialTable';

/**
 * Componente adaptador para ProdutosComerciaisTable
 * Converte props booleanas para funções conforme esperado pelo componente do Foods
 */
const ProdutosComerciaisTable = (props) => {
  const { canView, canEdit, canDelete, ...otherProps } = props;

  const canViewFn = () => canView;
  const canEditFn = () => canEdit;
  const canDeleteFn = () => canDelete;

  return (
    <FoodsProdutosComerciaisTable
      {...otherProps}
      produtosComerciais={otherProps.produtosComerciais || otherProps.produtos}
      canView={canViewFn}
      canEdit={canEditFn}
      canDelete={canDeleteFn}
    />
  );
};

export default ProdutosComerciaisTable;

