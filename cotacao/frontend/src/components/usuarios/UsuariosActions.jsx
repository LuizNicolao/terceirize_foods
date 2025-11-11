import React from 'react';
import { ExportButtons } from '../shared';

const UsuariosActions = ({ onExportXLSX, onExportPDF, disabled = false }) => (
  <div className="mb-4">
    <ExportButtons
      onExportXLSX={onExportXLSX}
      onExportPDF={onExportPDF}
      disabled={disabled}
      variant="outline"
      size="sm"
      showLabels
    />
  </div>
);

export default UsuariosActions;

