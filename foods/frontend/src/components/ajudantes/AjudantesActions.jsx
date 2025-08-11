import React from 'react';
import { FaPlus, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import { Button } from '../ui';

const AjudantesActions = ({ canCreate, onNew, onExportXLSX, onExportPDF, exportLoading }) => {
  return (
    <div className="flex items-center space-x-3">
      {canCreate && (
        <Button
          onClick={onNew}
          variant="primary"
          icon={<FaPlus />}
        >
          Novo Ajudante
        </Button>
      )}
      
      <Button
        onClick={onExportXLSX}
        variant="secondary"
        icon={<FaFileExcel />}
        loading={exportLoading}
        disabled={exportLoading}
      >
        Exportar XLSX
      </Button>
      
      <Button
        onClick={onExportPDF}
        variant="secondary"
        icon={<FaFilePdf />}
        loading={exportLoading}
        disabled={exportLoading}
      >
        Exportar PDF
      </Button>
    </div>
  );
};

export default AjudantesActions;
