import React from 'react';
import { FaDollarSign, FaTruck, FaCreditCard, FaCheck } from 'react-icons/fa';

const ComparativoProdutos = ({ cotacao, active, formatarValor }) => {
  if (!active || !cotacao?.itens) {
    return null;
  }

  // Função para formatar números
  const formatarNumero = (valor) => {
    if (!valor) return '0,00';
    return parseFloat(valor).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Função para extrair dias de prazo
  const extrairDias = (prazo) => {
    if (!prazo) return 999;
    const match = prazo.toString().match(/\d+/);
    return match ? parseInt(match[0]) : 999;
  };

  // Função para contar opções de pagamento
  const contarOpcoesPagamento = (prazo) => {
    if (!prazo) return 0;
    return prazo.toString().split('/').length;
  };

  // Agrupar itens por produto_nome
  const itensPorProduto = {};
  cotacao.itens.forEach(item => {
    const key = item.produto_nome;
    if (!itensPorProduto[key]) {
      itensPorProduto[key] = {
        nome: item.produto_nome,
        unidade: item.unidade_medida || 'UN',
        itens: []
      };
    }
    itensPorProduto[key].itens.push(item);
  });

  // Processar cada grupo de produtos
  const produtosProcessados = Object.values(itensPorProduto).map(grupo => {
    const itens = grupo.itens;
    
    // Encontrar melhor preço
    const itensPorPreco = [...itens].sort((a, b) => {
      const valorA = parseFloat(a.valor_unitario) || 0;
      const valorB = parseFloat(b.valor_unitario) || 0;
      return valorA - valorB;
    });
    const melhorPreco = parseFloat(itensPorPreco[0].valor_unitario);
    
    // Filtrar todos os itens com o melhor preço
    const itensComMelhorPreco = itens.filter(item => 
      Math.abs(parseFloat(item.valor_unitario) - melhorPreco) < 0.0001
    );
    
    // Encontrar melhor prazo de entrega
    const itensComPrazoEntrega = itens.filter(item => item.prazo_entrega && item.prazo_entrega.toString().trim() !== '');
    const itensPorPrazoEntrega = itensComPrazoEntrega.length > 0 ? 
      [...itensComPrazoEntrega].sort((a, b) => {
        const diasA = extrairDias(a.prazo_entrega);
        const diasB = extrairDias(b.prazo_entrega);
        return diasA - diasB;
      }) : [];
    const melhorPrazoEntrega = itensPorPrazoEntrega.length > 0 ? itensPorPrazoEntrega[0] : null;
    
    // Encontrar melhor prazo de pagamento
    const itensComPrazoPagamento = itens.filter(item => item.prazo_pagamento && item.prazo_pagamento.toString().trim() !== '');
    const itensPorPrazoPagamento = itensComPrazoPagamento.length > 0 ?
      [...itensComPrazoPagamento].sort((a, b) => {
        const opcoesA = contarOpcoesPagamento(a.prazo_pagamento);
        const opcoesB = contarOpcoesPagamento(b.prazo_pagamento);
        return opcoesB - opcoesA; // Ordem decrescente (mais opções é melhor)
      }) : [];
    const melhorPrazoPagamento = itensComPrazoPagamento.length > 0 ? itensPorPrazoPagamento[0] : null;

    return {
      grupo,
      itensComMelhorPreco,
      melhorPrazoEntrega,
      melhorPrazoPagamento,
      itensComMelhorPrazoEntrega: melhorPrazoEntrega ? itensComPrazoEntrega.filter(item => {
        const diasItem = extrairDias(item.prazo_entrega);
        const diasMelhor = extrairDias(melhorPrazoEntrega.prazo_entrega);
        return diasItem === diasMelhor;
      }) : []
    };
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Comparativo</h3>
      
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Un</th>
              <th colSpan="2" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-50">
                <div className="flex items-center justify-center gap-1">
                  <FaDollarSign className="w-3 h-3 text-green-600" />
                  Melhor Preço
                </div>
              </th>
              <th colSpan="2" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50">
                <div className="flex items-center justify-center gap-1">
                  <FaTruck className="w-3 h-3 text-blue-600" />
                  Melhor Prazo Entrega
                </div>
              </th>
              <th colSpan="2" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-purple-50">
                <div className="flex items-center justify-center gap-1">
                  <FaCreditCard className="w-3 h-3 text-purple-600" />
                  Melhor Prazo Pagamento
                </div>
              </th>
            </tr>
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-50">Valor</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-50">Fornecedor</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50">Prazo</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50">Fornecedor</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-purple-50">Prazo</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-purple-50">Fornecedor</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
            {produtosProcessados.map((processado, index) => {
              const { grupo, itensComMelhorPreco, melhorPrazoEntrega, melhorPrazoPagamento, itensComMelhorPrazoEntrega } = processado;
              
              // Renderizar linhas para melhor preço
              const linhas = [];
              
              itensComMelhorPreco.forEach(item => {
                linhas.push({
                  tipo: 'melhor-preco',
                  produto: grupo.nome,
                  quantidade: parseFloat(item.quantidade).toFixed(2),
                  unidade: grupo.unidade,
                  valorPreco: formatarValor ? formatarValor(item.valor_unitario) : `R$ ${formatarNumero(item.valor_unitario)}`,
                  fornecedorPreco: item.fornecedor_nome,
                  prazoEntrega: item.prazo_entrega || '-',
                  fornecedorEntrega: item.fornecedor_nome,
                  prazoPagamento: item.prazo_pagamento || '-',
                  fornecedorPagamento: item.fornecedor_nome
                });
              });
              
              // Adicionar linhas para melhor prazo de entrega (se diferente do melhor preço)
              if (melhorPrazoEntrega) {
                itensComMelhorPrazoEntrega.forEach(item => {
                  if (!itensComMelhorPreco.some(i => i.fornecedor_nome === item.fornecedor_nome)) {
                    linhas.push({
                      tipo: 'melhor-entrega',
                      produto: grupo.nome,
                      quantidade: parseFloat(item.quantidade).toFixed(2),
                      unidade: grupo.unidade,
                      valorPreco: '-',
                      fornecedorPreco: '-',
                      prazoEntrega: item.prazo_entrega,
                      fornecedorEntrega: item.fornecedor_nome,
                      prazoPagamento: item.prazo_pagamento || '-',
                      fornecedorPagamento: item.fornecedor_nome
                    });
                  }
                });
              }
              
              return linhas.map((linha, linhaIndex) => (
                <tr key={`${index}-${linhaIndex}`} className={`hover:bg-gray-50 ${
                  linha.tipo === 'melhor-preco' ? 'bg-green-50' : 
                  linha.tipo === 'melhor-entrega' ? 'bg-blue-50' : ''
                }`}>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {linha.produto}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    {linha.quantidade}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    {linha.unidade}
                  </td>
                  <td className={`px-3 py-2 whitespace-nowrap text-sm font-semibold ${
                    linha.tipo === 'melhor-preco' ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {linha.valorPreco}
                  </td>
                  <td className={`px-3 py-2 whitespace-nowrap text-sm ${
                    linha.tipo === 'melhor-preco' ? 'font-medium text-gray-900' : 'text-gray-500'
                  }`}>
                    {linha.fornecedorPreco}
                      </td>
                  <td className={`px-3 py-2 whitespace-nowrap text-sm font-semibold ${
                    linha.tipo === 'melhor-preco' || linha.tipo === 'melhor-entrega' ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {linha.prazoEntrega}
                      </td>
                  <td className={`px-3 py-2 whitespace-nowrap text-sm ${
                    linha.tipo === 'melhor-preco' || linha.tipo === 'melhor-entrega' ? 'font-medium text-gray-900' : 'text-gray-500'
                  }`}>
                    {linha.fornecedorEntrega}
                      </td>
                  <td className={`px-3 py-2 whitespace-nowrap text-sm font-semibold ${
                    linha.tipo === 'melhor-preco' || linha.tipo === 'melhor-entrega' ? 'text-purple-600' : 'text-gray-500'
                  }`}>
                    {linha.prazoPagamento}
                      </td>
                  <td className={`px-3 py-2 whitespace-nowrap text-sm ${
                    linha.tipo === 'melhor-preco' || linha.tipo === 'melhor-entrega' ? 'font-medium text-gray-900' : 'text-gray-500'
                  }`}>
                    {linha.fornecedorPagamento}
                      </td>
                    </tr>
              ));
            })}
                </tbody>
              </table>
            </div>
      
      {Object.keys(itensPorProduto).length === 0 && (
        <div className="text-center py-4 text-gray-500">
          Nenhum produto encontrado para comparação
          </div>
      )}
    </div>
  );
};

export default ComparativoProdutos; 