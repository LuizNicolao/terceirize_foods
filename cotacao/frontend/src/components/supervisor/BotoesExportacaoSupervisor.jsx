import React from 'react';
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';

const BotoesExportacaoSupervisor = ({ viewMode, cotacao, formatarValor, onExportPDF, onExportExcel }) => {
  const getViewModeLabel = () => {
    const labels = {
      'padrao': 'Visualização Padrão',
      'resumo': 'Resumo Comparativo',
      'melhor-preco': 'Melhor Preço',
      'melhor-entrega': 'Melhor Prazo de Entrega',
      'melhor-pagamento': 'Melhor Prazo de Pagamento',
      'comparativo': 'Comparativo de Produtos'
    };
    return labels[viewMode] || 'Análise';
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
    <div className="flex justify-end gap-2 mb-4">
      <button
        onClick={handleExportPDF}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
        title={`Exportar ${getViewModeLabel()} em PDF`}
      >
        <FaFilePdf className="w-4 h-4" />
        PDF
      </button>
      <button
        onClick={handleExportExcel}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        title={`Exportar ${getViewModeLabel()} em Excel`}
      >
        <FaFileExcel className="w-4 h-4" />
        Excel
      </button>
    </div>
  );
};

export default BotoesExportacaoSupervisor;
