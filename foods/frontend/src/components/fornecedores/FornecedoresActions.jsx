import React from 'react';
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import { Button } from '../ui';
import { usePermissions } from '../../contexts/PermissionsContext';

const FornecedoresActions = ({ onExport, canCreate, onAddNew }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="flex-1">
        {canCreate && (
          <Button
            onClick={onAddNew}
            className="w-full sm:w-auto"
            variant="primary"
          >
            Novo Fornecedor
          </Button>
        )}
      </div>
      
      <div className="flex gap-2">
        <Button
          onClick={() => onExport('xlsx')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FaFileExcel className="text-green-600" />
          Exportar XLSX
        </Button>
        
        <Button
          onClick={() => onExport('pdf')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FaFilePdf className="text-red-600" />
          Exportar PDF
        </Button>
      </div>
    </div>
  );
};

export default FornecedoresActions;
