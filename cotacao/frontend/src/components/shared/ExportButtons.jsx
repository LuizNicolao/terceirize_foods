import React, { useState } from 'react';
import { FaFileExcel, FaFilePdf, FaSpinner } from 'react-icons/fa';
import { Button } from '../ui';

const ExportButtons = ({ 
  onExportXLSX, 
  onExportPDF, 
  size = 'sm', 
  variant = 'outline',
  showLabels = true,
  className = '',
  disabled = false,
  loading = false
}) => {
  const [exportingXLSX, setExportingXLSX] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  const handleExportXLSX = async () => {
    if (exportingXLSX) return;
    
    setExportingXLSX(true);
    try {
      await onExportXLSX();
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
    } finally {
      setExportingXLSX(false);
    }
  };

  const handleExportPDF = async () => {
    if (exportingPDF) return;
    
    setExportingPDF(true);
    try {
      await onExportPDF();
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
    } finally {
      setExportingPDF(false);
    }
  };

  return (
    <div className={`flex gap-2 sm:gap-3 ${className}`}>
      <Button
        onClick={handleExportXLSX}
        variant={variant}
        size={size}
        disabled={disabled || loading || exportingXLSX}
        className="flex items-center gap-2 min-w-[120px] justify-center"
      >
        {exportingXLSX ? (
          <FaSpinner className="w-4 h-4 animate-spin" />
        ) : (
          <FaFileExcel className="w-4 h-4" />
        )}
        {showLabels && (
          <>
            <span className="hidden sm:inline">
              {exportingXLSX ? 'Exportando...' : 'Exportar XLSX'}
            </span>
            <span className="sm:hidden">
              {exportingXLSX ? '...' : 'XLSX'}
            </span>
          </>
        )}
      </Button>
      
      <Button
        onClick={handleExportPDF}
        variant={variant}
        size={size}
        disabled={disabled || loading || exportingPDF}
        className="flex items-center gap-2 min-w-[120px] justify-center"
      >
        {exportingPDF ? (
          <FaSpinner className="w-4 h-4 animate-spin" />
        ) : (
          <FaFilePdf className="w-4 h-4" />
        )}
        {showLabels && (
          <>
            <span className="hidden sm:inline">
              {exportingPDF ? 'Exportando...' : 'Exportar PDF'}
            </span>
            <span className="sm:hidden">
              {exportingPDF ? '...' : 'PDF'}
            </span>
          </>
        )}
      </Button>
    </div>
  );
};

export default ExportButtons;
