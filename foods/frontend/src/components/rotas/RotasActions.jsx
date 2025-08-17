import React from 'react';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { Button } from '../ui';

const RotasActions = ({ 
  rota, 
  canView, 
  canEdit, 
  canDelete, 
  onView, 
  onEdit, 
  onDelete 
}) => {
  // Verificar se as funções de permissão são válidas
  const canViewRotas = typeof canView === 'function' ? canView('rotas') : false;
  const canEditRotas = typeof canEdit === 'function' ? canEdit('rotas') : false;
  const canDeleteRotas = typeof canDelete === 'function' ? canDelete('rotas') : false;

  return (
    <div className="flex items-center gap-1">
      {canViewRotas && onView && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(rota)}
          title="Visualizar"
          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
        >
          <FaEye className="w-3 h-3" />
        </Button>
      )}
      
      {canEditRotas && onEdit && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(rota)}
          title="Editar"
          className="text-green-600 hover:text-green-800 hover:bg-green-50"
        >
          <FaEdit className="w-3 h-3" />
        </Button>
      )}
      
      {canDeleteRotas && onDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(rota.id)}
          title="Excluir"
          className="text-red-600 hover:text-red-800 hover:bg-red-50"
        >
          <FaTrash className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
};

export default RotasActions;
