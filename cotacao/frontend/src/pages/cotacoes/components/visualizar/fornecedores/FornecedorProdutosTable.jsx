import React from 'react';

const FornecedorProdutosTable = ({
  fornecedor,
  melhorPrecoPorProduto,
  calcularValorComDifalEFrete
}) => {
  const formatarValor = (valor) => {
    if (!valor || valor === 0) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
        📦 Produtos ({fornecedor.produtos.length})
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-max">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-2 md:px-3 py-2 text-left font-semibold text-xs md:text-sm">Produto</th>
              <th className="px-2 md:px-3 py-2 text-left font-semibold text-xs md:text-sm">Qtd</th>
              <th className="px-2 md:px-3 py-2 text-left font-semibold text-xs md:text-sm hidden sm:table-cell">UN</th>
              <th className="px-2 md:px-3 py-2 text-left font-semibold text-xs md:text-sm hidden lg:table-cell">Prazo Entrega</th>
              <th className="px-2 md:px-3 py-2 text-left font-semibold text-xs md:text-sm hidden xl:table-cell">Ult. Vlr. Aprovado</th>
              <th className="px-2 md:px-3 py-2 text-left font-semibold text-xs md:text-sm hidden xl:table-cell">Ult. Fornecedor Aprovado</th>
              <th className="px-2 md:px-3 py-2 text-left font-semibold text-xs md:text-sm hidden xl:table-cell">Valor Anterior</th>
              <th className="px-2 md:px-3 py-2 text-left font-semibold text-xs md:text-sm">Valor Unit.</th>
              <th className="px-2 md:px-3 py-2 text-left font-semibold text-xs md:text-sm hidden md:table-cell">Difal</th>
              <th className="px-2 md:px-3 py-2 text-left font-semibold text-xs md:text-sm hidden md:table-cell">IPI</th>
              <th className="px-2 md:px-3 py-2 text-left font-semibold text-xs md:text-sm hidden lg:table-cell">Data Entrega Fn</th>
              <th className="px-2 md:px-3 py-2 text-left font-semibold text-xs md:text-sm">Total</th>
            </tr>
          </thead>
          <tbody>
            {fornecedor.produtos.map((produto) => {
              // Obter nome do produto com fallback
              const produtoNome = produto.nome || produto.produto_nome || produto.descricao || 'Produto sem nome';
              
              // Verificar se é o melhor preço - buscar por nome do produto
              const melhorPreco = melhorPrecoPorProduto[produtoNome];
              
              const valorComDifalEFrete = calcularValorComDifalEFrete(produto, fornecedor);
              const isMelhorPreco = melhorPreco && Math.abs(valorComDifalEFrete - melhorPreco.valor) < 0.01;
              
              return (
                <tr 
                  key={produto.id} 
                  className={`border-b border-gray-200 hover:bg-gray-50 ${
                    isMelhorPreco ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                  }`}
                >
                  <td className="px-2 md:px-3 py-2 text-xs md:text-sm">
                    <div className="font-medium flex items-center gap-2">
                      {produtoNome}
                      {isMelhorPreco && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          
                        </span>
                      )}
                    </div>
                    {/* Info mobile */}
                    <div className="sm:hidden text-xs text-gray-500 mt-1">
                      UN: {produto.un || produto.unidade} | Qtd: {produto.qtde || produto.quantidade}
                      {(produto.prazo_entrega || produto.prazoEntrega) && (
                        <div>Prazo: {produto.prazo_entrega || produto.prazoEntrega}</div>
                      )}
                      {(produto.ult_valor_aprovado || produto.ultimo_valor_aprovado_saving || produto.ultimoValorAprovado) && (
                        <div>Ult. Vlr. Aprovado: {formatarValor(produto.ult_valor_aprovado || produto.ultimo_valor_aprovado_saving || produto.ultimoValorAprovado)}</div>
                      )}
                      {(produto.ult_fornecedor_aprovado || produto.ultimo_fornecedor_aprovado_saving || produto.ultimoFornecedorAprovado) && (
                        <div>Ult. Fornecedor: {produto.ult_fornecedor_aprovado || produto.ultimo_fornecedor_aprovado_saving || produto.ultimoFornecedorAprovado}</div>
                      )}
                      {(produto.valor_anterior || produto.valorAnterior) && (
                        <div>Valor Anterior: {formatarValor(produto.valor_anterior || produto.valorAnterior)}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-2 md:px-3 py-2 text-xs md:text-sm text-center">{produto.qtde || produto.quantidade}</td>
                  <td className="px-2 md:px-3 py-2 text-xs md:text-sm text-center hidden sm:table-cell">{produto.un || produto.unidade}</td>
                  <td className="px-2 md:px-3 py-2 text-xs md:text-sm hidden lg:table-cell">
                    {produto.prazo_entrega || produto.prazoEntrega || '-'}
                  </td>
                  <td className="px-2 md:px-3 py-2 text-xs md:text-sm hidden xl:table-cell">
                    {formatarValor(produto.ult_valor_aprovado || produto.ultimo_valor_aprovado_saving || produto.ultimoValorAprovado) || '-'}
                  </td>
                  <td className="px-2 md:px-3 py-2 text-xs md:text-sm hidden xl:table-cell">
                    {produto.ult_fornecedor_aprovado || produto.ultimo_fornecedor_aprovado_saving || produto.ultimoFornecedorAprovado || '-'}
                  </td>
                  <td className="px-2 md:px-3 py-2 text-xs md:text-sm hidden xl:table-cell">
                    {formatarValor(produto.valor_anterior || produto.valorAnterior) || '-'}
                  </td>
                  <td className="px-2 md:px-3 py-2 text-xs md:text-sm font-semibold text-green-600">
                    {formatarValor(produto.valor_unitario || produto.valorUnitario)}
                  </td>
                  <td className="px-2 md:px-3 py-2 text-xs md:text-sm hidden md:table-cell">
                    {formatarValor(produto.difal)}
                  </td>
                  <td className="px-2 md:px-3 py-2 text-xs md:text-sm hidden md:table-cell">
                    {formatarValor(produto.ipi)}
                  </td>
                  <td className="px-2 md:px-3 py-2 text-xs md:text-sm hidden lg:table-cell">
                    {produto.data_entrega_fn || produto.dataEntregaFn || '-'}
                  </td>
                  <td className="px-2 md:px-3 py-2 text-xs md:text-sm font-semibold text-green-600">
                    {(() => {
                      const qtde = parseFloat(produto.qtde || produto.quantidade) || 0;
                      const valorUnit = parseFloat(produto.valor_unitario || produto.valorUnitario) || 0;
                      const difal = parseFloat(produto.difal) || 0;
                      const ipi = parseFloat(produto.ipi) || 0;
                      const valorComImpostos = valorUnit * (1 + (difal / 100)) + ipi;
                      const totalCalculado = qtde * valorComImpostos;
                      return formatarValor(totalCalculado);
                    })()}
                    {/* Info adicional no mobile/tablet */}
                    <div className="md:hidden text-xs text-gray-500 mt-1 space-y-1">
                      <div>Difal: {formatarValor(produto.difal)}</div>
                      <div>IPI: {formatarValor(produto.ipi)}</div>
                      {(produto.data_entrega_fn || produto.dataEntregaFn) && (
                        <div>Data Fn: {produto.data_entrega_fn || produto.dataEntregaFn}</div>
                      )}
                      {(produto.ult_valor_aprovado || produto.ultimo_valor_aprovado_saving || produto.ultimoValorAprovado) && (
                        <div>Ult. Vlr. Aprovado: {formatarValor(produto.ult_valor_aprovado || produto.ultimo_valor_aprovado_saving || produto.ultimoValorAprovado)}</div>
                      )}
                      {(produto.ult_fornecedor_aprovado || produto.ultimo_fornecedor_aprovado_saving || produto.ultimoFornecedorAprovado) && (
                        <div>Ult. Fornecedor: {produto.ult_fornecedor_aprovado || produto.ultimo_fornecedor_aprovado_saving || produto.ultimoFornecedorAprovado}</div>
                      )}
                      {(produto.valor_anterior || produto.valorAnterior) && (
                        <div>Valor Anterior: {formatarValor(produto.valor_anterior || produto.valorAnterior)}</div>
                      )}
                    </div>
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

export default FornecedorProdutosTable;
