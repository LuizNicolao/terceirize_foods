import React from 'react';
import ActionButtons from '../ui/ActionButtons'; // Usar o ActionButtons local que chama funções

const FornecedoresActions = ({ 
  fornecedor, 
  canView, // This is a boolean from implantacao
  canEdit, // This is a boolean from implantacao
  canDelete, // This is a boolean from implantacao
  onView, 
  onEdit, 
  onDelete 
}) => {
  // No modo consulta, sempre false para edit e delete
  // ActionButtons local chama funções se forem funções
  return (
    <ActionButtons
      canView={canView}
      canEdit={false} // Sempre false no modo consulta
      canDelete={false} // Sempre false no modo consulta
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      item={fornecedor}
    />
  );
};

export default FornecedoresActions;
