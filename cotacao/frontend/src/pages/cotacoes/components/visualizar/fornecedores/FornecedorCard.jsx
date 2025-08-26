import React from 'react';
import { FaBuilding } from 'react-icons/fa';
import FornecedorProdutosTable from './FornecedorProdutosTable';

const FornecedorCard = ({
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

  // Calcular valor total do fornecedor
  const calcularValorTotalFornecedor = () => {
    const valorTotalProdutos = fornecedor.produtos.reduce((total, produto) => {
      const qtde = parseFloat(produto.qtde || produto.quantidade) || 0;
      const valorUnit = parseFloat(produto.valor_unitario || produto.valorUnitario) || 0;
      const difal = parseFloat(produto.difal) || 0;
      const ipi = parseFloat(produto.ipi) || 0;
      const valorComImpostos = valorUnit * (1 + (difal / 100)) + ipi;
      return total + (qtde * valorComImpostos);
    }, 0);

    const frete = parseFloat(fornecedor.valor_frete || fornecedor.valorFrete || 0);
    
    return valorTotalProdutos + frete;
  };

  const valorTotal = calcularValorTotalFornecedor();

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      {/* Header do Fornecedor */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b-2 border-green-500">
        <h3 className="text-lg font-semibold text-gray-800">
          {fornecedor.nome}
        </h3>
        {fornecedor.produtos && fornecedor.produtos.length > 0 && (
          <span className="text-sm font-semibold text-green-600">
            Total: {formatarValor(valorTotal)}
          </span>
        )}
      </div>

      {/* Informações do Fornecedor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col gap-2">
          <label className="text-gray-600 text-sm font-semibold uppercase tracking-wide flex items-center gap-2">
            <FaBuilding className="text-gray-400" />
            Nome do Fornecedor *
          </label>
          <span className="text-gray-800 text-base font-medium">
            {fornecedor.nome}
          </span>
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
            Prazo de Pagamento
          </label>
          <span className="text-gray-800 text-base font-medium">
            {fornecedor.prazo_pagamento || fornecedor.prazoPagamento || '-'}
          </span>
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
            Tipo de Frete
          </label>
          <span className="text-gray-800 text-base font-medium">
            {fornecedor.tipo_frete || fornecedor.tipoFrete || '-'}
          </span>
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-gray-600 text-sm font-semibold uppercase tracking-wide">
            Valor do Frete
          </label>
          <span className="text-gray-800 text-base font-medium">
            {formatarValor(fornecedor.valor_frete || fornecedor.valorFrete || 0)}
          </span>
        </div>
      </div>
      
      {/* Produtos do Fornecedor */}
      {fornecedor.produtos && fornecedor.produtos.length > 0 && (
        <FornecedorProdutosTable
          fornecedor={fornecedor}
          melhorPrecoPorProduto={melhorPrecoPorProduto}
          calcularValorComDifalEFrete={calcularValorComDifalEFrete}
        />
      )}
    </div>
  );
};

export default FornecedorCard;
