import React from 'react';
import { FaPlus, FaFilePdf, FaFileExcel } from 'react-icons/fa';
import Button from '../ui/Button';

const ProdutosPerCapitaActions = ({ 
  canCreate = false,
  onAdd,
  onExportPDF,
  onExportXLSX,
  loading = false 
}) => {
  return (
    <div className="flex justify-end gap-2">
      {onExportPDF && (
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
      )}
      
      {onExportXLSX && (
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
      )}
      
      {canCreate && (
        <Button
          onClick={onAdd}
          variant="primary"
          size="sm"
          disabled={loading}
        >
          <FaPlus className="mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Adicionar Produto</span>
          <span className="sm:hidden">Adicionar</span>
        </Button>
      )}
    </div>
  );
};

export default ProdutosPerCapitaActions;
