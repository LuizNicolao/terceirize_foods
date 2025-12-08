// Adaptador: Converte booleans para funções antes de usar componente do Foods
import React from 'react';
import FoodsProdutoOrigemTable from 'foods-frontend/src/components/produto-origem/ProdutoOrigemTable';

const ProdutosOrigemTable = (props) => {
  const { canView, canEdit, canDelete, onEdit, onDelete, ...otherProps } = props;

  // Converter booleans para funções mock (compatibilidade com Foods)
  const canViewFn = () => canView;
  const canEditFn = () => canEdit;
  const canDeleteFn = () => canDelete;

  // Só passar onEdit e onDelete se as permissões forem verdadeiras
  const propsToPass = {
    ...otherProps,
    canView: canViewFn,
    canEdit: canEditFn,
    canDelete: canDeleteFn
  };

  if (canEdit && onEdit) {
    propsToPass.onEdit = onEdit;
  }

  if (canDelete && onDelete) {
    propsToPass.onDelete = onDelete;
  }

  return (
    <FoodsProdutoOrigemTable {...propsToPass} />
  );
};

export default ProdutosOrigemTable;