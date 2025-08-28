import React from 'react';

const AnaliseComparativaAprovacao = ({ cotacao, active, formatarValor, analise }) => {
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

  // Verificar se há produtos para mostrar
  if (produtos.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Comparativo</h3>
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum produto encontrado para análise comparativa.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Comparativo</h3>
      
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Melhor Preço</p>
              <p className="text-2xl font-bold text-green-600">
                {formatarValor ? formatarValor(valorTotalMelhorPreco) : `R$ ${valorTotalMelhorPreco.toFixed(2)}`}
              </p>
            </div>
            <div className="bg-green-500 text-white p-3 rounded-lg">
              <span className="text-xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Melhor Entrega</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatarValor ? formatarValor(valorTotalMelhorEntrega) : `R$ ${valorTotalMelhorEntrega.toFixed(2)}`}
              </p>
            </div>
            <div className="bg-blue-500 text-white p-3 rounded-lg">
              <span className="text-xl">🚚</span>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Melhor Pagamento</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatarValor ? formatarValor(valorTotalMelhorPagamento) : `R$ ${valorTotalMelhorPagamento.toFixed(2)}`}
              </p>
            </div>
            <div className="bg-purple-500 text-white p-3 rounded-lg">
              <span className="text-xl">💳</span>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700">Economia vs Últ. Aprovado</p>
              <p className={`text-2xl font-bold ${economiaTotal > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatarValor ? formatarValor(economiaTotal) : `R$ ${economiaTotal.toFixed(2)}`}
              </p>
              <p className="text-sm text-gray-600">
                ({economiaPercentual.toFixed(1)}%)
              </p>
            </div>
            <div className="bg-orange-500 text-white p-3 rounded-lg">
              <span className="text-xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela Comparativa */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Critério</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fornecedor</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Unitário</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Total</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Últ. Vlr. Aprovado</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Economia vs Últ. Aprovado</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prazo Entrega</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prazo Pagamento</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {produtos.map((produto, index) => {
              // Buscar valores dos itens com melhor prazo de entrega e pagamento
              const itemMelhorEntrega = cotacao.itens.find(item => 
                (item.produto_id === produto.id || item.produto_nome === produto.nome) && 
                item.fornecedor_nome === produto.melhorPrazoEntrega.fornecedor
              );
              const itemMelhorPagamento = cotacao.itens.find(item => 
                (item.produto_id === produto.id || item.produto_nome === produto.nome) && 
                item.fornecedor_nome === produto.melhorPrazoPagamento.fornecedor
              );
              
              // Calcular valores totais
              const valorTotalMelhorPreco = (produto.melhorPreco.valor || 0) * (produto.quantidade || 0);
              const valorTotalMelhorEntrega = itemMelhorEntrega ? (parseFloat(itemMelhorEntrega.valor_unitario) || 0) * (produto.quantidade || 0) : 0;
              const valorTotalMelhorPagamento = itemMelhorPagamento ? (parseFloat(itemMelhorPagamento.valor_unitario) || 0) * (produto.quantidade || 0) : 0;
              
              // Buscar último valor aprovado
              const itemCorrespondente = cotacao.itens.find(item => 
                (item.produto_id === produto.id || item.produto_nome === produto.nome) && 
                item.ult_valor_aprovado
              );
              const ultimoValorAprovado = itemCorrespondente ? parseFloat(itemCorrespondente.ult_valor_aprovado) : 0;
              
              // Calcular economias
              const economiaMelhorPreco = ultimoValorAprovado > 0 ? (ultimoValorAprovado - (produto.melhorPreco.valor || 0)) * (produto.quantidade || 0) : 0;
              const economiaMelhorEntrega = itemMelhorEntrega && ultimoValorAprovado > 0 ? 
                (ultimoValorAprovado - (parseFloat(itemMelhorEntrega.valor_unitario) || 0)) * (produto.quantidade || 0) : 0;
              const economiaMelhorPagamento = itemMelhorPagamento && ultimoValorAprovado > 0 ? 
                (ultimoValorAprovado - (parseFloat(itemMelhorPagamento.valor_unitario) || 0)) * (produto.quantidade || 0) : 0;
              
              return (
                <React.Fragment key={index}>
                  {/* Linha de título do produto */}
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <td colSpan="8" className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">{produto.nome}</span>
                        <span className="text-sm text-gray-600">Qtd: {produto.quantidade.toFixed(2)} {produto.unidade}</span>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Linha - Melhor Preço */}
                  <tr className="hover:bg-green-50 border-l-4 border-l-green-500">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        💰 Melhor Preço
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{produto.melhorPreco.fornecedor}</td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600">
                      {formatarValor ? formatarValor(produto.melhorPreco.valor) : `R$ ${produto.melhorPreco.valor.toFixed(2)}`}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600">
                      {formatarValor ? formatarValor(valorTotalMelhorPreco) : `R$ ${valorTotalMelhorPreco.toFixed(2)}`}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {ultimoValorAprovado > 0 ? (formatarValor ? formatarValor(ultimoValorAprovado) : `R$ ${ultimoValorAprovado.toFixed(2)}`) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {ultimoValorAprovado > 0 ? (
                        <span className={`font-bold ${economiaMelhorPreco > 0 ? 'text-green-600' : economiaMelhorPreco < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {formatarValor ? formatarValor(economiaMelhorPreco) : `R$ ${economiaMelhorPreco.toFixed(2)}`} 
                          ({ultimoValorAprovado > 0 ? ((economiaMelhorPreco / (ultimoValorAprovado * produto.quantidade)) * 100).toFixed(1) : 0}%)
                        </span>
                      ) : (
                        <span className="text-gray-500">R$ 0,00 (0,0%)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{produto.melhorPrazoEntrega.prazoStr || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{produto.melhorPrazoPagamento.prazoStr || '-'}</td>
                  </tr>
                  
                  {/* Linha - Melhor Entrega */}
                  {itemMelhorEntrega && (
                    <tr className="hover:bg-blue-50 border-l-4 border-l-blue-500">
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          🚚 Melhor Entrega
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{produto.melhorPrazoEntrega.fornecedor}</td>
                      <td className="px-4 py-3 text-sm font-bold text-blue-600">
                        {formatarValor ? formatarValor(parseFloat(itemMelhorEntrega.valor_unitario)) : `R$ ${parseFloat(itemMelhorEntrega.valor_unitario).toFixed(2)}`}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-blue-600">
                        {formatarValor ? formatarValor(valorTotalMelhorEntrega) : `R$ ${valorTotalMelhorEntrega.toFixed(2)}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {ultimoValorAprovado > 0 ? (formatarValor ? formatarValor(ultimoValorAprovado) : `R$ ${ultimoValorAprovado.toFixed(2)}`) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {ultimoValorAprovado > 0 ? (
                          <span className={`font-bold ${economiaMelhorEntrega > 0 ? 'text-green-600' : economiaMelhorEntrega < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            {formatarValor ? formatarValor(economiaMelhorEntrega) : `R$ ${economiaMelhorEntrega.toFixed(2)}`} 
                            ({ultimoValorAprovado > 0 ? ((economiaMelhorEntrega / (ultimoValorAprovado * produto.quantidade)) * 100).toFixed(1) : 0}%)
                          </span>
                        ) : (
                          <span className="text-gray-500">R$ 0,00 (0,0%)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-blue-600">{produto.melhorPrazoEntrega.prazoStr || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{itemMelhorEntrega.prazo_pagamento || '-'}</td>
                    </tr>
                  )}
                  
                  {/* Linha - Melhor Pagamento */}
                  {itemMelhorPagamento && (
                    <tr className="hover:bg-purple-50 border-l-4 border-l-purple-500">
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          💳 Melhor Pagamento
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{produto.melhorPrazoPagamento.fornecedor}</td>
                      <td className="px-4 py-3 text-sm font-bold text-purple-600">
                        {formatarValor ? formatarValor(parseFloat(itemMelhorPagamento.valor_unitario)) : `R$ ${parseFloat(itemMelhorPagamento.valor_unitario).toFixed(2)}`}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-purple-600">
                        {formatarValor ? formatarValor(valorTotalMelhorPagamento) : `R$ ${valorTotalMelhorPagamento.toFixed(2)}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {ultimoValorAprovado > 0 ? (formatarValor ? formatarValor(ultimoValorAprovado) : `R$ ${ultimoValorAprovado.toFixed(2)}`) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {ultimoValorAprovado > 0 ? (
                          <span className={`font-bold ${economiaMelhorPagamento > 0 ? 'text-green-600' : economiaMelhorPagamento < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            {formatarValor ? formatarValor(economiaMelhorPagamento) : `R$ ${economiaMelhorPagamento.toFixed(2)}`} 
                            ({ultimoValorAprovado > 0 ? ((economiaMelhorPagamento / (ultimoValorAprovado * produto.quantidade)) * 100).toFixed(1) : 0}%)
                          </span>
                        ) : (
                          <span className="text-gray-500">R$ 0,00 (0,0%)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{itemMelhorPagamento.prazo_entrega || '-'}</td>
                      <td className="px-4 py-3 text-sm font-bold text-purple-600">{produto.melhorPrazoPagamento.prazoStr || '-'}</td>
                    </tr>
                  )}
                  
                  {/* Linha de separação */}
                  <tr className="h-2 bg-gray-100">
                    <td colSpan="8" className="px-0 py-0"></td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnaliseComparativaAprovacao;
