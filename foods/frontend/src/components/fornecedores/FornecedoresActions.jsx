import React from 'react';
import { ExportButtons } from '../shared';

const FornecedoresActions = ({ onExportXLSX, onExportPDF }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="flex-1">
        {/* Botão removido - já existe no header */}
      </div>
      
      <ExportButtons 
        onExportXLSX={onExportXLSX}
        onExportPDF={onExportPDF}
        variant="outline"
        size="sm"
      />
    </div>
  );
};

export default FornecedoresActions;
