import React from 'react';
import { FaCalculator, FaEdit, FaCheck } from 'react-icons/fa';
import { Input } from '../ui';

const NecessidadesTable = ({ 
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
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Per Capita
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Média Período
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Frequência
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ajuste
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantidade Final
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {produtos.map((produto) => (
              <tr key={produto.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {produto.nome}
                  </div>
                  {produto.grupo && (
                    <div className="text-sm text-gray-500">
                      {produto.grupo}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                  {formatNumber(produto.per_capita)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                  {formatNumber(produto.media_periodo)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="max-w-[100px] mx-auto">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={produto.frequencia || 0}
                      onChange={(e) => handleFrequenciaChange(produto.id, e.target.value)}
                      disabled={loading}
                      className="text-center"
                      size="sm"
                    />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="max-w-[100px] mx-auto">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={produto.ajuste || 0}
                      onChange={(e) => handleAjusteChange(produto.id, e.target.value)}
                      disabled={loading}
                      className="text-center"
                      size="sm"
                    />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center">
                    <span className="text-sm font-semibold text-green-600">
                      {formatNumber(produto.quantidade_final)}
                    </span>
                    <FaCheck className="ml-2 w-4 h-4 text-green-500" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resumo */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Total de produtos: <span className="font-medium">{produtos.length}</span>
          </div>
          <div className="text-sm text-gray-600">
            Quantidade total: <span className="font-medium text-green-600">
              {formatNumber(produtos.reduce((total, produto) => total + (produto.quantidade_final || 0), 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NecessidadesTable;
