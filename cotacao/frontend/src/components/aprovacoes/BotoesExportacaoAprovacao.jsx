import React from 'react';
import { FaFilePdf, FaFileExcel, FaDownload } from 'react-icons/fa';

const BotoesExportacaoAprovacao = ({ 
  viewMode, 
  cotacao, 
  onExportPDF, 
  onExportExcel, 
  exporting 
}) => {
  const viewModeLabels = {
    'padrao': 'Visualização Padrão',
    'resumo': 'Resumo Comparativo',
    'melhor-preco': 'Melhor Preço',
    'melhor-entrega': 'Melhor Prazo Entrega',
    'melhor-pagamento': 'Melhor Prazo Pagamento',
    'comparativo': 'Comparativo Produtos'
  };

  const handleExportPDF = () => {
    if (onExportPDF) {
      onExportPDF(viewMode, cotacao);
    }
  };

  const handleExportExcel = () => {
    if (onExportExcel) {
      onExportExcel(viewMode, cotacao);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Exportar Dados</h3>
          <p className="text-sm text-gray-600">
            Visualização atual: {viewModeLabels[viewMode] || viewMode}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <FaFilePdf size={14} />
            {exporting ? 'Exportando...' : 'PDF'}
          </button>
          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <FaFileExcel size={14} />
            {exporting ? 'Exportando...' : 'Excel'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BotoesExportacaoAprovacao;
