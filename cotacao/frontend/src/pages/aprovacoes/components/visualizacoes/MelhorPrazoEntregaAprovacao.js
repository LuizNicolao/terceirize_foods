import React from 'react';

const MelhorPrazoEntrega = ({ cotacao, active, formatarValor }) => {
  if (!active || !cotacao?.itens) {
    return null;
  }

  // Calcular melhor prazo de entrega por produto
  const produtosMelhorPrazo = {};
  let valorTotalMelhorPrazo = 0;
  let valorTotalMedio = 0;
  let valorTotalUltimoAprovado = 0;
  let valorTotalPrimeiroValor = 0;
  
  // Função para formatar data
  const formatarData = (data) => {
    if (!data) return '-';
    try {
      const dataObj = new Date(data);
      if (isNaN(dataObj.getTime())) return '-';
      return dataObj.toLocaleDateString('pt-BR');
    } catch (error) {
      return '-';
    }
  };

  // Função para calcular dias até a entrega
  const calcularDiasEntrega = (dataEntrega, dataCotacao) => {
    if (!dataEntrega || !dataCotacao) return 999;
    
    try {
      const dataEntregaObj = new Date(dataEntrega);
      const dataCotacaoObj = new Date(dataCotacao);
      
      if (isNaN(dataEntregaObj.getTime()) || isNaN(dataCotacaoObj.getTime())) {
        return 999;
      }
      
      const diffTime = dataEntregaObj.getTime() - dataCotacaoObj.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays >= 0 ? diffDays : 999;
    } catch (error) {
      return 999;
    }
  };

  cotacao.itens.forEach(item => {
    const produtoId = item.produto_id || item.produto_nome;
    
    // Calcular dias até a entrega baseado na data da cotação
    const diasEntrega = calcularDiasEntrega(item.data_entrega_fn, cotacao.data_criacao);
    
    const valorUnitario = parseFloat(item.valor_unitario) || 0;
    const quantidade = parseFloat(item.quantidade) || 0;
    const ultimoValorAprovado = parseFloat(item.ult_valor_aprovado) || 0;
    const primeiroValor = parseFloat(item.primeiro_valor) || parseFloat(item.valor_anterior) || valorUnitario;

    if (!produtosMelhorPrazo[produtoId] || diasEntrega < produtosMelhorPrazo[produtoId].melhorPrazo) {
      produtosMelhorPrazo[produtoId] = {
        produto_nome: item.produto_nome,
        fornecedor_nome: item.fornecedor_nome,
        quantidade: quantidade,
        unidade_medida: item.unidade_medida,
        preco_unitario: valorUnitario,
        valorTotal: valorUnitario * quantidade,
        prazo_entrega: item.prazo_entrega,
        prazo_pagamento: item.prazo_pagamento,
        data_entrega_fn: item.data_entrega_fn,
        melhorPrazo: diasEntrega,
        diasEntrega: diasEntrega,
        ult_valor_aprovado: item.ult_valor_aprovado,
        ultimoValorAprovado: ultimoValorAprovado,
        primeiroValor: primeiroValor
      };
    }
  });

  const itensMelhorPrazo = Object.values(produtosMelhorPrazo).sort((a, b) => a.melhorPrazo - b.melhorPrazo);

  // Calcular totais e economias
  itensMelhorPrazo.forEach(item => {
    valorTotalMelhorPrazo += item.valorTotal;
    valorTotalUltimoAprovado += item.ultimoValorAprovado * item.quantidade;
    valorTotalPrimeiroValor += item.primeiroValor * item.quantidade;
  });

  // Calcular preço médio
  const itensPorProduto = {};
  cotacao.itens.forEach(item => {
    const produtoId = item.produto_id || item.produto_nome;
    if (!itensPorProduto[produtoId]) {
      itensPorProduto[produtoId] = [];
    }
    itensPorProduto[produtoId].push(item);
  });

  Object.values(itensPorProduto).forEach(produtos => {
    const precoMedio = produtos.reduce((sum, item) => sum + parseFloat(item.valor_unitario || 0), 0) / produtos.length;
    const quantidade = parseFloat(produtos[0].quantidade) || 1;
    valorTotalMedio += precoMedio * quantidade;
  });

  const economia = valorTotalMedio - valorTotalMelhorPrazo;
  const economiaPercentual = valorTotalMedio > 0 ? (economia / valorTotalMedio * 100) : 0;
  
  const economiaUltimoAprovado = valorTotalUltimoAprovado - valorTotalMelhorPrazo;
  const economiaUltimoAprovadoPercentual = valorTotalUltimoAprovado > 0 ? (economiaUltimoAprovado / valorTotalUltimoAprovado * 100) : 0;
  
  const valorSawing = valorTotalPrimeiroValor - valorTotalMelhorPrazo;
  const valorSawingPercentual = valorTotalPrimeiroValor > 0 ? (valorSawing / valorTotalPrimeiroValor * 100) : 0;
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Resumo Econômico */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Econômico</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <span>💰</span>
              Valor Total
            </h4>
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {formatarValor ? formatarValor(valorTotalMelhorPrazo) : `R$ ${valorTotalMelhorPrazo.toFixed(2)}`}
            </div>
            <div className="text-xs text-blue-700">
              {itensMelhorPrazo.length} itens
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
              <span>📈</span>
              Economia vs Média
            </h4>
            <div className="text-2xl font-bold text-green-600 mb-1">
              {formatarValor ? formatarValor(economia) : `R$ ${economia.toFixed(2)}`}
            </div>
            <div className="text-xs text-green-700">
              {economiaPercentual.toFixed(1)}% de economia
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-purple-800 mb-2 flex items-center gap-2">
              <span>🔄</span>
              vs Último Aprovado
            </h4>
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {formatarValor ? formatarValor(economiaUltimoAprovado) : `R$ ${economiaUltimoAprovado.toFixed(2)}`}
            </div>
            <div className="text-xs text-purple-700">
              {economiaUltimoAprovadoPercentual.toFixed(1)}% de economia
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-orange-800 mb-2 flex items-center gap-2">
              <span>💾</span>
              Valor Sawing
            </h4>
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {formatarValor ? formatarValor(valorSawing) : `R$ ${valorSawing.toFixed(2)}`}
            </div>
            <div className="text-xs text-orange-700">
              {valorSawingPercentual.toFixed(1)}% de saving
            </div>
          </div>
        </div>
      </div>


      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fornecedor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qtd</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prazo Entrega</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Unitário</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Últ. Vlr. Aprovado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Economia</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Economia Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prazo Pagamento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Entrega Fn</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {itensMelhorPrazo.map((item, index) => {
              // Calcular economia
              const ultimoValorAprovado = parseFloat(item.ult_valor_aprovado) || 0;
              const economia = ultimoValorAprovado > 0 ? ultimoValorAprovado - item.preco_unitario : 0;
              const economiaPorcentagem = ultimoValorAprovado > 0 ? (economia / ultimoValorAprovado * 100) : 0;
              const economiaTotal = economia * item.quantidade;
              
              const economiaClass = ultimoValorAprovado > 0 ? 
                (economia > 0 ? 'text-green-600' : 
                 economia < 0 ? 'text-red-600' : 'text-gray-500') 
                : 'text-gray-500';
              
              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.produto_nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.fornecedor_nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.quantidade}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                    {item.prazo_entrega || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatarValor ? formatarValor(item.preco_unitario) : `R$ ${item.preco_unitario || 0}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatarValor ? formatarValor(item.valorTotal) : `R$ ${item.valorTotal || 0}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.ult_valor_aprovado ? (formatarValor ? formatarValor(item.ult_valor_aprovado) : `R$ ${item.ult_valor_aprovado}`) : '-'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${economiaClass}`}>
                    {ultimoValorAprovado > 0 ? 
                      `${formatarValor ? formatarValor(economia) : `R$ ${economia}`} (${economiaPorcentagem.toFixed(1)}%)` : 
                      '-'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${economiaClass}`}>
                    {ultimoValorAprovado > 0 ? 
                      `${formatarValor ? formatarValor(economiaTotal) : `R$ ${economiaTotal}`} (${economiaPorcentagem.toFixed(1)}%)` : 
                      '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.prazo_pagamento || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatarData(item.data_entrega_fn)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MelhorPrazoEntrega; 