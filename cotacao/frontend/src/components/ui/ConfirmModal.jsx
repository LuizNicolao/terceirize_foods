import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { Button, Modal } from './index';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirmar ação',
  message = 'Tem certeza que deseja realizar esta ação?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger' // 'danger', 'warning', 'info'
}) => {
  const typeClasses = {
    danger: {
      icon: 'text-red-500',
      button: 'bg-red-500 hover:bg-red-600 text-white'
    },
    warning: {
      icon: 'text-yellow-500',
      button: 'bg-yellow-500 hover:bg-yellow-600 text-white'
    },
    info: {
      icon: 'text-blue-500',
      button: 'bg-blue-500 hover:bg-blue-600 text-white'
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" title="">
      <div className="text-center">
        {/* Ícone */}
        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4`}>
          <FaExclamationTriangle className={`h-6 w-6 ${typeClasses[type].icon}`} />
        </div>

        {/* Título */}
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {title}
        </h3>

        {/* Mensagem */}
        <p className="text-sm text-gray-500 mb-6">
          {message}
        </p>

        {/* Botões */}
        <div className="flex justify-center space-x-3">
          <Button
            onClick={onClose}
            variant="outline"
            size="md"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            className={typeClasses[type].button}
            size="md"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
