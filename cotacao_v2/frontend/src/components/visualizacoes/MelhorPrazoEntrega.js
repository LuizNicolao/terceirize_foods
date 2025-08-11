import React from 'react';
import { FaTruck, FaClock, FaChartLine, FaTrophy } from 'react-icons/fa';
import { formatCurrency } from '../../utils/formatters';

const MelhorPrazoEntrega = ({ cotacao, active }) => {
  if (!active || !cotacao) return null;

  const calcularMelhorPrazoEntrega = () => {
    if (!cotacao.fornecedores) return null;

    const produtosMelhorPrazo = {};
    let valorTotalMelhorPrazo = 0;
    let valorTotalMedio = 0;
    let prazoMedioTotal = 0;
    let prazoMelhorTotal = 0;

    // Calcular melhor prazo por produto
    cotacao.fornecedores.forEach(fornecedor => {
      if (fornecedor.produtos) {
        fornecedor.produtos.forEach(produto => {
          const produtoId = produto.produto_id || produto.nome;
          const valorUnitario = parseFloat(produto.valor_unitario) || 0;
          const quantidade = parseFloat(produto.qtde) || 0;
          const prazoEntrega = parseFloat(produto.prazo_entrega) || 999;

          if (!produtosMelhorPrazo[produtoId]) {
            produtosMelhorPrazo[produtoId] = {
              melhorPrazo: prazoEntrega,
              precoMelhorPrazo: valorUnitario,
              precoMedio: valorUnitario,
              quantidade: quantidade,
              count: 1,
              melhorFornecedor: fornecedor.nome,
              prazoMedio: prazoEntrega
            };
          } else {
            produtosMelhorPrazo[produtoId].precoMedio += valorUnitario;
            produtosMelhorPrazo[produtoId].prazoMedio += prazoEntrega;
            produtosMelhorPrazo[produtoId].count += 1;
            if (prazoEntrega < produtosMelhorPrazo[produtoId].melhorPrazo) {
              produtosMelhorPrazo[produtoId].melhorPrazo = prazoEntrega;
              produtosMelhorPrazo[produtoId].precoMelhorPrazo = valorUnitario;
              produtosMelhorPrazo[produtoId].melhorFornecedor = fornecedor.nome;
            }
          }
        });
      }
    });

    // Calcular totais
    Object.values(produtosMelhorPrazo).forEach(produto => {
      produto.precoMedio = produto.precoMedio / produto.count;
      produto.prazoMedio = produto.prazoMedio / produto.count;
      
      valorTotalMelhorPrazo += produto.precoMelhorPrazo * produto.quantidade;
      valorTotalMedio += produto.precoMedio * produto.quantidade;
      prazoMelhorTotal += produto.melhorPrazo;
      prazoMedioTotal += produto.prazoMedio;
    });

    const economia = valorTotalMedio - valorTotalMelhorPrazo;
    const economiaPercentual = valorTotalMedio > 0 ? (economia / valorTotalMedio * 100) : 0;
    const prazoMedio = prazoMedioTotal / Object.keys(produtosMelhorPrazo).length;
    const prazoMelhor = prazoMelhorTotal / Object.keys(produtosMelhorPrazo).length;

    return {
      produtosMelhorPrazo,
      valorTotalMelhorPrazo,
      valorTotalMedio,
      economia,
      economiaPercentual,
      prazoMedio,
      prazoMelhor
    };
  };

  const analise = calcularMelhorPrazoEntrega();

  if (!analise) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaTruck />
          Melhor Prazo de Entrega
        </h3>
        <p className="text-gray-500">Nenhum dado disponível para análise</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <FaTruck />
        Análise de Melhor Prazo de Entrega
      </h3>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {analise.prazoMelhor.toFixed(1)} dias
          </div>
          <div className="text-sm text-blue-700">Prazo Médio Melhor</div>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">
            {analise.prazoMedio.toFixed(1)} dias
          </div>
          <div className="text-sm text-gray-700">Prazo Médio Geral</div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(analise.valorTotalMelhorPrazo)}
          </div>
          <div className="text-sm text-green-700">Valor Total</div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {formatCurrency(analise.economia)}
          </div>
          <div className="text-sm text-purple-700">Economia vs Média</div>
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
                Melhor Prazo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prazo Médio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Economia
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Melhor Fornecedor
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(analise.produtosMelhorPrazo).map(([produtoId, produto], index) => {
              const economia = produto.precoMedio - produto.precoMelhorPrazo;
              const reducaoPrazo = produto.prazoMedio - produto.melhorPrazo;
              
              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {produtoId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <FaTruck className="text-blue-500" />
                      <span className="font-medium text-blue-600">
                        {produto.melhorPrazo} dias
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {produto.prazoMedio.toFixed(1)} dias
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(produto.precoMelhorPrazo)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${economia > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                      {formatCurrency(economia)}
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

      {/* Análise Detalhada */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <FaChartLine />
          Análise Detalhada
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600 mb-2">Comparação de Prazos</div>
            <div className="space-y-2">
              {Object.entries(analise.produtosMelhorPrazo).map(([produtoId, produto], index) => {
                const reducaoPrazo = produto.prazoMedio - produto.melhorPrazo;
                
                return (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 truncate">{produtoId}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-blue-600">
                        {produto.melhorPrazo} dias
                      </span>
                      <span className="text-xs text-gray-500">
                        (vs {produto.prazoMedio.toFixed(1)} dias)
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
                <FaTruck className="text-blue-500 mt-1" />
                <span>Priorize fornecedores com prazos menores</span>
              </div>
              <div className="flex items-start gap-2">
                <FaClock className="text-yellow-500 mt-1" />
                <span>Prazo médio reduzido de {analise.prazoMedio.toFixed(1)} para {analise.prazoMelhor.toFixed(1)} dias</span>
              </div>
              <div className="flex items-start gap-2">
                <FaTrophy className="text-green-500 mt-1" />
                <span>Economia adicional de {formatCurrency(analise.economia)} vs preço médio</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MelhorPrazoEntrega; 