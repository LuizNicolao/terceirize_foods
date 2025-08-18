import React from 'react';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import Button from './Button';

const ActionButtons = ({ 
  canView = false, 
  canEdit = false, 
  canDelete = false, 
  onView, 
  onEdit, 
  onDelete, 
  item,
  size = "sm",
  className = ""
}) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {canView && onView && (
        <Button
          variant="ghost"
          size={size}
          onClick={() => onView(item)}
          title="Visualizar"
          className="text-green-600 hover:text-green-800 hover:bg-green-50"
        >
          <FaEye className="w-3 h-3" />
        </Button>
      )}
      
      {canEdit && onEdit && (
        <Button
          variant="ghost"
          size={size}
          onClick={() => onEdit(item)}
          title="Editar"
          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
        >
          <FaEdit className="w-3 h-3" />
        </Button>
      )}
      
      {canDelete && onDelete && (
        <Button
          variant="ghost"
          size={size}
          onClick={() => onDelete(item.id || item)}
          title="Excluir"
          className="text-red-600 hover:text-red-800 hover:bg-red-50"
        >
          <FaTrash className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
};

export default ActionButtons;
