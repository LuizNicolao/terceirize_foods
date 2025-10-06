import React from 'react';
import { FaCalculator, FaEdit, FaCheck } from 'react-icons/fa';

const TabelaProdutosNecessidade = ({ 
  produtos, 
  onFrequenciaChange, 
  onAjusteChange, 
  loading = false 
}) => {
  const formatNumber = (num) => {
    if (typeof num !== 'number' || isNaN(num)) {
      return '0,00';
    }
    return num.toFixed(2).replace('.', ',');
  };

  const handleFrequenciaChange = (produtoId, value) => {
    const frequencia = parseFloat(value) || 0;
    onFrequenciaChange(produtoId, frequencia);
  };

  const handleAjusteChange = (produtoId, value) => {
    const ajuste = parseFloat(value) || 0;
    onAjusteChange(produtoId, ajuste);
  };

  if (produtos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <FaCalculator className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum produto selecionado
        </h3>
        <p className="text-gray-600">
          Selecione uma escola e grupo para carregar os produtos disponíveis.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FaCalculator className="mr-2 text-green-600" />
          Produtos e Cálculos
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Ajuste as frequências e confirme as quantidades finais
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Percapta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Frequência
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ajuste (Pedido)
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Média por Período
              </th>
            </tr>
            <tr>
              <th className="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {/* Produto */}
              </th>
              <th className="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {/* Percapta */}
              </th>
              <th className="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {/* Frequência */}
              </th>
              <th className="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {/* Total */}
              </th>
              <th className="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {/* Ajuste */}
              </th>
              <th className="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200">
                Almoço
              </th>
              <th className="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parcial
              </th>
              <th className="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lanche
              </th>
              <th className="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                EJA
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {produtos.map((produto) => (
              <tr key={produto.id} className="hover:bg-gray-50">
                {/* Produto */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {produto.nome}
                  </div>
                </td>

                {/* Percapta */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-mono">
                    {formatNumber(produto.percapita)}
                  </div>
                </td>

                {/* Frequência */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={produto.frequencia}
                      onChange={(e) => handleFrequenciaChange(produto.id, e.target.value)}
                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      disabled={loading}
                    />
                    <FaEdit className="ml-2 h-3 w-3 text-gray-400" />
                  </div>
                </td>

                {/* Total */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-mono bg-blue-50 px-2 py-1 rounded">
                    {formatNumber(produto.total)}
                  </div>
                </td>

                {/* Ajuste (Pedido) */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={produto.ajuste}
                      onChange={(e) => handleAjusteChange(produto.id, e.target.value)}
                      className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      disabled={loading}
                    />
                    <FaCheck className="ml-2 h-3 w-3 text-green-500" />
                  </div>
                </td>

                {/* Médias por Período */}
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 font-mono bg-orange-50">
                  {formatNumber(produto.medias.almoco)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 font-mono bg-orange-50">
                  {formatNumber(produto.medias.parcial)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 font-mono bg-orange-50">
                  {formatNumber(produto.medias.lanche)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 font-mono bg-orange-50">
                  {formatNumber(produto.medias.eja)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resumo dos totais */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-500">Total de Produtos</div>
            <div className="text-lg font-semibold text-gray-900">{produtos.length}</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-500">Soma dos Totais</div>
            <div className="text-lg font-semibold text-blue-600">
              {formatNumber(produtos.reduce((sum, p) => sum + p.total, 0))}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-500">Soma dos Ajustes</div>
            <div className="text-lg font-semibold text-green-600">
              {formatNumber(produtos.reduce((sum, p) => sum + p.ajuste, 0))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabelaProdutosNecessidade;
