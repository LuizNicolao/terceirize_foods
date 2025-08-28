import React from 'react';
import { 
  FaList, 
  FaChartBar, 
  FaTag, 
  FaTruck, 
  FaCreditCard 
} from 'react-icons/fa';

const BotoesVisualizacaoSupervisor = ({ viewMode, setViewMode }) => {
  const visualizacoes = [
    { id: 'padrao', label: 'Visualização Padrão', icon: FaList },
    { id: 'resumo', label: 'Resumo Comparativo', icon: FaChartBar },
    { id: 'melhor-preco', label: 'Melhor Preço', icon: FaTag },
    { id: 'melhor-entrega', label: 'Melhor Prazo de Entrega', icon: FaTruck },
    { id: 'melhor-pagamento', label: 'Melhor Prazo de Pagamento', icon: FaCreditCard },
    { id: 'comparativo', label: 'Comparativo de Produtos', icon: FaChartBar }
  ];

  return (
    <div className="flex justify-center gap-2 mb-6 flex-wrap">
      {visualizacoes.map((visualizacao, index) => {
        const Icon = visualizacao.icon;
        const isActive = viewMode === visualizacao.id;
        
        return (
          <button
            key={visualizacao.id}
            onClick={() => setViewMode(visualizacao.id)}
            className={`px-4 py-3 border-2 border-gray-200 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300 flex items-center gap-2 ${
              isActive 
                ? 'bg-green-600 text-white border-green-600 hover:bg-green-700' 
                : 'bg-white text-gray-700 hover:bg-gray-50 hover:border-green-600'
            } ${
              index === 0 ? 'rounded-l-lg' : ''
            } ${
              index === visualizacoes.length - 1 ? 'rounded-r-lg' : ''
            }`}
          >
            <Icon />
            {visualizacao.label}
          </button>
        );
      })}
    </div>
  );
};

export default BotoesVisualizacaoSupervisor;
