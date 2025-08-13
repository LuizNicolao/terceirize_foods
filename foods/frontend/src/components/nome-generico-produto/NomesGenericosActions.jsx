import React from 'react';
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import { Button } from '../../components/ui';

const NomesGenericosActions = ({ onExportXLSX, onExportPDF }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Button
        onClick={onExportXLSX}
        variant="outline"
        size="sm"
        className="text-xs"
      >
        <FaFileExcel className="mr-1 sm:mr-2" />
        <span className="hidden sm:inline">Exportar XLSX</span>
        <span className="sm:hidden">XLSX</span>
      </Button>
      
      <Button
        onClick={onExportPDF}
        variant="outline"
        size="sm"
        className="text-xs"
      >
        <FaFilePdf className="mr-1 sm:mr-2" />
        <span className="hidden sm:inline">Exportar PDF</span>
        <span className="sm:hidden">PDF</span>
      </Button>
    </div>
  );
};

export default NomesGenericosActions;
