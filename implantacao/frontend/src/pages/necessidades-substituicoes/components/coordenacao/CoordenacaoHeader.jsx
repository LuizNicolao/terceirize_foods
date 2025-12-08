import React from 'react';
import { ExportButtons } from '../../../../components/shared';

const CoordenacaoHeader = ({
  totalProdutos,
  totalNecessidades,
  totalEscolas,
  onExportXLSX,
  onExportPDF
}) => {
  if (totalProdutos === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">
          Produtos para Substituição ({totalProdutos}) • {totalNecessidades} {totalNecessidades === 1 ? 'necessidade' : 'necessidades'} • {totalEscolas} {totalEscolas === 1 ? 'escola' : 'escolas'}
        </h2>
        <div className="flex items-center gap-2">
          <ExportButtons
            onExportXLSX={onExportXLSX}
            onExportPDF={onExportPDF}
            size="sm"
            variant="outline"
            showLabels={true}
          />
        </div>
      </div>
    </div>
  );
};

export default CoordenacaoHeader;

