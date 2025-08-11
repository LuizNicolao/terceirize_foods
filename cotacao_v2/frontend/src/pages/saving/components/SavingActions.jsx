import React from 'react';
import { FaFileExport, FaDownload } from 'react-icons/fa';

const SavingActions = ({ exportarDados }) => {
  const handleExportXLSX = () => {
    exportarDados('xlsx');
  };

  const handleExportCSV = () => {
    exportarDados('csv');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Ações
          </h3>
          <p className="text-sm text-gray-600">
            Exporte os dados de saving em diferentes formatos
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExportXLSX}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            <FaFileExport className="mr-2" />
            Exportar XLSX
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <FaDownload className="mr-2" />
            Exportar CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavingActions;
