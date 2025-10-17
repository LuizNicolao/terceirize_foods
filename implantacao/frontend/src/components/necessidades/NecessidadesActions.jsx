import React from 'react';
import { FaFileExcel, FaFilePdf, FaPlus } from 'react-icons/fa';
import { Button } from '../ui';

const NecessidadesActions = ({ 
  canCreate = false,
  canExport = false,
  onAdd,
  onExportXLSX,
  onExportPDF,
  loading = false 
}) => {
  return (
    <div className="flex justify-end gap-2">
      {canExport && (
        <>
          <Button
            onClick={onExportXLSX}
            variant="secondary"
            size="sm"
            disabled={loading}
          >
            <FaFileExcel className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Exportar XLSX</span>
            <span className="sm:hidden">XLSX</span>
          </Button>
          
          <Button
            onClick={onExportPDF}
            variant="secondary"
            size="sm"
            disabled={loading}
          >
            <FaFilePdf className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Exportar PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
        </>
      )}
      
      {canCreate && (
        <Button
          onClick={onAdd}
          variant="primary"
          size="sm"
          disabled={loading}
        >
          <FaPlus className="mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Gerar Necessidade</span>
          <span className="sm:hidden">Gerar</span>
        </Button>
      )}
    </div>
  );
};

export default NecessidadesActions;