import React from 'react';
import { FaFileExcel, FaFilePdf, FaPrint } from 'react-icons/fa';
import { Button } from '../ui';

const FaturamentoActions = ({ 
  onExportXLSX, 
  onExportPDF, 
  onPrintPDF,
  totalItems = 0,
  selectedItems = []
}) => {
  return (
    <div className="flex gap-2 sm:gap-3 mb-4">
      <Button onClick={onExportXLSX} variant="outline" size="sm">
        <FaFileExcel className="mr-1 sm:mr-2" />
        <span className="hidden sm:inline">Exportar XLSX</span>
        <span className="sm:hidden">XLSX</span>
      </Button>
      <Button onClick={onExportPDF} variant="outline" size="sm">
        <FaFilePdf className="mr-1 sm:mr-2" />
        <span className="hidden sm:inline">Exportar PDF</span>
        <span className="sm:hidden">PDF</span>
      </Button>
      {onPrintPDF && (
        <Button onClick={onPrintPDF} variant="outline" size="sm">
          <FaPrint className="mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Imprimir</span>
          <span className="sm:hidden">Print</span>
        </Button>
      )}
    </div>
  );
};

export default FaturamentoActions;
