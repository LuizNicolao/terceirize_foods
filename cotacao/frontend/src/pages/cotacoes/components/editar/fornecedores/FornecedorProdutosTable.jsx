import React from 'react';

const FornecedorProdutosTable = ({
  fornecedor,
  produtos,
  searchProduto,
  setSearchProduto,
  melhorPrecoPorProduto,
  updateProdutoFornecedor,
  removeProduto,
  calcularValorComDifalEFrete
}) => {
  const formatarValor = (valor) => {
    if (valor === 0 || valor === '') return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const filteredProdutos = fornecedor.produtos.filter(produto => {
    // Verificar se o produto tem nome antes de chamar toLowerCase
    const produtoNome = produto.nome || produto.produto_nome || produto.descricao || '';
    return produtoNome.toLowerCase().includes(searchProduto.toLowerCase());
  });

  return (
    <div className="mt-6">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">
        Produtos do Fornecedor
      </h4>
      
      {/* Barra de pesquisa de produtos */}
      <div className="mb-4">
        <div className="relative max-w-md">
                      <input
              type="text"
              placeholder="🔍 Pesquisar produto..."
              value={searchProduto}
              onChange={(e) => setSearchProduto(e.target.value)}
              className="w-full px-3 py-1.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
            />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-max">
          <thead>
            <tr className="bg-green-500 text-white">
              <th className="px-2 md:px-3 py-2 text-left font-semibold text-xs md:text-sm">Produto</th>
              <th className="px-2 md:px-3 py-2 text-left font-semibold text-xs md:text-sm">Qtd</th>
              <th className="px-2 md:px-3 py-2 text-left font-semibold text-xs md:text-sm hidden sm:table-cell">UN</th>
              <th className="px-2 md:px-3 py-2 text-left font-semibold text-xs md:text-sm hidden lg:table-cell">Prazo Entrega</th>
              <th className="px-2 md:px-3 py-2 text-center font-semibold text-xs md:text-sm hidden xl:table-cell">Ult. Vlr. Aprovado</th>
              <th className="px-2 md:px-3 py-2 text-center font-semibold text-xs md:text-sm hidden xl:table-cell">Ult. Fornecedor Aprovado</th>
              <th className="px-2 md:px-3 py-2 text-center font-semibold text-xs md:text-sm hidden xl:table-cell">Valor Anterior</th>
              <th className="px-2 md:px-3 py-2 text-center font-semibold text-xs md:text-sm">Valor Unit.</th>
              <th className="px-2 md:px-3 py-2 text-center font-semibold text-xs md:text-sm hidden md:table-cell">Difal</th>
              <th className="px-2 md:px-3 py-2 text-center font-semibold text-xs md:text-sm hidden md:table-cell">IPI</th>
              <th className="px-2 md:px-3 py-2 text-center font-semibold text-xs md:text-sm hidden lg:table-cell">Data Entrega Fn</th>
              <th className="px-2 md:px-3 py-2 text-center font-semibold text-xs md:text-sm">Total</th>
              <th className="px-2 md:px-3 py-2 text-center font-semibold text-xs md:text-sm">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredProdutos.map((produto) => {
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
                    </div>
                    {/* Info mobile */}
                    <div className="sm:hidden text-xs text-gray-500 mt-1">
                      UN: {produto.un || produto.unidade} | Qtd: {produto.qtde || produto.quantidade}
                      {(produto.prazo_entrega || produto.prazoEntrega) && (
                        <div>Prazo: {produto.prazo_entrega || produto.prazoEntrega}</div>
                      )}
                      {(produto.ult_valor_aprovado || produto.ultimo_valor_aprovado_saving || produto.ultimoValorAprovado) && (
                        <div>Ult. Vlr. Aprovado: R$ {produto.ult_valor_aprovado || produto.ultimo_valor_aprovado_saving || produto.ultimoValorAprovado}</div>
                      )}
                      {(produto.ult_fornecedor_aprovado || produto.ultimo_fornecedor_aprovado_saving || produto.ultimoFornecedorAprovado) && (
                        <div>Ult. Fornecedor: {produto.ult_fornecedor_aprovado || produto.ultimo_fornecedor_aprovado_saving || produto.ultimoFornecedorAprovado}</div>
                      )}
                      {(produto.valor_anterior || produto.valorAnterior) && (
                        <div>Valor Anterior: R$ {produto.valor_anterior || produto.valorAnterior}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-2 md:px-3 py-2 text-xs md:text-sm text-center">{produto.qtde || produto.quantidade}</td>
                  <td className="px-2 md:px-3 py-2 text-xs md:text-sm text-center hidden sm:table-cell">{produto.un || produto.unidade}</td>
                  <td className="px-2 md:px-3 py-2 hidden lg:table-cell">
                    <span className="px-2 py-1 text-gray-700 text-xs md:text-sm">
                      {produto.prazo_entrega || produto.prazoEntrega || '-'}
                    </span>
                  </td>
                  <td className="px-2 md:px-3 py-2 hidden xl:table-cell text-center">
                    <span className="px-2 py-1 text-gray-700 text-xs md:text-sm">
                      {formatarValor(produto.ult_valor_aprovado || produto.ultimo_valor_aprovado_saving || produto.ultimoValorAprovado) || '-'}
                    </span>
                  </td>
                  <td className="px-2 md:px-3 py-2 hidden xl:table-cell text-center">
                    <span className="px-2 py-1 text-gray-700 text-xs md:text-sm">
                      {produto.ult_fornecedor_aprovado || produto.ultimo_fornecedor_aprovado_saving || produto.ultimoFornecedorAprovado || '-'}
                    </span>
                  </td>
                  <td className="px-2 md:px-3 py-2 hidden xl:table-cell text-center">
                    <span className="px-2 py-1 text-gray-700 text-xs md:text-sm">
                      {produto.valor_anterior !== null && produto.valor_anterior !== undefined && produto.valor_anterior !== 0 ? formatarValor(produto.valor_anterior) : '-'}
                    </span>
                  </td>
                  <td className="px-2 md:px-3 py-2 text-center">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={produto.valor_unitario || produto.valorUnitario || 0}
                      onChange={(e) => updateProdutoFornecedor(fornecedor.id, produto.id, 'valorUnitario', parseFloat(e.target.value) || 0)}
                      placeholder="R$"
                      className="w-16 md:w-20 px-1 py-0.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 text-center"
                    />
                  </td>
                  <td className="px-2 md:px-3 py-2 hidden md:table-cell text-center">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={produto.difal || 0}
                      onChange={(e) => updateProdutoFornecedor(fornecedor.id, produto.id, 'difal', parseFloat(e.target.value) || 0)}
                      placeholder="R$"
                      className="w-14 md:w-16 px-1 py-0.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 text-center"
                    />
                  </td>
                  <td className="px-2 md:px-3 py-2 hidden md:table-cell text-center">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={produto.ipi || 0}
                      onChange={(e) => updateProdutoFornecedor(fornecedor.id, produto.id, 'ipi', parseFloat(e.target.value) || 0)}
                      placeholder="R$"
                      className="w-14 md:w-16 px-1 py-0.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 text-center"
                    />
                  </td>
                  <td className="px-2 md:px-3 py-2 hidden lg:table-cell text-center">
                    <input
                      type="text"
                      value={produto.data_entrega_fn || produto.dataEntregaFn || ''}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
                        
                        // Aplica a máscara dd/mm/yyyy
                        if (value.length <= 2) {
                          value = value;
                        } else if (value.length <= 4) {
                          value = value.substring(0, 2) + '/' + value.substring(2);
                        } else if (value.length <= 8) {
                          value = value.substring(0, 2) + '/' + value.substring(2, 4) + '/' + value.substring(4, 8);
                        } else {
                          value = value.substring(0, 2) + '/' + value.substring(2, 4) + '/' + value.substring(4, 8);
                        }
                        
                        updateProdutoFornecedor(fornecedor.id, produto.id, 'dataEntregaFn', value);
                      }}
                      placeholder="dd/mm/yyyy"
                      maxLength={10}
                      className="w-20 md:w-24 px-1 py-0.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 text-center"
                    />
                  </td>
                  <td className="px-2 md:px-3 py-2 font-semibold text-green-600 text-xs md:text-sm text-center">
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
                      <div>Difal: R$ {produto.difal || 0}</div>
                      <div>IPI: R$ {produto.ipi || 0}</div>
                      {(produto.data_entrega_fn || produto.dataEntregaFn) && (
                        <div>Data Fn: {produto.data_entrega_fn || produto.dataEntregaFn}</div>
                      )}
                      {(produto.ult_valor_aprovado || produto.ultimo_valor_aprovado_saving || produto.ultimoValorAprovado) && (
                        <div>Ult. Vlr. Aprovado: R$ {produto.ult_valor_aprovado || produto.ultimo_valor_aprovado_saving || produto.ultimoValorAprovado}</div>
                      )}
                      {(produto.ult_fornecedor_aprovado || produto.ultimo_fornecedor_aprovado_saving || produto.ultimoFornecedorAprovado) && (
                        <div>Ult. Fornecedor: {produto.ult_fornecedor_aprovado || produto.ultimo_fornecedor_aprovado_saving || produto.ultimoFornecedorAprovado}</div>
                      )}
                      {(produto.valor_anterior || produto.valorAnterior) && (
                        <div>Valor Anterior: R$ {produto.valor_anterior || produto.valorAnterior}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-2 md:px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeProduto(fornecedor.id, produto.id)}
                      className="w-5 h-5 md:w-6 md:h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
                    >
                      ✕
                    </button>
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
