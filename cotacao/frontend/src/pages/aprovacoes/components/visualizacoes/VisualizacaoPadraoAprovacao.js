import React, { useEffect } from 'react';

const VisualizacaoPadrao = ({ cotacao, active, formatarValor, produtoDestacado }) => {
  // Ref para scroll automático
  const fornecedorRefs = React.useRef({});
  
  // Efeito para scroll automático quando produto for destacado
  useEffect(() => {
    if (produtoDestacado && produtoDestacado.fornecedor && fornecedorRefs.current[produtoDestacado.fornecedor]) {
      const fornecedorElement = fornecedorRefs.current[produtoDestacado.fornecedor];
      fornecedorElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  }, [produtoDestacado]);

  if (!active || !cotacao?.itens) {
    return null;
  }

  // Função para calcular valor unitário com DIFAL/IPI e frete
  const calcularValorUnitarioComDifalIpiEFrete = (item, fornecedor) => {
    const valorUnitario = parseFloat(item.valor_unitario) || 0;
    const difalPercentual = parseFloat(fornecedor.difal || 0);
    const ipiPercentual = parseFloat(fornecedor.ipi || 0);
    const freteTotalFornecedor = parseFloat(fornecedor.frete || 0);
    
    // Calcular DIFAL por unidade
    const difalUnitario = (valorUnitario * difalPercentual) / 100;
    
    // Calcular IPI por unidade
    const ipiUnitario = (valorUnitario * ipiPercentual) / 100;
    
    // Calcular valor total de produtos para determinar proporções
    let valorTotalProdutos = 0;
    fornecedor.itens.forEach(i => {
      const qtd = parseFloat(i.quantidade) || 0;
      const val = parseFloat(i.valor_unitario) || 0;
      valorTotalProdutos += qtd * val;
    });
    
    // Calcular a proporção deste item no total
    const quantidade = parseFloat(item.quantidade) || 0;
    const proporcaoItem = valorTotalProdutos > 0 ? 
      ((quantidade * valorUnitario) / valorTotalProdutos) : 0;
    
    // Calcular o frete proporcional para este item
    const freteProporcionalItem = freteTotalFornecedor * proporcaoItem;
    
    // Calcular o frete por unidade
    const fretePorUnidade = quantidade > 0 ? freteProporcionalItem / quantidade : 0;
    
    // Retornar o valor unitário com DIFAL, IPI e frete
    return valorUnitario + difalUnitario + ipiUnitario + fretePorUnidade;
  };

  // Função para formatar número
  const formatarNumero = (valor) => {
    if (valor === null || valor === undefined || isNaN(parseFloat(valor))) {
      return '0,000';
    }
    return parseFloat(valor).toFixed(4).replace('.', ',');
  };

  // Agrupar itens por fornecedor
  const itensPorFornecedor = {};
  cotacao.itens.forEach(item => {
    const fornecedorNome = item.fornecedor_nome;
    if (!itensPorFornecedor[fornecedorNome]) {
      itensPorFornecedor[fornecedorNome] = {
        nome: fornecedorNome,
        prazo_pagamento: item.prazo_pagamento,
        frete: parseFloat(item.frete || 0),
        difal: parseFloat(item.difal || 0),
        ipi: parseFloat(item.ipi || 0),
        itens: []
      };
    }
    itensPorFornecedor[fornecedorNome].itens.push(item);
  });

  // Calcular valor total por fornecedor
  Object.values(itensPorFornecedor).forEach(fornecedor => {
    fornecedor.valorTotal = fornecedor.itens.reduce((total, item) => {
      const quantidade = parseFloat(item.quantidade) || 0;
      const valorUnitarioComDifalIpiEFrete = calcularValorUnitarioComDifalIpiEFrete(item, fornecedor);
      return total + (quantidade * valorUnitarioComDifalIpiEFrete);
    }, 0);
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <i className="fas fa-list mr-2 text-blue-600"></i>
          Visualização Padrão
        </h3>
      </div>

      <div className="space-y-6">
        {Object.values(itensPorFornecedor).map((fornecedor, fornecedorIndex) => {
          // Verificar se este fornecedor contém o produto destacado
          const isFornecedorDestacado = produtoDestacado && 
            produtoDestacado.fornecedor === fornecedor.nome;
          
          return (
            <div 
              key={fornecedorIndex} 
              ref={el => fornecedorRefs.current[fornecedor.nome] = el}
              className={`border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
                isFornecedorDestacado ? 'fornecedor-destacado ring-2 ring-yellow-400 ring-opacity-50' : ''
              }`}
            >
            {/* Header do Fornecedor */}
            <div className={`border-b border-gray-200 p-4 ${
              isFornecedorDestacado 
                ? 'bg-gradient-to-r from-yellow-50 to-orange-50' 
                : 'bg-gradient-to-r from-blue-50 to-indigo-50'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-bold text-gray-800 flex items-center">
                  {isFornecedorDestacado && (
                    <span className="mr-2 text-yellow-600 animate-pulse">
                      <i className="fas fa-star"></i>
                    </span>
                  )}
                  <i className="fas fa-building mr-2 text-blue-600"></i>
                  {fornecedor.nome}
                </h4>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">
                    Fornecedor {fornecedorIndex + 1}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <div className="text-xs text-gray-500 font-medium mb-1">Pagamento</div>
                  <div className="text-sm font-semibold text-gray-800">
                    {fornecedor.prazo_pagamento || 'N/A'}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <div className="text-xs text-gray-500 font-medium mb-1">Frete</div>
                  <div className="text-sm font-semibold text-gray-800">
                    R$ {formatarNumero(fornecedor.frete)}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="text-xs text-gray-500 font-medium mb-1">Valor Total</div>
                  <div className="text-sm font-bold text-green-700">
                    R$ {formatarNumero(fornecedor.valorTotal)}
                  </div>
                </div>
              </div>
            </div>
            
            {fornecedor.itens && fornecedor.itens.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <i className="fas fa-box mr-1"></i>Produto
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <i className="fas fa-sort-numeric-up mr-1"></i>Qtd
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <i className="fas fa-ruler mr-1"></i>UN
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <i className="fas fa-truck mr-1"></i>Prazo Entrega
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <i className="fas fa-history mr-1"></i>Ult. Vlr. Aprovado
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <i className="fas fa-check-circle mr-1"></i>Ult. Fn. Aprovado
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <i className="fas fa-chart-line mr-1"></i>Valor Anterior
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <i className="fas fa-dollar-sign mr-1"></i>Valor Unit.
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <i className="fas fa-percentage mr-1"></i>DIFAL/IPI
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <i className="fas fa-calculator mr-1"></i>Valor Unit. + DIFAL/IPI/Frete
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <i className="fas fa-calendar mr-1"></i>Data Entrega Fn
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <i className="fas fa-coins mr-1"></i>Total
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <i className="fas fa-chart-bar mr-1"></i>Vlr Total Ult Aprv
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <i className="fas fa-percentage mr-1"></i>Variação % Total
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <i className="fas fa-exchange-alt mr-1"></i>Variação R$ Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {fornecedor.itens.map((item, itemIndex) => {
                      const quantidade = parseFloat(item.quantidade) || 0;
                      const valorUnitario = parseFloat(item.valor_unitario) || 0;
                      const valorUnitarioComDifalIpiEFrete = calcularValorUnitarioComDifalIpiEFrete(item, fornecedor);
                      const valorItemTotal = quantidade * valorUnitarioComDifalIpiEFrete;
                      
                      // Calcular variações
                      let variacao = 0;
                      let variacaoClass = 'text-gray-600';
                      let variacaoTexto = '0%';
                      let variacaoReais = 'R$ 0,00';
                      let variacaoReaisClass = 'text-gray-600';

                      if (item.ultimo_valor_aprovado_saving && parseFloat(item.ultimo_valor_aprovado_saving) > 0) {
                        const ultimoValorAprovado = parseFloat(item.ultimo_valor_aprovado_saving);
                        const valorTotalUltimo = ultimoValorAprovado * quantidade;
                        
                        // Calcular variação percentual
                        variacao = ((valorItemTotal - valorTotalUltimo) / valorTotalUltimo) * 100;
                        const variacaoValor = valorItemTotal - valorTotalUltimo;

                        if (variacao > 0) {
                          variacaoClass = 'text-red-600 font-semibold';
                          variacaoTexto = `+${variacao.toFixed(2)}%`;
                          variacaoReaisClass = 'text-red-600 font-semibold';
                          variacaoReais = `+R$ ${formatarNumero(Math.abs(variacaoValor))}`;
                        } else if (variacao < 0) {
                          variacaoClass = 'text-green-600 font-semibold';
                          variacaoTexto = `${variacao.toFixed(2)}%`;
                          variacaoReaisClass = 'text-green-600 font-semibold';
                          variacaoReais = `-R$ ${formatarNumero(Math.abs(variacaoValor))}`;
                        } else {
                          variacaoReais = 'R$ 0,00';
                        }
                      } else {
                        variacaoTexto = 'N/A';
                        variacaoReais = 'N/A';
                      }

                      // Badge de rodadas (se disponível)
                      const numRodadas = item.rodadas ? parseInt(item.rodadas) : 0;
                      let rodadasBadge = null;
                      if (numRodadas > 0) {
                        let rodadasClass = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-bold text-white';
                        if (numRodadas >= 3) {
                          rodadasClass += ' bg-red-500';
                        } else if (numRodadas >= 2) {
                          rodadasClass += ' bg-orange-500';
                        } else {
                          rodadasClass += ' bg-blue-500';
                        }
                        
                        rodadasBadge = (
                          <span className={rodadasClass} title={`${numRodadas} rodada${numRodadas > 1 ? 's' : ''} de renegociação`}>
                            <i className="fas fa-sync-alt mr-1"></i>
                            {numRodadas}
                          </span>
                        );
                      }

                      // Verificar se este produto deve ser destacado
                      const isProdutoDestacado = produtoDestacado && 
                        produtoDestacado.produto === item.produto_nome && 
                        produtoDestacado.fornecedor === fornecedor.nome;
                      
                      return (
                        <tr 
                          key={itemIndex} 
                          className={`hover:bg-gray-50 transition-colors ${
                            isProdutoDestacado 
                              ? 'produto-destacado bg-yellow-100 border-l-4 border-yellow-500' 
                              : ''
                          }`}
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                              {isProdutoDestacado && (
                                <span className="mr-2 text-yellow-600 animate-pulse">
                                  <i className="fas fa-star"></i>
                                </span>
                              )}
                              {item.produto_nome}
                              {rodadasBadge}
                            </div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {quantidade.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                            {item.unidade_medida || 'UN'}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {item.prazo_entrega || 'Não informado'}
                            </span>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                            {item.ultimo_valor_aprovado_saving ? 
                              (formatarValor ? formatarValor(item.ultimo_valor_aprovado_saving) : `R$ ${formatarNumero(item.ultimo_valor_aprovado_saving)}`) : 
                              <span className="text-gray-400 italic">-</span>
                            }
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                            {item.ultimo_fornecedor_aprovado_saving || <span className="text-gray-400 italic">-</span>}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                            {item.valor_anterior ? `R$ ${formatarNumero(item.valor_anterior)}` : <span className="text-gray-400 italic">-</span>}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-center">
                            <span className="text-sm font-medium text-gray-900">
                              {formatarValor ? formatarValor(valorUnitario) : `R$ ${formatarNumero(valorUnitario)}`}
                            </span>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-center">
                            <div className="text-xs">
                              <div className="text-gray-600">
                                <span className="font-medium">DIFAL:</span> {fornecedor.difal}%
                              </div>
                              <div className="text-gray-600">
                                <span className="font-medium">IPI:</span> {fornecedor.ipi}%
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              R$ {formatarNumero(valorUnitarioComDifalIpiEFrete)}
                            </span>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                            {item.data_entrega_fn || <span className="text-gray-400 italic">-</span>}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                              R$ {formatarNumero(valorItemTotal)}
                            </span>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                            {item.ultimo_valor_aprovado_saving ? 
                              `R$ ${formatarNumero(parseFloat(item.ultimo_valor_aprovado_saving) * quantidade)}` : 
                              <span className="text-gray-400 italic">-</span>
                            }
                          </td>
                          <td className={`px-3 py-3 whitespace-nowrap text-sm ${variacaoClass} text-center`}>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              variacao > 0 ? 'bg-red-100 text-red-800' : 
                              variacao < 0 ? 'bg-green-100 text-green-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              <i className={`mr-1 ${variacao > 0 ? 'fas fa-arrow-up' : variacao < 0 ? 'fas fa-arrow-down' : 'fas fa-minus'}`}></i>
                              {variacaoTexto}
                            </span>
                          </td>
                          <td className={`px-3 py-3 whitespace-nowrap text-sm ${variacaoReaisClass} text-center`}>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              variacao > 0 ? 'bg-red-100 text-red-800' : 
                              variacao < 0 ? 'bg-green-100 text-green-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              <i className={`mr-1 ${variacao > 0 ? 'fas fa-arrow-up' : variacao < 0 ? 'fas fa-arrow-down' : 'fas fa-minus'}`}></i>
                              {variacaoReais}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-exclamation-triangle text-2xl mb-2 text-yellow-500"></i>
                <p>Nenhum produto encontrado para este fornecedor</p>
              </div>
                          )}
            </div>
          );
        })}
        </div>
    </div>
  );
};

export default VisualizacaoPadrao; 