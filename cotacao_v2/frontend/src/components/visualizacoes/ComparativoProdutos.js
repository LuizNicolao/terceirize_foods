import React from 'react';
import { FaChartBar, FaDollarSign, FaTruck, FaCreditCard, FaTrophy } from 'react-icons/fa';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

const ComparativoProdutos = ({ cotacao, active }) => {
  if (!active || !cotacao) return null;

  const calcularComparativo = () => {
    if (!cotacao.fornecedores) return null;

    const produtosComparativo = {};
    let totalProdutos = 0;
    let totalFornecedores = 0;

    // Agrupar produtos por ID
    cotacao.fornecedores.forEach(fornecedor => {
      totalFornecedores++;
      if (fornecedor.produtos) {
        fornecedor.produtos.forEach(produto => {
          const produtoId = produto.produto_id || produto.nome;
          const valorUnitario = parseFloat(produto.valor_unitario) || 0;
          const quantidade = parseFloat(produto.qtde) || 0;
          const prazoEntrega = parseFloat(produto.prazo_entrega) || 0;
          const prazoPagamento = parseFloat(produto.prazo_pagamento) || 0;

          if (!produtosComparativo[produtoId]) {
            produtosComparativo[produtoId] = {
              nome: produto.nome,
              fornecedores: [],
              melhorPreco: valorUnitario,
              melhorPrazoEntrega: prazoEntrega,
              melhorPrazoPagamento: prazoPagamento,
              piorPreco: valorUnitario,
              piorPrazoEntrega: prazoEntrega,
              piorPrazoPagamento: prazoPagamento,
              precoMedio: valorUnitario,
              prazoEntregaMedio: prazoEntrega,
              prazoPagamentoMedio: prazoPagamento,
              quantidade: quantidade,
              count: 1
            };
          }

          produtosComparativo[produtoId].fornecedores.push({
            nome: fornecedor.nome,
            valorUnitario,
            prazoEntrega,
            prazoPagamento,
            quantidade
          });

          // Atualizar estatísticas
          const produto = produtosComparativo[produtoId];
          produto.precoMedio = (produto.precoMedio * produto.count + valorUnitario) / (produto.count + 1);
          produto.prazoEntregaMedio = (produto.prazoEntregaMedio * produto.count + prazoEntrega) / (produto.count + 1);
          produto.prazoPagamentoMedio = (produto.prazoPagamentoMedio * produto.count + prazoPagamento) / (produto.count + 1);
          produto.count++;

          if (valorUnitario < produto.melhorPreco) {
            produto.melhorPreco = valorUnitario;
          }
          if (valorUnitario > produto.piorPreco) {
            produto.piorPreco = valorUnitario;
          }
          if (prazoEntrega < produto.melhorPrazoEntrega) {
            produto.melhorPrazoEntrega = prazoEntrega;
          }
          if (prazoEntrega > produto.piorPrazoEntrega) {
            produto.piorPrazoEntrega = prazoEntrega;
          }
          if (prazoPagamento > produto.melhorPrazoPagamento) {
            produto.melhorPrazoPagamento = prazoPagamento;
          }
          if (prazoPagamento < produto.piorPrazoPagamento) {
            produto.piorPrazoPagamento = prazoPagamento;
          }
        });
        totalProdutos += fornecedor.produtos.length;
      }
    });

    return {
      produtosComparativo,
      totalProdutos,
      totalFornecedores
    };
  };

  const analise = calcularComparativo();

  if (!analise) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaChartBar />
          Comparativo de Produtos
        </h3>
        <p className="text-gray-500">Nenhum dado disponível para análise</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <FaChartBar />
        Comparativo de Produtos
      </h3>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {Object.keys(analise.produtosComparativo).length}
          </div>
          <div className="text-sm text-blue-700">Produtos Únicos</div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {analise.totalFornecedores}
          </div>
          <div className="text-sm text-green-700">Fornecedores</div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {analise.totalProdutos}
          </div>
          <div className="text-sm text-purple-700">Total de Itens</div>
        </div>
      </div>

      {/* Tabela de Comparativo */}
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
                Pior Preço
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preço Médio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Variação
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Melhor Entrega
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Melhor Pagamento
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(analise.produtosComparativo).map(([produtoId, produto], index) => {
              const variacao = produto.piorPreco > 0 ? ((produto.piorPreco - produto.melhorPreco) / produto.piorPreco * 100) : 0;
              
              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {produto.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                    {formatCurrency(produto.melhorPreco)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                    {formatCurrency(produto.piorPreco)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(produto.precoMedio)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${variacao > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                      {formatPercentage(variacao)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <FaTruck className="text-blue-500" />
                      <span className="font-medium text-blue-600">
                        {produto.melhorPrazoEntrega} dias
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <FaCreditCard className="text-purple-500" />
                      <span className="font-medium text-purple-600">
                        {produto.melhorPrazoPagamento} dias
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detalhes por Produto */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <FaChartBar />
          Detalhes por Produto
        </h4>
        
        <div className="space-y-4">
          {Object.entries(analise.produtosComparativo).map(([produtoId, produto], index) => (
            <div key={index} className="bg-white p-4 rounded-lg border">
              <h5 className="font-medium text-gray-900 mb-3">{produto.nome}</h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Preços */}
                <div>
                  <h6 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaDollarSign />
                    Análise de Preços
                  </h6>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Melhor:</span>
                      <span className="font-medium text-green-600">{formatCurrency(produto.melhorPreco)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pior:</span>
                      <span className="font-medium text-red-600">{formatCurrency(produto.piorPreco)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Médio:</span>
                      <span className="font-medium">{formatCurrency(produto.precoMedio)}</span>
                    </div>
                  </div>
                </div>

                {/* Prazos de Entrega */}
                <div>
                  <h6 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaTruck />
                    Prazos de Entrega
                  </h6>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Melhor:</span>
                      <span className="font-medium text-blue-600">{produto.melhorPrazoEntrega} dias</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pior:</span>
                      <span className="font-medium text-red-600">{produto.piorPrazoEntrega} dias</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Médio:</span>
                      <span className="font-medium">{produto.prazoEntregaMedio.toFixed(1)} dias</span>
                    </div>
                  </div>
                </div>

                {/* Prazos de Pagamento */}
                <div>
                  <h6 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaCreditCard />
                    Prazos de Pagamento
                  </h6>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Melhor:</span>
                      <span className="font-medium text-purple-600">{produto.melhorPrazoPagamento} dias</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pior:</span>
                      <span className="font-medium text-red-600">{produto.piorPrazoPagamento} dias</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Médio:</span>
                      <span className="font-medium">{produto.prazoPagamentoMedio.toFixed(1)} dias</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fornecedores */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <h6 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FaTrophy />
                  Fornecedores ({produto.fornecedores.length})
                </h6>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {produto.fornecedores.map((fornecedor, idx) => (
                    <div key={idx} className="bg-gray-50 p-2 rounded text-xs">
                      <div className="font-medium text-gray-900">{fornecedor.nome}</div>
                      <div className="text-gray-600">
                        {formatCurrency(fornecedor.valorUnitario)} | {fornecedor.prazoEntrega}d | {fornecedor.prazoPagamento}d
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComparativoProdutos; 