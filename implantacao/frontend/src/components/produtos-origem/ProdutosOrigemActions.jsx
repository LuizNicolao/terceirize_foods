import React from 'react';
import { FaFileExcel, FaFilePdf, FaPrint } from 'react-icons/fa';
import { Button } from '../ui';

const ProdutosOrigemActions = ({
  onExportXLSX,
  onExportPDF,
  onPrintPDF,
  totalItems
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-sm text-gray-600">
          Total de registros: <span className="font-semibold">{totalItems}</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={onExportXLSX}
            variant="outline"
            size="sm"
            title="Exportar para Excel"
          >
            <FaFileExcel className="mr-2 h-4 w-4" />
            Excel
          </Button>
          
          <Button
            onClick={onExportPDF}
            variant="outline"
            size="sm"
            title="Exportar para PDF"
          >
            <FaFilePdf className="mr-2 h-4 w-4" />
            PDF
          </Button>
          
          <Button
            onClick={onPrintPDF}
            variant="outline"
            size="sm"
            title="Imprimir"
          >
            <FaPrint className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProdutosOrigemActions;
