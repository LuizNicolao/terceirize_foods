import React from 'react';
import { ExportButtons } from '../shared';

const UsuariosActions = ({ onExportXLSX, onExportPDF }) => {
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

export default UsuariosActions;
