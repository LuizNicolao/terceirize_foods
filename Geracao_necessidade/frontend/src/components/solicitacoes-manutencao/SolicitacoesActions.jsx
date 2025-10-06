import React from 'react';
import { FaPlus, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import Button from '../ui/Button';

const SolicitacoesActions = ({ 
  onCreateNew, 
  onExportXLSX, 
  onExportPDF,
  canCreate = false,
  canExport = false,
  loading = false 
}) => {
  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {/* Nova Solicitação */}
      {canCreate && (
        <Button
          onClick={onCreateNew}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <FaPlus />
          Nova Solicitação
        </Button>
      )}


      {/* Exportar Excel */}
      {canExport && (
        <Button
          variant="outline"
          onClick={onExportXLSX}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <FaFileExcel />
          Excel
        </Button>
      )}

      {/* Exportar PDF */}
      {canExport && (
        <Button
          variant="outline"
          onClick={onExportPDF}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <FaFilePdf />
          PDF
        </Button>
      )}

    </div>
  );
};

export default SolicitacoesActions;
