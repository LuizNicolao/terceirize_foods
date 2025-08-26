import React from 'react';

const AnaliseComparativa = ({ cotacao, active, formatarValor, analise }) => {
  if (!active || !cotacao?.itens) {
    return null;
  }

  // Calcular melhor preço, melhor prazo entrega e melhor prazo pagamento por produto
  const produtosComparacao = {};
  
  cotacao.itens.forEach(item => {
    const produtoId = item.produto_id || item.produto_nome;
    const valorUnitario = parseFloat(item.valor_unitario) || 0;
    const quantidade = parseFloat(item.quantidade) || 0;
    
    // Extrair prazo de entrega (menor é melhor)
    const prazoEntregaStr = item.prazo_entrega || '';
    const prazoEntrega = parseInt(prazoEntregaStr.match(/\d+/)?.[0]) || 999;
    
    // Extrair prazo de pagamento (maior é melhor)
    const prazoPagamentoStr = item.prazo_pagamento || '';
    const prazoPagamento = parseInt(prazoPagamentoStr.match(/\d+/)?.[0]) || 0;

    if (!produtosComparacao[produtoId]) {
      produtosComparacao[produtoId] = {
        nome: item.produto_nome,
        quantidade: quantidade,
        unidade: item.unidade_medida,
        melhorPreco: {
          valor: valorUnitario,
          fornecedor: item.fornecedor_nome
        },
        melhorPrazoEntrega: {
          prazo: prazoEntrega,
          fornecedor: item.fornecedor_nome,
          prazoStr: item.prazo_entrega
        },
        melhorPrazoPagamento: {
          prazo: prazoPagamento,
          fornecedor: item.fornecedor_nome,
          prazoStr: item.prazo_pagamento
        }
      };
    } else {
      // Atualizar melhor preço
      if (valorUnitario < produtosComparacao[produtoId].melhorPreco.valor) {
        produtosComparacao[produtoId].melhorPreco = {
          valor: valorUnitario,
          fornecedor: item.fornecedor_nome
        };
      }
      
      // Atualizar melhor prazo de entrega (menor é melhor)
      if (prazoEntrega < produtosComparacao[produtoId].melhorPrazoEntrega.prazo) {
        produtosComparacao[produtoId].melhorPrazoEntrega = {
          prazo: prazoEntrega,
          fornecedor: item.fornecedor_nome,
          prazoStr: item.prazo_entrega
        };
      }
      
      // Atualizar melhor prazo de pagamento (maior é melhor)
      if (prazoPagamento > produtosComparacao[produtoId].melhorPrazoPagamento.prazo) {
        produtosComparacao[produtoId].melhorPrazoPagamento = {
          prazo: prazoPagamento,
          fornecedor: item.fornecedor_nome,
          prazoStr: item.prazo_pagamento
        };
      }
    }
  });

  const produtos = Object.values(produtosComparacao);

  // Calcular valores totais para os cards de resumo
  let valorTotalMelhorPreco = 0;
  let valorTotalMelhorEntrega = 0;
  let valorTotalMelhorPagamento = 0;
  let valorTotalUltimoAprovado = 0;
  let economiaTotal = 0;

  produtos.forEach(produto => {
    valorTotalMelhorPreco += produto.melhorPreco.valor * produto.quantidade;
    
    // Buscar valores dos itens com melhor prazo de entrega e pagamento
    const itemMelhorEntrega = cotacao.itens.find(item => 
      (item.produto_id === produto.id || item.produto_nome === produto.nome) && 
      item.fornecedor_nome === produto.melhorPrazoEntrega.fornecedor
    );
    const itemMelhorPagamento = cotacao.itens.find(item => 
      (item.produto_id === produto.id || item.produto_nome === produto.nome) && 
      item.fornecedor_nome === produto.melhorPrazoPagamento.fornecedor
    );
    
    if (itemMelhorEntrega) {
      valorTotalMelhorEntrega += parseFloat(itemMelhorEntrega.valor_unitario) * produto.quantidade;
    }
    if (itemMelhorPagamento) {
      valorTotalMelhorPagamento += parseFloat(itemMelhorPagamento.valor_unitario) * produto.quantidade;
    }
    
    // Buscar último valor aprovado do item correspondente
    const itemCorrespondente = cotacao.itens.find(item => 
      (item.produto_id === produto.id || item.produto_nome === produto.nome) && 
      item.ult_valor_aprovado
    );
    if (itemCorrespondente) {
      valorTotalUltimoAprovado += parseFloat(itemCorrespondente.ult_valor_aprovado) * produto.quantidade;
    }
  });

  economiaTotal = valorTotalUltimoAprovado - valorTotalMelhorPreco;
  const economiaPercentual = valorTotalUltimoAprovado > 0 ? (economiaTotal / valorTotalUltimoAprovado * 100) : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Comparativo</h3>
      
      {/* Cards de Resumo Econômico */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <span>💰</span>
              Melhor Preço
            </h4>
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {formatarValor ? formatarValor(valorTotalMelhorPreco) : `R$ ${valorTotalMelhorPreco.toFixed(2)}`}
            </div>
            <div className="text-xs text-blue-700">
              {produtos.length} itens
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
              <span>🚚</span>
              Melhor Entrega
            </h4>
            <div className="text-2xl font-bold text-green-600 mb-1">
              {formatarValor ? formatarValor(valorTotalMelhorEntrega) : `R$ ${valorTotalMelhorEntrega.toFixed(2)}`}
            </div>
            <div className="text-xs text-green-700">
              {produtos.length} itens
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-purple-800 mb-2 flex items-center gap-2">
              <span>💳</span>
              Melhor Pagamento
            </h4>
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {formatarValor ? formatarValor(valorTotalMelhorPagamento) : `R$ ${valorTotalMelhorPagamento.toFixed(2)}`}
            </div>
            <div className="text-xs text-purple-700">
              {produtos.length} itens
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-orange-800 mb-2 flex items-center gap-2">
              <span>📈</span>
              Economia vs Últ. Aprovado
            </h4>
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {formatarValor ? formatarValor(economiaTotal) : `R$ ${economiaTotal.toFixed(2)}`}
            </div>
            <div className="text-xs text-orange-700">
              {economiaPercentual.toFixed(1)}% de economia
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qtd</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Un</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase" colSpan="2">Melhor Preço</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase" colSpan="2">Melhor Prazo Entrega</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase" colSpan="2">Melhor Prazo Pagamento</th>
            </tr>
            <tr>
              <th></th>
              <th></th>
              <th></th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fornecedor</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prazo</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fornecedor</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prazo</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fornecedor</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {produtos.map((produto, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {produto.nome}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {produto.quantidade}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {produto.unidade}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-green-600">
                  {formatarValor ? formatarValor(produto.melhorPreco.valor) : `R$ ${produto.melhorPreco.valor || 0}`}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {produto.melhorPreco.fornecedor}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-blue-600">
                  {produto.melhorPrazoEntrega.prazoStr || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {produto.melhorPrazoEntrega.fornecedor}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-purple-600">
                  {produto.melhorPrazoPagamento.prazoStr || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {produto.melhorPrazoPagamento.fornecedor}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnaliseComparativa; 