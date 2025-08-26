import React from 'react';
import { FaSave } from 'react-icons/fa';
import { Button, LoadingSpinner } from '../../../../components/ui';

const SubmitButton = ({ analisando, disabled = false }) => {
  return (
    <div className="flex gap-2 pt-4">
      <Button
        type="submit"
        disabled={analisando || disabled}
        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
      >
        {analisando ? (
          <>
            <LoadingSpinner inline />
            Analisando...
          </>
        ) : (
          <>
            <FaSave size={14} />
            Salvar Análise
          </>
        )}
      </Button>
    </div>
  );
};

export default SubmitButton;
