import React from 'react';
import { FaPlus } from 'react-icons/fa';
import Button from '../ui/Button';

const MediasEscolasActions = ({ 
  canCreateRegistros, 
  onAddRegistro 
}) => {
  if (!canCreateRegistros) return null;

  return (
    <div className="flex justify-end mb-4">
      <Button
        onClick={onAddRegistro}
        variant="primary"
        size="sm"
      >
        <FaPlus className="mr-1 sm:mr-2" />
        <span className="hidden sm:inline">Adicionar Registro</span>
        <span className="sm:hidden">Adicionar</span>
      </Button>
    </div>
  );
};

export default MediasEscolasActions;
