import React from 'react';
import { FaList, FaChartBar, FaDollarSign, FaTruck, FaCreditCard, FaChartPie } from 'react-icons/fa';

const BotoesVisualizacaoAprovacao = ({ viewMode, setViewMode }) => {
  const visualizacoes = [
    { id: 'padrao', label: 'Visualização Padrão', icon: FaList },
    { id: 'resumo', label: 'Resumo Comparativo', icon: FaChartBar },
    { id: 'melhor-preco', label: 'Melhor Preço', icon: FaDollarSign },
    { id: 'melhor-entrega', label: 'Melhor Prazo Entrega', icon: FaTruck },
    { id: 'melhor-pagamento', label: 'Melhor Prazo Pagamento', icon: FaCreditCard },
    { id: 'comparativo', label: 'Comparativo Produtos', icon: FaChartPie }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Modos de Visualização</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {visualizacoes.map((visualizacao) => (
          <button
            key={visualizacao.id}
            onClick={() => setViewMode(visualizacao.id)}
            className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
              viewMode === visualizacao.id
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <visualizacao.icon size={16} />
            <span className="text-xs text-center">{visualizacao.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BotoesVisualizacaoAprovacao;
