import React from 'react';
import { FaPlus, FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { ExportButtons } from '../shared';
import { Button } from '../ui';

/**
 * Componente de ações para Produtos Per Capita
 * Segue padrão de excelência do sistema
 */
const ProdutosPerCapitaActions = ({ 
  canCreate = false,
  onAdd,
  onExportPDF,
  onExportXLSX,
  loading = false 
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-gray-800">
          Produtos Per Capita
        </h2>
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <ExportButtons
          onExportXLSX={onExportXLSX}
          onExportPDF={onExportPDF}
          size="sm"
          variant="outline"
          showLabels={true}
          disabled={loading}
        />
        
        {canCreate && (
          <Button
            onClick={onAdd}
            variant="primary"
            size="sm"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Adicionar Produto</span>
            <span className="sm:hidden">Adicionar</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProdutosPerCapitaActions;
