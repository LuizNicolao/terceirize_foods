import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { Button } from '../ui';
import { ExportButtons } from '../shared';

const RecebimentosActions = ({ 
  canCreate = false,
  canExport = false,
  onAdd,
  onExportXLSX,
  onExportPDF,
  loading = false 
}) => {
  return (
    <div className="flex justify-end mb-6 space-x-3">
      {canCreate && (
        <Button
          onClick={onAdd}
          variant="primary"
          size="sm"
          disabled={loading}
        >
          <FaPlus className="mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Novo Recebimento</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      )}
      
      {canExport && (
        <ExportButtons
          onExportXLSX={onExportXLSX}
          onExportPDF={onExportPDF}
          size="sm"
          variant="outline"
          showLabels={true}
          disabled={loading}
        />
      )}
    </div>
  );
};

export default RecebimentosActions;
