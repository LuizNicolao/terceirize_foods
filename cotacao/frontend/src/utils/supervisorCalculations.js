/**
 * Utilitários para cálculos de análise do supervisor
 */

export const calcularMelhorPreco = (precos) => {
  if (!precos || precos.length === 0) return { itens: [], totais: {} };

  // Agrupar por produto
  const produtosAgrupados = {};
  precos.forEach(preco => {
    const produtoNome = preco.produto_nome;
    if (!produtosAgrupados[produtoNome]) {
      produtosAgrupados[produtoNome] = [];
    }
    produtosAgrupados[produtoNome].push(preco);
  });

  // Encontrar melhor preço para cada produto
  const itensMelhorPreco = [];
  let valorTotalMelhorPreco = 0;
  let valorTotalMedio = 0;
  let quantidadeTotalItens = 0;

  Object.entries(produtosAgrupados).forEach(([produtoNome, itens]) => {
    // Ordenar por valor unitário (menor para maior)
    itens.sort((a, b) => parseFloat(a.preco_unitario) - parseFloat(b.preco_unitario));
    
    const melhorItem = itens[0];
    const quantidade = parseFloat(melhorItem.quantidade) || 0;
    const valorUnitario = parseFloat(melhorItem.preco_unitario) || 0;
    const valorTotal = quantidade * valorUnitario;
    
    // Calcular média dos preços para este produto
    const mediaPrecos = itens.reduce((sum, item) => sum + parseFloat(item.preco_unitario), 0) / itens.length;
    
    quantidadeTotalItens += quantidade;
    valorTotalMelhorPreco += valorTotal;
    valorTotalMedio += mediaPrecos * quantidade;

    itensMelhorPreco.push({
      ...melhorItem,
      valorTotal,
      mediaPrecos,
      economia: (mediaPrecos - valorUnitario) * quantidade,
      economiaPorcentagem: mediaPrecos > 0 ? ((mediaPrecos - valorUnitario) / mediaPrecos * 100) : 0
    });
  });

  const economiaTotal = valorTotalMedio - valorTotalMelhorPreco;
  const economiaPorcentagem = valorTotalMedio > 0 ? (economiaTotal / valorTotalMedio * 100) : 0;

  return {
    itens: itensMelhorPreco,
    totais: {
      valorTotal: valorTotalMelhorPreco,
      valorMedio: valorTotalMedio,
      economia: economiaTotal,
      economiaPorcentagem,
      quantidadeTotal: quantidadeTotalItens
    }
  };
};

export const calcularMelhorPrazoEntrega = (precos) => {
  if (!precos || precos.length === 0) return { itens: [] };

  // Agrupar por produto
  const produtosAgrupados = {};
  precos.forEach(preco => {
    const produtoNome = preco.produto_nome;
    if (!produtosAgrupados[produtoNome]) {
      produtosAgrupados[produtoNome] = [];
    }
    produtosAgrupados[produtoNome].push(preco);
  });

  // Encontrar melhor prazo para cada produto
  const itensMelhorPrazo = [];
  
  Object.entries(produtosAgrupados).forEach(([produtoNome, itens]) => {
    // Filtrar itens com prazo de entrega válido
    const itensComPrazo = itens.filter(item => item.prazo_entrega && item.prazo_entrega !== '-');
    
    if (itensComPrazo.length > 0) {
      // Ordenar por prazo de entrega (menor para maior)
      itensComPrazo.sort((a, b) => {
        const prazoA = parseInt(a.prazo_entrega) || 999;
        const prazoB = parseInt(b.prazo_entrega) || 999;
        return prazoA - prazoB;
      });
      
      itensMelhorPrazo.push(itensComPrazo[0]);
    } else {
      // Se não há prazo válido, pegar o primeiro item
      itensMelhorPrazo.push(itens[0]);
    }
  });

  return { itens: itensMelhorPrazo };
};

export const calcularMelhorPrazoPagamento = (precos) => {
  if (!precos || precos.length === 0) return { itens: [] };

  // Agrupar por produto
  const produtosAgrupados = {};
  precos.forEach(preco => {
    const produtoNome = preco.produto_nome;
    if (!produtosAgrupados[produtoNome]) {
      produtosAgrupados[produtoNome] = [];
    }
    produtosAgrupados[produtoNome].push(preco);
  });

  // Encontrar melhor prazo de pagamento para cada produto
  const itensMelhorPagamento = [];
  
  Object.entries(produtosAgrupados).forEach(([produtoNome, itens]) => {
    // Filtrar itens com prazo de pagamento válido
    const itensComPagamento = itens.filter(item => item.prazo_pagamento && item.prazo_pagamento !== '-');
    
    if (itensComPagamento.length > 0) {
      // Ordenar por prazo de pagamento (maior para menor - melhor prazo é o maior)
      itensComPagamento.sort((a, b) => {
        const prazoA = parseInt(a.prazo_pagamento) || 0;
        const prazoB = parseInt(b.prazo_pagamento) || 0;
        return prazoB - prazoA; // Ordem decrescente
      });
      
      itensMelhorPagamento.push(itensComPagamento[0]);
    } else {
      // Se não há prazo válido, pegar o primeiro item
      itensMelhorPagamento.push(itens[0]);
    }
  });

  return { itens: itensMelhorPagamento };
};

export const calcularComparativoProdutos = (precos) => {
  if (!precos || precos.length === 0) return { itens: [] };

  // Agrupar por produto
  const produtosAgrupados = {};
  precos.forEach(preco => {
    const produtoNome = preco.produto_nome;
    if (!produtosAgrupados[produtoNome]) {
      produtosAgrupados[produtoNome] = [];
    }
    produtosAgrupados[produtoNome].push(preco);
  });

  const comparativo = [];
  
  Object.entries(produtosAgrupados).forEach(([produtoNome, itens]) => {
    const quantidade = parseFloat(itens[0].quantidade) || 0;
    const unidade = itens[0].unidade_medida || 'UN';
    
    // Encontrar melhor preço
    const melhorPreco = itens.reduce((min, item) => 
      parseFloat(item.preco_unitario) < parseFloat(min.preco_unitario) ? item : min
    );
    
    // Encontrar melhor prazo de entrega
    const itensComPrazo = itens.filter(item => item.prazo_entrega && item.prazo_entrega !== '-');
    const melhorPrazo = itensComPrazo.length > 0 ? 
      itensComPrazo.reduce((min, item) => {
        const prazoA = parseInt(item.prazo_entrega) || 999;
        const prazoB = parseInt(min.prazo_entrega) || 999;
        return prazoA < prazoB ? item : min;
      }) : itens[0];
    
    // Encontrar melhor prazo de pagamento (assumindo que todos têm o mesmo por enquanto)
    const melhorPagamento = itens[0];
    
    comparativo.push({
      produto: produtoNome,
      quantidade,
      unidade,
      melhorPreco: {
        valor: parseFloat(melhorPreco.preco_unitario),
        fornecedor: melhorPreco.fornecedor_nome
      },
      melhorPrazo: {
        prazo: melhorPrazo.prazo_entrega || '-',
        fornecedor: melhorPrazo.fornecedor_nome
      },
      melhorPagamento: {
        prazo: melhorPagamento.prazo_pagamento || '-',
        fornecedor: melhorPagamento.fornecedor_nome
      }
    });
  });

  return { itens: comparativo };
};

export const calcularValorTotal = (precos) => {
  if (!precos || precos.length === 0) return 0;
  return precos.reduce((total, preco) => {
    return total + parseFloat(preco.preco_total || 0);
  }, 0);
};
