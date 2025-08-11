import React from 'react';
import { Button } from '../ui';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';

const AjudantesActions = ({ 
  ajudante, 
  canView, 
  canEdit, 
  canDelete, 
  onView, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className="flex items-center gap-2">
      {canView('ajudantes') && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(ajudante)}
          className="text-blue-600 hover:text-blue-800"
          title="Visualizar"
        >
          <FaEye className="w-4 h-4" />
        </Button>
      )}
      
      {canEdit('ajudantes') && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(ajudante)}
          className="text-green-600 hover:text-green-800"
          title="Editar"
        >
          <FaEdit className="w-4 h-4" />
        </Button>
      )}
      
      {canDelete('ajudantes') && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(ajudante.id)}
          className="text-red-600 hover:text-red-800"
          title="Excluir"
        >
          <FaTrash className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export default AjudantesActions;
