import React from 'react';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { Button } from '../ui';

const MotoristasActions = ({ 
  motorista, 
  canView, 
  canEdit, 
  canDelete, 
  onView, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className="flex items-center gap-1">
      {canView('motoristas') && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(motorista)}
          title="Visualizar"
          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
        >
          <FaEye className="w-3 h-3" />
        </Button>
      )}
      
      {canEdit('motoristas') && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(motorista)}
          title="Editar"
          className="text-green-600 hover:text-green-800 hover:bg-green-50"
        >
          <FaEdit className="w-3 h-3" />
        </Button>
      )}
      
      {canDelete('motoristas') && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(motorista.id)}
          title="Excluir"
          className="text-red-600 hover:text-red-800 hover:bg-red-50"
        >
          <FaTrash className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
};

export default MotoristasActions;
