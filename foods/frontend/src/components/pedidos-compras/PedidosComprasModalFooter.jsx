import React from 'react';
import { FaSave } from 'react-icons/fa';
import { Button } from '../ui';

const PedidosComprasModalFooter = ({
  isViewMode,
  pedidoCompras,
  saving,
  loading,
  onClose
}) => {
  return (
    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 px-6 pb-6">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={saving}
        size="sm"
      >
        {isViewMode ? 'Fechar' : 'Cancelar'}
      </Button>
      {!isViewMode && (
        <Button
          type="submit"
          disabled={saving || loading}
          loading={saving}
          size="sm"
        >
          <FaSave className="mr-2" />
          {pedidoCompras ? 'Atualizar' : 'Criar'}
        </Button>
      )}
    </div>
  );
};

export default PedidosComprasModalFooter;

