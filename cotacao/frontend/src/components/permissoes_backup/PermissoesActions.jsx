import React from 'react';
import { ExportButtons } from '../shared';

const PermissoesActions = ({ onExportXLSX, onExportPDF }) => {
  return (
    <div className="mb-4 sm:mb-6">
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

export default PermissoesActions;
