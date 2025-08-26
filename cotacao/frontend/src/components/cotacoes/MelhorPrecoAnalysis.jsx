import React, { useState, useMemo } from 'react';
import { FaChartLine } from 'react-icons/fa';

const MelhorPrecoAnalysis = ({ fornecedores, produtos }) => {
  // Calcular valor com DIFAL e frete
  const calcularValorComDifalEFrete = (produto, fornecedor) => {
    const valorUnitario = parseFloat(produto.valor_unitario || produto.valorUnitario) || 0;
    const difal = parseFloat(produto.difal || 0);
    const ipi = parseFloat(produto.ipi || 0);
    const frete = parseFloat(fornecedor.valor_frete || fornecedor.valorFrete || 0);
    
    // Calcular valor com DIFAL e IPI (consistente com a edição)
    const valorComImpostos = valorUnitario * (1 + (difal / 100)) + ipi;
    
    // Calcular frete proporcional
    const valorTotalFornecedor = fornecedor.produtos.reduce((total, p) => {
      const qtd = parseFloat(p.qtde || p.quantidade) || 0;
      const valor = parseFloat(p.valor_unitario || p.valorUnitario) || 0;
      const pDifal = parseFloat(p.difal || 0);
      const pIpi = parseFloat(p.ipi || 0);
      const valorComImpostos = valor * (1 + (pDifal / 100)) + pIpi;
      return total + (qtd * valorComImpostos);
    }, 0);
    
    const qtdProduto = parseFloat(produto.qtde || produto.quantidade) || 0;
    const valorProduto = qtdProduto * valorComImpostos;
    const freteProporcional = valorTotalFornecedor > 0 ? 
      (valorProduto / valorTotalFornecedor) * frete : 0;
    
    const fretePorUnidade = qtdProduto > 0 ? 
      freteProporcional / qtdProduto : 0;
    
    return valorComImpostos + fretePorUnidade;
  };

  // Calcular melhor preço por produto
  const melhorPrecoPorProduto = useMemo(() => {
    const melhoresPrecos = {};
    
    produtos.forEach(produto => {
      let menorValor = Infinity;
      let melhorFornecedor = null;
      let melhorProdutoFornecedor = null;
      
      fornecedores.forEach(fornecedor => {
        // Buscar por nome do produto em vez de ID, já que os IDs não correspondem
        const produtoFornecedor = fornecedor.produtos.find(p => {
          const produtoNome = p.nome || p.produto_nome || p.descricao || '';
          const produtoOriginalNome = produto.nome || produto.produto_nome || produto.descricao || '';
          return produtoNome === produtoOriginalNome;
        });
        
        if (produtoFornecedor) {
          const valorUnitario = parseFloat(produtoFornecedor.valor_unitario) || 0;
          
          if (valorUnitario > 0) {
            const valorComDifalEFrete = calcularValorComDifalEFrete(produtoFornecedor, fornecedor);
            
            if (valorComDifalEFrete < menorValor) {
              menorValor = valorComDifalEFrete;
              melhorFornecedor = fornecedor;
              melhorProdutoFornecedor = produtoFornecedor;
            }
          }
        }
      });
      
      if (menorValor !== Infinity) {
        melhoresPrecos[produto.nome || produto.produto_nome || produto.descricao || 'Produto sem nome'] = {
          valor: menorValor,
          fornecedor: melhorFornecedor,
          produtoFornecedor: melhorProdutoFornecedor
        };
      }
    });
    
    return melhoresPrecos;
  }, [fornecedores, produtos]);

  // Preparar dados para a tabela - APENAS produtos com melhor preço
  const dadosTabela = useMemo(() => {
    const dados = [];
    
    produtos.forEach(produto => {
      const produtoNome = produto.nome || produto.produto_nome || produto.descricao || '';
      const melhorPreco = melhorPrecoPorProduto[produtoNome];
      
      // Só incluir se tiver melhor preço
      if (melhorPreco) {
        const { fornecedor, produtoFornecedor } = melhorPreco;
        const valorComDifalEFrete = melhorPreco.valor;
        
        dados.push({
          produto: produtoNome,
          produto_id: produto.id,
          fornecedor: fornecedor.nome,
          fornecedor_id: fornecedor.id,
          quantidade: produtoFornecedor.qtde || produtoFornecedor.quantidade,
          unidade: produtoFornecedor.un || produtoFornecedor.unidade,
          ultimoValorAprovado: produtoFornecedor.ult_valor_aprovado || produtoFornecedor.ultimo_valor_aprovado_saving || produtoFornecedor.ultValorAprovado,
          ultimoFornecedorAprovado: produtoFornecedor.ult_fornecedor_aprovado || produtoFornecedor.ultimo_fornecedor_aprovado_saving || produtoFornecedor.ultFornecedorAprovado,
          primeiroValor: produtoFornecedor.primeiro_valor,
          valorUnitario: produtoFornecedor.valor_unitario || produtoFornecedor.valorUnitario,
          valorComDifalEFrete,
          prazoEntrega: produtoFornecedor.prazo_entrega || produtoFornecedor.prazoEntrega,
          prazoEntregaFn: produtoFornecedor.data_entrega_fn || produtoFornecedor.dataEntregaFn,
          prazoPagamento: fornecedor.prazo_pagamento,
          isMelhorPreco: true,
          total: (parseFloat(produtoFornecedor.qtde || produtoFornecedor.quantidade) || 0) * valorComDifalEFrete
        });
      }
    });
    
    return dados;
  }, [fornecedores, produtos, melhorPrecoPorProduto]);

  // Calcular resumo
  const resumo = useMemo(() => {
    const produtosComMelhorPreco = dadosTabela.filter(d => d.isMelhorPreco);
    const totalEconomia = produtosComMelhorPreco.reduce((total, item) => {
      // Calcular economia: (Primeiro Valor x Qtd) - (Valor Unitário x Qtd)
      const primeiroValorTotal = (parseFloat(item.primeiroValor) || 0) * item.quantidade;
      const valorAtualTotal = (parseFloat(item.valorUnitario) || 0) * item.quantidade;
      
      return total + (primeiroValorTotal - valorAtualTotal);
    }, 0);
    
    return {
      totalProdutos: produtos.length,
      produtosComMelhorPreco: produtosComMelhorPreco.length,
      totalEconomia
    };
  }, [dadosTabela, produtos]);

  const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <FaChartLine className="text-green-600 text-xl" />
        <h3 className="text-xl font-semibold text-gray-800">Análise de Melhor Preço</h3>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{resumo.totalProdutos}</div>
          <div className="text-sm text-blue-700">Total de Produtos</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600">{resumo.produtosComMelhorPreco}</div>
          <div className="text-sm text-green-700">Produtos com Melhor Preço</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="text-2xl font-bold text-orange-600">{formatarValor(resumo.totalEconomia)}</div>
          <div className="text-sm text-orange-700">Economia Total</div>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-max">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-2 md:px-3 py-2 text-left font-semibold text-xs md:text-sm">Produto</th>
              <th className="px-2 md:px-3 py-2 text-left font-semibold text-xs md:text-sm">Fornecedor</th>
              <th className="px-2 md:px-3 py-2 text-left font-semibold text-xs md:text-sm">Qtd</th>
              <th className="px-2 md:px-3 py-2 text-left font-semibold text-xs md:text-sm hidden sm:table-cell">UN</th>
              <th className="px-2 md:px-3 py-2 text-left font-semibold text-xs md:text-sm hidden xl:table-cell">Ult. Vlr. Aprovado</th>
              <th className="px-2 md:px-3 py-2 text-left font-semibold text-xs md:text-sm hidden xl:table-cell">Ult. Fornecedor Aprovado</th>
              <th className="px-2 md:px-3 py-2 text-left font-semibold text-xs md:text-sm hidden xl:table-cell">Primeiro Valor</th>
              <th className="px-2 md:px-3 py-2 text-left font-semibold text-xs md:text-sm">Valor Unit.</th>
              <th className="px-2 md:px-3 py-2 text-left font-semibold text-xs md:text-sm">Valor + DIFAL/Frete</th>
              <th className="px-2 md:px-3 py-2 text-left font-semibold text-xs md:text-sm hidden lg:table-cell">Prazo Entrega</th>
              <th className="px-2 md:px-3 py-2 text-left font-semibold text-xs md:text-sm hidden lg:table-cell">Prazo Pagamento</th>
              <th className="px-2 md:px-3 py-2 text-left font-semibold text-xs md:text-sm">Total</th>
            </tr>
          </thead>
          <tbody>
            {dadosTabela.map((item, index) => (
              <tr 
                key={`${item.produto_id}_${item.fornecedor_id}`}
                className="border-b border-gray-200 hover:bg-gray-50 bg-green-50 border-l-4 border-l-green-500"
              >
                <td className="px-2 md:px-3 py-2 text-xs md:text-sm">
                  <div className="font-medium">
                    {item.produto}
                  </div>
                  {/* Info mobile */}
                  <div className="sm:hidden text-xs text-gray-500 mt-1">
                    UN: {item.unidade} | Qtd: {item.quantidade}
                    {item.prazoEntrega && (
                      <div>Prazo: {item.prazoEntrega}</div>
                    )}
                    {item.ultimoValorAprovado && (
                      <div>Ult. Vlr. Aprovado: {formatarValor(item.ultimoValorAprovado)}</div>
                    )}
                    {item.ultimoFornecedorAprovado && (
                      <div>Ult. Fornecedor: {item.ultimoFornecedorAprovado}</div>
                    )}
                    {item.primeiroValor && (
                      <div>Primeiro Valor: {formatarValor(item.primeiroValor)}</div>
                    )}
                  </div>
                </td>
                <td className="px-2 md:px-3 py-2 text-xs md:text-sm">
                  {item.fornecedor}
                </td>
                <td className="px-2 md:px-3 py-2 text-xs md:text-sm text-center">
                  {item.quantidade}
                </td>
                <td className="px-2 md:px-3 py-2 text-xs md:text-sm text-center hidden sm:table-cell">
                  {item.unidade}
                </td>
                <td className="px-2 md:px-3 py-2 text-xs md:text-sm hidden xl:table-cell">
                  {formatarValor(item.ultimoValorAprovado) || '-'}
                </td>
                <td className="px-2 md:px-3 py-2 text-xs md:text-sm hidden xl:table-cell">
                  {item.ultimoFornecedorAprovado || '-'}
                </td>
                <td className="px-2 md:px-3 py-2 text-xs md:text-sm hidden xl:table-cell">
                  {formatarValor(item.primeiroValor) || '-'}
                </td>
                <td className="px-2 md:px-3 py-2 text-xs md:text-sm font-semibold text-green-600">
                  {formatarValor(item.valorUnitario)}
                </td>
                <td className="px-2 md:px-3 py-2 text-xs md:text-sm font-semibold text-green-700 bg-green-100">
                  {formatarValor(item.valorComDifalEFrete)}
                </td>
                <td className="px-2 md:px-3 py-2 text-xs md:text-sm hidden lg:table-cell">
                  {item.prazoEntrega || '-'}
                </td>
                <td className="px-2 md:px-3 py-2 text-xs md:text-sm hidden lg:table-cell">
                  {item.prazoPagamento || '-'}
                </td>
                <td className="px-2 md:px-3 py-2 text-xs md:text-sm font-semibold text-green-600">
                  {formatarValor(item.total)}
                  {/* Info adicional no mobile/tablet */}
                  <div className="lg:hidden text-xs text-gray-500 mt-1 space-y-1">
                    {item.prazoEntrega && (
                      <div>Prazo: {item.prazoEntrega}</div>
                    )}
                    {item.prazoPagamento && (
                      <div>Pagamento: {item.prazoPagamento}</div>
                    )}
                    {item.ultimoValorAprovado && (
                      <div>Ult. Vlr. Aprovado: {formatarValor(item.ultimoValorAprovado)}</div>
                    )}
                    {item.ultimoFornecedorAprovado && (
                      <div>Ult. Fornecedor: {item.ultimoFornecedorAprovado}</div>
                    )}
                    {item.primeiroValor && (
                      <div>Primeiro Valor: {formatarValor(item.primeiroValor)}</div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


    </div>
  );
};

export default MelhorPrecoAnalysis;
