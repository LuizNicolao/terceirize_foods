import React from 'react';
import { FaTag, FaDollarSign, FaChartLine, FaTrophy } from 'react-icons/fa';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

const MelhorPreco = ({ cotacao, active }) => {
  if (!active || !cotacao) return null;

  const calcularMelhorPreco = () => {
    if (!cotacao.fornecedores) return null;

    const produtosMelhorPreco = {};
    let valorTotalMelhorPreco = 0;
    let valorTotalMedio = 0;

    // Calcular melhor preço por produto
    cotacao.fornecedores.forEach(fornecedor => {
      if (fornecedor.produtos) {
        fornecedor.produtos.forEach(produto => {
          const produtoId = produto.produto_id || produto.nome;
          const valorUnitario = parseFloat(produto.valor_unitario) || 0;
          const quantidade = parseFloat(produto.qtde) || 0;

          if (!produtosMelhorPreco[produtoId]) {
            produtosMelhorPreco[produtoId] = {
              melhorPreco: valorUnitario,
              precoMedio: valorUnitario,
              quantidade: quantidade,
              count: 1,
              melhorFornecedor: fornecedor.nome
            };
          } else {
            produtosMelhorPreco[produtoId].precoMedio += valorUnitario;
            produtosMelhorPreco[produtoId].count += 1;
            if (valorUnitario < produtosMelhorPreco[produtoId].melhorPreco) {
              produtosMelhorPreco[produtoId].melhorPreco = valorUnitario;
              produtosMelhorPreco[produtoId].melhorFornecedor = fornecedor.nome;
            }
          }
        });
      }
    });

    // Calcular totais
    Object.values(produtosMelhorPreco).forEach(produto => {
      produto.precoMedio = produto.precoMedio / produto.count;
      valorTotalMelhorPreco += produto.melhorPreco * produto.quantidade;
      valorTotalMedio += produto.precoMedio * produto.quantidade;
    });

    const economia = valorTotalMedio - valorTotalMelhorPreco;
    const economiaPercentual = valorTotalMedio > 0 ? (economia / valorTotalMedio * 100) : 0;

    return {
      produtosMelhorPreco,
      valorTotalMelhorPreco,
      valorTotalMedio,
      economia,
      economiaPercentual
    };
  };

  const analise = calcularMelhorPreco();

  if (!analise) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaTag />
          Melhor Preço
        </h3>
        <p className="text-gray-500">Nenhum dado disponível para análise</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <FaTag />
        Análise de Melhor Preço
      </h3>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(analise.economia)}
          </div>
          <div className="text-sm text-green-700">Economia Total</div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {formatPercentage(analise.economiaPercentual)}
          </div>
          <div className="text-sm text-purple-700">Redução Percentual</div>
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Melhor Preço
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preço Médio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Economia
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Redução
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Melhor Fornecedor
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(analise.produtosMelhorPreco).map(([produtoId, produto], index) => {
              const economia = produto.precoMedio - produto.melhorPreco;
              const reducao = produto.precoMedio > 0 ? (economia / produto.precoMedio * 100) : 0;
              
              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {produtoId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                    {formatCurrency(produto.melhorPreco)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(produto.precoMedio)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                    {formatCurrency(economia)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${reducao > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                      {formatPercentage(reducao)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <FaTrophy className="text-yellow-500" />
                      {produto.melhorFornecedor}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Gráfico de Economia */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <FaChartLine />
          Resumo da Economia
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600 mb-2">Economia por Produto</div>
            <div className="space-y-2">
              {Object.entries(analise.produtosMelhorPreco).map(([produtoId, produto], index) => {
                const economia = produto.precoMedio - produto.melhorPreco;
                const reducao = produto.precoMedio > 0 ? (economia / produto.precoMedio * 100) : 0;
                
                return (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 truncate">{produtoId}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(economia)}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({formatPercentage(reducao)})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600 mb-2">Recomendações</div>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <FaTrophy className="text-yellow-500 mt-1" />
                <span>Selecione o fornecedor com melhor preço para cada produto</span>
              </div>
              <div className="flex items-start gap-2">
                <FaDollarSign className="text-green-500 mt-1" />
                <span>Economia potencial de {formatCurrency(analise.economia)} ({formatPercentage(analise.economiaPercentual)})</span>
              </div>
              <div className="flex items-start gap-2">
                <FaChartLine className="text-blue-500 mt-1" />
                <span>Compare preços antes de finalizar a cotação</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MelhorPreco; 