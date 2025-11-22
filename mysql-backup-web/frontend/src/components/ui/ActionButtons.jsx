import React from 'react';
import { FaEye, FaEdit, FaTrash, FaDownload, FaRedo, FaStop } from 'react-icons/fa';
import Button from './Button';

const ActionButtons = ({ 
  canView = false, 
  canEdit = false, 
  canDelete = false,
  canDownload = false,
  canRestore = false,
  canCancel = false,
  onView, 
  onEdit, 
  onDelete,
  onDownload,
  onRestore,
  onCancel,
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

      {canDownload && onDownload && (
        <Button
          variant="ghost"
          size={size}
          onClick={() => onDownload(item)}
          title="Download"
          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
        >
          <FaDownload className="w-3 h-3" />
        </Button>
      )}

      {canRestore && onRestore && (
        <Button
          variant="ghost"
          size={size}
          onClick={() => onRestore(item)}
          title="Restaurar"
          className="text-green-600 hover:text-green-800 hover:bg-green-50"
        >
          <FaRedo className="w-3 h-3" />
        </Button>
      )}

      {canCancel && onCancel && (
        <Button
          variant="ghost"
          size={size}
          onClick={() => onCancel(item)}
          title="Cancelar"
          className="text-orange-600 hover:text-orange-800 hover:bg-orange-50"
        >
          <FaStop className="w-3 h-3" />
        </Button>
      )}
      
      {canDelete && onDelete && (
        <Button
          variant="ghost"
          size={size}
          onClick={() => onDelete(item)}
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

