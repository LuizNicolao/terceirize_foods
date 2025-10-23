import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { Button } from '../ui';

const NecessidadesActions = ({ 
  canCreate = false,
  onAdd,
  loading = false 
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-gray-800">
          Necessidades
        </h2>
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        {canCreate && (
          <Button
            onClick={onAdd}
            variant="primary"
            size="sm"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Gerar Necessidade</span>
            <span className="sm:hidden">Gerar</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default NecessidadesActions;