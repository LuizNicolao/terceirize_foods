import React from 'react';
import { FaEye, FaEdit, FaTrash, FaPrint, FaDownload } from 'react-icons/fa';
import Button from './Button';

// Componente ActionButtons que chama funções se forem funções
const ActionButtons = ({ 
  canView = false, 
  canEdit = false, 
  canDelete = false, 
  canPrint = false,
  canDownload = false,
  onView, 
  onEdit, 
  onDelete, 
  onPrint,
  onDownload,
  item,
  size = "sm",
  className = ""
}) => {
  // Se for função, chama; se não, usa o valor booleano
  const canViewValue = typeof canView === 'function' ? canView() : canView;
  const canEditValue = typeof canEdit === 'function' ? canEdit() : canEdit;
  const canDeleteValue = typeof canDelete === 'function' ? canDelete() : canDelete;
  const canPrintValue = typeof canPrint === 'function' ? canPrint() : canPrint;
  const canDownloadValue = typeof canDownload === 'function' ? canDownload() : canDownload;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {canViewValue && onView && (
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
      
      {canEditValue && (
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

      {canDownloadValue && (
        <Button
          variant="ghost"
          size={size}
          onClick={onDownload ? () => onDownload(item) : undefined}
          title={onDownload ? "Download do Arquivo" : "Arquivo não disponível"}
          disabled={!onDownload}
          className={onDownload ? "text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50" : "text-gray-400 cursor-not-allowed opacity-50"}
        >
          <FaDownload className="w-3 h-3" />
        </Button>
      )}
      
      {canDeleteValue && (
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
