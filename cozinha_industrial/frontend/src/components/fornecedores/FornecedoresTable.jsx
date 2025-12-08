import React from 'react';
import { FornecedoresTable as FoodsFornecedoresTable } from 'foods-frontend/src/components/fornecedores';
import FornecedoresActions from './FornecedoresActions'; // Local adaptor

const FornecedoresTable = ({ 
  fornecedores, 
  canView, 
  canEdit, 
  canDelete, 
  onView, 
  onEdit, 
  onDelete, 
  loading,
  sortField,
  sortDirection,
  onSort,
  ...otherProps
}) => {
  // Adapt the boolean props to functions that the FoodsFornecedoresTable expects
  // No modo consulta, passar false diretamente (não funções) para que ActionButtons não mostre os botões
  const canViewFn = () => canView;
  // Se canEdit ou canDelete não forem passados ou forem false, passar false diretamente
  // O ActionButtons do foods verifica canEdit &&, então false não mostra o botão
  const canEditValue = canEdit !== undefined ? canEdit : false;
  const canDeleteValue = canDelete !== undefined ? canDelete : false;

  return (
    <FoodsFornecedoresTable
      fornecedores={fornecedores}
      canView={canViewFn}
      canEdit={canEditValue}
      canDelete={canDeleteValue}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      loading={loading}
      sortField={sortField}
      sortDirection={sortDirection}
      onSort={onSort}
      {...otherProps}
    />
  );
};

export default FornecedoresTable;