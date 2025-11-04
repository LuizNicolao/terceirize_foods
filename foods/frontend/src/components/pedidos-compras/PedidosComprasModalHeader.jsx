import React from 'react';
import { FaTimes, FaEye, FaEdit, FaPlus } from 'react-icons/fa';
import { Button } from '../ui';

const PedidosComprasModalHeader = ({ 
  isViewMode, 
  pedidoCompras, 
  saving, 
  onClose 
}) => {
  return (
    <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
          {isViewMode ? (
            <FaEye className="w-5 h-5 text-white" />
          ) : pedidoCompras ? (
            <FaEdit className="w-5 h-5 text-white" />
          ) : (
            <FaPlus className="w-5 h-5 text-white" />
          )}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isViewMode 
              ? 'Visualizar Pedido de Compras' 
              : pedidoCompras 
                ? 'Editar Pedido de Compras' 
                : 'Novo Pedido de Compras'}
          </h2>
          <p className="text-sm text-gray-600">
            {isViewMode 
              ? 'Visualizando informações do pedido de compras' 
              : pedidoCompras 
                ? 'Editando informações do pedido de compras' 
                : 'Preencha as informações do novo pedido de compras'}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="p-2"
        disabled={saving}
      >
        <FaTimes className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default PedidosComprasModalHeader;

