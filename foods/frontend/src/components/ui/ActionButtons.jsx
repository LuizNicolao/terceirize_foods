import React from 'react';
import { FaEye, FaEdit, FaTrash, FaPrint } from 'react-icons/fa';
import Button from './Button';

const ActionButtons = ({ 
  canView = false, 
  canEdit = false, 
  canDelete = false,
  canPrint = false,
  onView, 
  onEdit, 
  onDelete,
  onPrint,
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
      
      {canEdit && (
        <Button
          variant="ghost"
          size={size}
          onClick={onEdit ? () => onEdit(item) : undefined}
          title="Editar"
          disabled={!onEdit}
          className={onEdit ? "text-blue-600 hover:text-blue-800 hover:bg-blue-50" : "text-gray-400 cursor-not-allowed opacity-50"}
        >
          <FaEdit className="w-3 h-3" />
        </Button>
      )}
      
      {canPrint && onPrint && (
        <Button
          variant="ghost"
          size={size}
          onClick={() => onPrint(item)}
          title="Imprimir"
          className="text-purple-600 hover:text-purple-800 hover:bg-purple-50"
        >
          <FaPrint className="w-3 h-3" />
        </Button>
      )}
      
      {canDelete && (
        <Button
          variant="ghost"
          size={size}
          onClick={onDelete ? () => onDelete(item) : undefined}
          title="Excluir"
          disabled={!onDelete}
          className={onDelete ? "text-red-600 hover:text-red-800 hover:bg-red-50" : "text-gray-400 cursor-not-allowed opacity-50"}
        >
          <FaTrash className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
};

export default ActionButtons;
