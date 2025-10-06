import React from 'react';
import { FaPlus } from 'react-icons/fa';
import Button from '../ui/Button';

const RecebimentosActions = ({ 
  canCreate = false,
  onAdd,
  loading = false 
}) => {
  return (
    <div className="flex justify-end mb-6">
      {canCreate && (
        <Button
          onClick={onAdd}
          variant="primary"
          size="sm"
          disabled={loading}
        >
          <FaPlus className="mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Novo Recebimento</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      )}
    </div>
  );
};

export default RecebimentosActions;
