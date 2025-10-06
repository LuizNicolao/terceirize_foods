import React from 'react';
import { FaPlus } from 'react-icons/fa';
import Button from '../ui/Button';

const UsuariosActions = ({ 
  canCreate = false,
  onAdd,
  loading = false 
}) => {
  if (!canCreate) return null;

  return (
    <div className="flex justify-end">
      <Button
        onClick={onAdd}
        variant="primary"
        size="sm"
        className="inline-flex items-center"
        disabled={loading}
      >
        <FaPlus className="mr-1 sm:mr-2" />
        <span className="hidden sm:inline">Novo Usuário</span>
        <span className="sm:hidden">Novo</span>
      </Button>
    </div>
  );
};

export default UsuariosActions;
