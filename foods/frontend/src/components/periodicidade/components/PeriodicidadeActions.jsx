import React from 'react';
import { Button } from '../../ui';

const PeriodicidadeActions = ({
  isViewMode,
  isEdit,
  onClose,
  onSubmit
}) => {
  if (isViewMode) {
    return null;
  }

  return (
    <div className="flex justify-end gap-3 pt-4 border-t">
      <Button
        type="button"
        variant="secondary"
        onClick={onClose}
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        variant="primary"
        onClick={onSubmit}
      >
        {isEdit ? 'Atualizar' : 'Criar'} Agrupamento
      </Button>
    </div>
  );
};

export default PeriodicidadeActions;
