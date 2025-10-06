import React from 'react';
import { FaFileExcel, FaFilePdf, FaShoppingCart } from 'react-icons/fa';
import { Button } from '../ui';

const NecessidadeActions = ({ 
  onExportXLSX, 
  onExportPDF, 
  onExportListaCompras,
  totalItems = 0,
  selectedItems = []
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          {totalItems} necessidades encontradas
        </span>
        {selectedItems.length > 0 && (
          <span className="text-sm text-green-600 font-medium">
            ({selectedItems.length} selecionadas)
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-2 ml-auto">
        <Button 
          onClick={onExportListaCompras} 
          variant="outline" 
          size="sm"
          className="text-xs"
        >
          <FaShoppingCart className="mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Lista de Compras</span>
          <span className="sm:hidden">Compras</span>
        </Button>
        
        <Button 
          onClick={onExportXLSX} 
          variant="outline" 
          size="sm"
          className="text-xs"
        >
          <FaFileExcel className="mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Exportar Excel</span>
          <span className="sm:hidden">Excel</span>
        </Button>
        
        <Button 
          onClick={onExportPDF} 
          variant="outline" 
          size="sm"
          className="text-xs"
        >
          <FaFilePdf className="mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Exportar PDF</span>
          <span className="sm:hidden">PDF</span>
        </Button>
      </div>
    </div>
  );
};

export default NecessidadeActions;
