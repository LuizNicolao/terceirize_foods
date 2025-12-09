import React from 'react';
import { Button } from '../../ui';

/**
 * Seção de Ações em Massa
 */
const AcoesMassa = ({
  loadingUnidades,
  loading,
  periodos,
  isEditing,
  onConfirmarAcaoMassa
}) => {
  if (isEditing) {
    return null;
  }

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={loadingUnidades || loading || periodos.length === 0}
        onClick={() => onConfirmarAcaoMassa('selecionar')}
      >
        Marcar todos
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={loadingUnidades || loading}
        onClick={() => onConfirmarAcaoMassa('desmarcar')}
        className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
      >
        Desmarcar todos
      </Button>
    </div>
  );
};

export default AcoesMassa;

