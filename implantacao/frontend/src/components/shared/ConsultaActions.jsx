import React from 'react';
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import { Button } from '../ui';

const ConsultaActions = ({ 
  onExportXLSX, 
  onExportPDF, 
  totalItems,
  loading = false,
  showTotal = true
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {showTotal && (
          <div className="text-sm text-gray-600">
            Total de registros: <span className="font-semibold">{totalItems || 0}</span>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={onExportXLSX}
            variant="outline"
            size="sm"
            title="Exportar para Excel"
            disabled={!totalItems || loading}
          >
            <FaFileExcel className="mr-2 h-4 w-4" />
            Excel
          </Button>
          
          <Button
            onClick={onExportPDF}
            variant="outline"
            size="sm"
            title="Exportar para PDF"
            disabled={!totalItems || loading}
          >
            <FaFilePdf className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConsultaActions;
