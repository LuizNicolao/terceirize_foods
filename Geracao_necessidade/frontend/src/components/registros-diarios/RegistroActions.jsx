import React from 'react';
import Button from '../ui/Button';

const RegistroActions = ({ 
  onSave, 
  onClear, 
  saving, 
  canSave = true 
}) => {
  return (
    <div className="flex justify-between pt-4 border-t border-gray-200">
      <Button
        onClick={onClear}
        variant="secondary"
        size="md"
        disabled={saving}
      >
        Limpar
      </Button>
      
      <Button
        onClick={onSave}
        variant="primary"
        size="md"
        loading={saving}
        disabled={!canSave}
      >
        {saving ? 'Salvando...' : 'Salvar'}
      </Button>
    </div>
  );
};

export default RegistroActions;
