import React from 'react';
import FoodsCentrosCustoTable from 'foods-frontend/src/components/centro-custo/CentrosCustoTable';

/**
 * Adapter para CentrosCustoTable do Foods
 * Converte props booleanas para funções como esperado pelo componente Foods
 */
const CentrosCustoTable = (props) => {
  const { canView, canEdit, canDelete, ...otherProps } = props;

  const canViewFn = () => canView;
  const canEditFn = () => canEdit;
  const canDeleteFn = () => canDelete;

  return (
    <FoodsCentrosCustoTable
      {...otherProps}
      canView={canViewFn}
      canEdit={canEditFn}
      canDelete={canDeleteFn}
    />
  );
};

export default CentrosCustoTable;

