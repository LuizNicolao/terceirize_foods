import { useMemo } from 'react';

export const useFornecedoresCalculos = (fornecedores, produtos) => {
  // Calcular valor com DIFAL e frete
  const calcularValorComDifalEFrete = (produto, fornecedor) => {
    // Suportar diferentes formatos de dados (editar vs visualizar)
    const valorUnitario = parseFloat(produto.valor_unitario || produto.valorUnitario) || 0;
    const difal = parseFloat(produto.difal || 0);
    const ipi = parseFloat(produto.ipi || 0);
    const frete = parseFloat(fornecedor.valor_frete || fornecedor.valorFrete || 0);
    
    // Calcular valor com DIFAL e IPI (consistente com a edição)
    const valorComImpostos = valorUnitario * (1 + (difal / 100)) + ipi;
    
    // Calcular frete proporcional
    const valorTotalFornecedor = fornecedor.produtos.reduce((total, p) => {
      const qtd = parseFloat(p.quantidade || p.qtde) || 0;
      const valor = parseFloat(p.valor_unitario || p.valorUnitario) || 0;
      const pDifal = parseFloat(p.difal || 0);
      const pIpi = parseFloat(p.ipi || 0);
      const valorComImpostos = valor * (1 + (pDifal / 100)) + pIpi;
      return total + (qtd * valorComImpostos);
    }, 0);
    
    const qtdProduto = parseFloat(produto.quantidade || produto.qtde) || 0;
    const valorProduto = qtdProduto * valorComImpostos;
    const freteProporcional = valorTotalFornecedor > 0 ? 
      (valorProduto / valorTotalFornecedor) * frete : 0;
    
    const fretePorUnidade = qtdProduto > 0 ? 
      freteProporcional / qtdProduto : 0;
    
    return valorComImpostos + fretePorUnidade;
  };

  // Calcular valor total do fornecedor
  const calcularValorTotalFornecedor = (fornecedor) => {
    const valorTotalProdutos = fornecedor.produtos.reduce((total, produto) => {
      const qtde = parseFloat(produto.qtde || produto.quantidade) || 0;
      const valorUnit = parseFloat(produto.valor_unitario || produto.valorUnitario) || 0;
      const difal = parseFloat(produto.difal) || 0;
      const ipi = parseFloat(produto.ipi) || 0;
      const valorComImpostos = valorUnit * (1 + (difal / 100)) + ipi;
      return total + (qtde * valorComImpostos);
    }, 0);

    const frete = parseFloat(fornecedor.valor_frete || fornecedor.valorFrete || 0);
    
    return {
      valorProdutos: valorTotalProdutos,
      frete: frete,
      total: valorTotalProdutos + frete
    };
  };

  // Calcular melhor preço por produto
  const melhorPrecoPorProduto = useMemo(() => {
    const melhoresPrecos = {};
    
    produtos.forEach(produto => {
      let menorValor = Infinity;
      let melhorFornecedor = null;
      let melhorProdutoFornecedor = null;
      
      fornecedores.forEach(fornecedor => {
        // Buscar produto por nome em vez de ID, já que os IDs podem não corresponder
        const produtoFornecedor = fornecedor.produtos.find(p => {
          const produtoNome = p.nome || p.produto_nome || p.descricao || '';
          const produtoOriginalNome = produto.nome || produto.produto_nome || produto.descricao || '';
          return produtoNome === produtoOriginalNome;
        });
        
        if (produtoFornecedor && (produtoFornecedor.valor_unitario || produtoFornecedor.valorUnitario) > 0) {
          const valorComDifalEFrete = calcularValorComDifalEFrete(produtoFornecedor, fornecedor);
          if (valorComDifalEFrete < menorValor) {
            menorValor = valorComDifalEFrete;
            melhorFornecedor = fornecedor;
            melhorProdutoFornecedor = produtoFornecedor;
          }
        }
      });
      
      if (menorValor !== Infinity) {
        // Usar o nome do produto como chave para facilitar a busca
        const produtoNome = produto.nome || produto.produto_nome || produto.descricao || '';
        melhoresPrecos[produtoNome] = {
          valor: menorValor,
          fornecedor: melhorFornecedor,
          produtoFornecedor: melhorProdutoFornecedor,
          produtoOriginal: produto
        };
      }
    });
    
    return melhoresPrecos;
  }, [fornecedores, produtos]);

  return {
    calcularValorComDifalEFrete,
    calcularValorTotalFornecedor,
    melhorPrecoPorProduto
  };
};
