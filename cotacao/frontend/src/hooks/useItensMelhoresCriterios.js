import { useState, useEffect } from 'react';

export const useItensMelhoresCriterios = (cotacao) => {
  const [itensMelhorPreco, setItensMelhorPreco] = useState([]);
  const [itensMelhorEntrega, setItensMelhorEntrega] = useState([]);
  const [itensMelhorPagamento, setItensMelhorPagamento] = useState([]);

  useEffect(() => {
    if (cotacao && cotacao.itens) {
      const produtosAgrupados = {};
      
      cotacao.itens.forEach(item => {
        const nomeProduto = item.produto_nome;
        if (!produtosAgrupados[nomeProduto]) {
          produtosAgrupados[nomeProduto] = [];
        }
        produtosAgrupados[nomeProduto].push(item);
      });

      const melhoresPreco = [];
      const melhoresEntrega = [];
      const melhoresPagamento = [];

      Object.entries(produtosAgrupados).forEach(([nomeProduto, itens]) => {
        // Melhor preço
        const itensPorPreco = [...itens].sort((a, b) => parseFloat(a.valor_unitario) - parseFloat(b.valor_unitario));
        if (itensPorPreco.length > 0) {
          melhoresPreco.push({
            produto_id: itensPorPreco[0].produto_id,
            fornecedor_nome: itensPorPreco[0].fornecedor_nome,
            valor_unitario: itensPorPreco[0].valor_unitario,
            produto_nome: itensPorPreco[0].produto_nome,
            quantidade: itensPorPreco[0].quantidade,
            prazo_entrega: itensPorPreco[0].prazo_entrega,
            prazo_pagamento: itensPorPreco[0].prazo_pagamento
          });
        }

        // Melhor prazo de entrega
        const itensComPrazoEntrega = itens.filter(item => item.prazo_entrega && item.prazo_entrega.trim() !== '');
        if (itensComPrazoEntrega.length > 0) {
          const itensPorPrazoEntrega = [...itensComPrazoEntrega].sort((a, b) => {
            const diasA = parseInt(a.prazo_entrega.match(/\d+/)?.[0] || 999);
            const diasB = parseInt(b.prazo_entrega.match(/\d+/)?.[0] || 999);
            return diasA - diasB;
          });

          melhoresEntrega.push({
            produto_id: itensPorPrazoEntrega[0].produto_id,
            fornecedor_nome: itensPorPrazoEntrega[0].fornecedor_nome,
            valor_unitario: itensPorPrazoEntrega[0].valor_unitario,
            produto_nome: itensPorPrazoEntrega[0].produto_nome,
            quantidade: itensPorPrazoEntrega[0].quantidade,
            prazo_entrega: itensPorPrazoEntrega[0].prazo_entrega,
            prazo_pagamento: itensPorPrazoEntrega[0].prazo_pagamento
          });
        }

        // Melhor prazo de pagamento
        const itensComPrazoPagamento = itens.filter(item => item.prazo_pagamento && item.prazo_pagamento.trim() !== '');
        if (itensComPrazoPagamento.length > 0) {
          const itensPorPrazoPagamento = [...itensComPrazoPagamento].sort((a, b) => {
            const diasA = parseInt(a.prazo_pagamento.match(/\d+/)?.[0] || 0);
            const diasB = parseInt(b.prazo_pagamento.match(/\d+/)?.[0] || 0);
            return diasB - diasA; // Ordem decrescente (maior prazo é melhor)
          });

          melhoresPagamento.push({
            produto_id: itensPorPrazoPagamento[0].produto_id,
            fornecedor_nome: itensPorPrazoPagamento[0].fornecedor_nome,
            valor_unitario: itensPorPrazoPagamento[0].valor_unitario,
            produto_nome: itensPorPrazoPagamento[0].produto_nome,
            quantidade: itensPorPrazoPagamento[0].quantidade,
            prazo_entrega: itensPorPrazoPagamento[0].prazo_entrega,
            prazo_pagamento: itensPorPrazoPagamento[0].prazo_pagamento
          });
        }
      });

      setItensMelhorPreco(melhoresPreco);
      setItensMelhorEntrega(melhoresEntrega);
      setItensMelhorPagamento(melhoresPagamento);
    }
  }, [cotacao]);

  return {
    itensMelhorPreco,
    itensMelhorEntrega,
    itensMelhorPagamento
  };
};
