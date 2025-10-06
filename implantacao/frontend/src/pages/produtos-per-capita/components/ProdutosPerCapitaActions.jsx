import React from 'react';
import { ExportButtons } from '../../../components/shared';

const ProdutosPerCapitaActions = ({ onExportXLSX, onExportPDF }) => {
  return (
    <div className="mb-4">
      <ExportButtons
        onExportXLSX={onExportXLSX}
        onExportPDF={onExportPDF}
        size="sm"
        variant="outline"
        showLabels={true}
      />
    </div>
  );
};

export default ProdutosPerCapitaActions;
