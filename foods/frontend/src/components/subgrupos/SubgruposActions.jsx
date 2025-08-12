import React from 'react';
import { Button } from '../ui';
import { FaPlus, FaFileExcel, FaFilePdf } from 'react-icons/fa';

const SubgruposActions = ({ 
  canCreate, 
  onAdd, 
  onExportExcel, 
  onExportPdf,
  loading 
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="flex-1">
        {canCreate('subgrupos') && (
          <Button
            onClick={onAdd}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            <FaPlus className="mr-2" />
            Adicionar Subgrupo
          </Button>
        )}
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onExportExcel}
          disabled={loading}
          title="Exportar para Excel"
        >
          <FaFileExcel className="mr-2" />
          Excel
        </Button>
        <Button
          variant="outline"
          onClick={onExportPdf}
          disabled={loading}
          title="Exportar para PDF"
        >
          <FaFilePdf className="mr-2" />
          PDF
        </Button>
      </div>
    </div>
  );
};

export default SubgruposActions;
