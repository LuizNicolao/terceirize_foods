import React from 'react';
import { FaEdit } from 'react-icons/fa';
import { StatusBadge } from '../StatusBadge';
import { ExportButtons } from '../../shared';

const AjusteHeader = ({ 
  activeTab, 
  statusAtual, 
  onExportExcel, 
  onExportPDF,
  disabled = false 
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
          <FaEdit className="mr-2 sm:mr-3 text-blue-600" />
          {activeTab === 'nutricionista' 
            ? 'Ajuste de Necessidade por Nutricionista' 
            : 'Ajuste de Necessidade por Coordenação'}
        </h1>
        <p className="text-gray-600 mt-1">
          {activeTab === 'nutricionista' 
            ? 'Visualize, edite e ajuste necessidades geradas' 
            : 'Visualize, edite e ajuste necessidades para coordenação'}
        </p>
      </div>
      <div className="flex items-center space-x-3">
        <StatusBadge status={statusAtual} />
        <ExportButtons
          onExportXLSX={onExportExcel}
          onExportPDF={onExportPDF}
          size="sm"
          variant="outline"
          showLabels={true}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default AjusteHeader;
