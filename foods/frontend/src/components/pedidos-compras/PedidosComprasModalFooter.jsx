import React from 'react';
import { FaSave, FaCheck } from 'react-icons/fa';
import { Button } from '../ui';

const PedidosComprasModalFooter = ({
  isViewMode,
  pedidoCompras,
  saving,
  loading,
  onClose,
  onApprove
}) => {
  const canApprove = pedidoCompras && pedidoCompras.status === 'em_digitacao';

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
      {!isViewMode && pedidoCompras && canApprove && onApprove && (
        <Button
          type="button"
          variant="primary"
          onClick={onApprove}
          disabled={saving || loading}
          loading={saving}
          size="sm"
        >
          <FaCheck className="mr-2" />
          Aprovar
        </Button>
      )}
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

