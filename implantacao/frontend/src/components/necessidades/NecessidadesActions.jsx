import React from 'react';
import { FaPlus, FaQuestionCircle, FaUpload } from 'react-icons/fa';
import { Button } from '../ui';

const NecessidadesActions = ({ 
  canCreate = false,
  onAdd,
  onImport,
  onShowHelp,
  loading = false 
}) => {
  return (
    <div className="mb-6">
      <div className="flex justify-end">
        <div className="flex space-x-3">
          {canCreate && (
            <>
              <Button
                onClick={onImport}
                disabled={loading}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <FaUpload size={14} />
                <span>Importar</span>
              </Button>
              <Button
                onClick={onAdd}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <FaPlus size={14} />
                <span>Gerar Necessidade</span>
              </Button>
            </>
          )}
          <button
            onClick={onShowHelp}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            title="Ajuda"
          >
            <FaQuestionCircle size={16} />
            <span>Ajuda</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NecessidadesActions;