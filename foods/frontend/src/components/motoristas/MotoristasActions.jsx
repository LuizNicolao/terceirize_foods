import React from 'react';
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import { Button } from '../ui';

const MotoristasActions = ({ onExportXLSX, onExportPDF }) => {
  return (
    <div className="flex justify-end gap-2 mb-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onExportXLSX}
        className="flex items-center gap-2"
      >
        <FaFileExcel className="w-4 h-4" />
        Exportar XLSX
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onExportPDF}
        className="flex items-center gap-2"
      >
        <FaFilePdf className="w-4 h-4" />
        Exportar PDF
      </Button>
    </div>
  );
};

export default MotoristasActions;
