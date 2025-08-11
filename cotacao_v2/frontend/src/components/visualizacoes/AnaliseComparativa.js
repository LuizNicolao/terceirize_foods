import React from 'react';
import { FaChartLine, FaDollarSign, FaHistory, FaCalculator, FaTrendingUp, FaTrendingDown } from 'react-icons/fa';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

const AnaliseComparativa = ({ cotacao, active, analise }) => {
  if (!active || !cotacao) return null;

  if (!analise) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaChartLine />
          Análise Comparativa
        </h3>
        <p className="text-gray-500">Nenhum dado disponível para análise</p>
      </div>
    );
  }

  const getVariationColor = (value) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getVariationIcon = (value) => {
    if (value > 0) return <FaTrendingUp className="text-green-500" />;
    if (value < 0) return <FaTrendingDown className="text-red-500" />;
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <FaChartLine />
        Análise Comparativa
      </h3>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(analise.valorTotalMelhorPreco)}
          </div>
          <div className="text-sm text-green-700">Melhor Preço Total</div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(analise.valorTotalMedio)}
          </div>
          <div className="text-sm text-blue-700">Preço Médio Total</div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {formatCurrency(analise.economia)}
          </div>
          <div className="text-sm text-purple-700">Economia Total</div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {formatPercentage(analise.economiaPercentual)}
          </div>
          <div className="text-sm text-yellow-700">Redução Percentual</div>
        </div>
      </div>

      {/* Análise Detalhada */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Comparação de Valores */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <FaDollarSign />
            Comparação de Valores
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-white p-3 rounded border">
              <span className="text-sm text-gray-600">Melhor Preço vs Médio:</span>
              <div className="flex items-center gap-2">
                {getVariationIcon(analise.economia)}
                <span className={`font-medium ${getVariationColor(analise.economia)}`}>
                  {formatCurrency(analise.economia)}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center bg-white p-3 rounded border">
              <span className="text-sm text-gray-600">Redução Percentual:</span>
              <div className="flex items-center gap-2">
                {getVariationIcon(analise.economiaPercentual)}
                <span className={`font-medium ${getVariationColor(analise.economiaPercentual)}`}>
                  {formatPercentage(analise.economiaPercentual)}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center bg-white p-3 rounded border">
              <span className="text-sm text-gray-600">Valor Total:</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(analise.valorTotalMelhorPreco)}
              </span>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <FaCalculator />
            Estatísticas
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-white p-3 rounded border">
              <span className="text-sm text-gray-600">Total de Produtos:</span>
              <span className="font-medium text-gray-900">
                {analise.estatisticas?.totalProdutos || 0}
              </span>
            </div>
            
            <div className="flex justify-between items-center bg-white p-3 rounded border">
              <span className="text-sm text-gray-600">Total de Fornecedores:</span>
              <span className="font-medium text-gray-900">
                {analise.estatisticas?.totalFornecedores || 0}
              </span>
            </div>
            
            <div className="flex justify-between items-center bg-white p-3 rounded border">
              <span className="text-sm text-gray-600">Quantidade Total:</span>
              <span className="font-medium text-gray-900">
                {(analise.estatisticas?.totalQuantidade || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Economia */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <FaChartLine />
          Análise de Economia
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {formatCurrency(analise.economia)}
              </div>
              <div className="text-sm text-gray-600">Economia Realizada</div>
              <div className="text-xs text-gray-500 mt-1">
                vs Preço Médio
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {formatPercentage(analise.economiaPercentual)}
              </div>
              <div className="text-sm text-gray-600">Redução Percentual</div>
              <div className="text-xs text-gray-500 mt-1">
                vs Preço Médio
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {formatCurrency(analise.valorTotalMelhorPreco)}
              </div>
              <div className="text-sm text-gray-600">Valor Final</div>
              <div className="text-xs text-gray-500 mt-1">
                Melhor Preço Total
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recomendações */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <FaTrendingUp />
          Recomendações
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <FaDollarSign className="text-green-500 mt-1" />
              <span className="text-sm">Selecione o fornecedor com melhor preço para cada produto</span>
            </div>
            <div className="flex items-start gap-2">
              <FaChartLine className="text-blue-500 mt-1" />
              <span className="text-sm">Economia potencial de {formatCurrency(analise.economia)} ({formatPercentage(analise.economiaPercentual)})</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <FaHistory className="text-purple-500 mt-1" />
              <span className="text-sm">Compare com valores históricos antes de finalizar</span>
            </div>
            <div className="flex items-start gap-2">
              <FaCalculator className="text-yellow-500 mt-1" />
              <span className="text-sm">Considere prazos de entrega e pagamento na decisão</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnaliseComparativa; 