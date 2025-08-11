import React from 'react';
import { FaBuilding, FaBox, FaDollarSign, FaTruck, FaCreditCard } from 'react-icons/fa';
import { formatCurrency } from '../../utils/formatters';

const VisualizacaoPadrao = ({ cotacao, active }) => {
  if (!active || !cotacao) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Visualização Padrão - Cotação #{cotacao.id}
      </h3>

      {/* Fornecedores */}
      {cotacao.fornecedores && cotacao.fornecedores.length > 0 && (
        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <FaBuilding />
            Fornecedores ({cotacao.fornecedores.length})
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cotacao.fornecedores.map((fornecedor, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h5 className="font-medium text-gray-900">{fornecedor.nome}</h5>
                  <span className="text-sm text-gray-500">#{index + 1}</span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <FaDollarSign className="text-green-500" />
                    <span className="text-gray-600">Valor Total:</span>
                    <span className="font-medium">{formatCurrency(fornecedor.valor_total)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <FaTruck className="text-blue-500" />
                    <span className="text-gray-600">Prazo Entrega:</span>
                    <span className="font-medium">{fornecedor.prazo_entrega} dias</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <FaCreditCard className="text-purple-500" />
                    <span className="text-gray-600">Prazo Pagamento:</span>
                    <span className="font-medium">{fornecedor.prazo_pagamento} dias</span>
                  </div>
                </div>

                {/* Produtos do Fornecedor */}
                {fornecedor.produtos && fornecedor.produtos.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <h6 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FaBox />
                      Produtos ({fornecedor.produtos.length})
                    </h6>
                    
                    <div className="space-y-2">
                      {fornecedor.produtos.map((produto, prodIndex) => (
                        <div key={prodIndex} className="bg-gray-50 p-2 rounded text-xs">
                          <div className="font-medium text-gray-900 mb-1">
                            {produto.nome}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-gray-600">
                            <div>
                              <span className="text-gray-500">Qtd:</span>
                              <span className="ml-1">{produto.qtde} {produto.un}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Valor:</span>
                              <span className="ml-1">{formatCurrency(produto.valor_unitario)}</span>
                            </div>
                          </div>
                          {produto.observacoes && (
                            <div className="mt-1 text-gray-500 italic">
                              Obs: {produto.observacoes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resumo */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-lg font-medium text-gray-900 mb-3">Resumo da Cotação</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {cotacao.fornecedores?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Fornecedores</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {(() => {
                const totalProdutos = cotacao.fornecedores?.reduce((total, f) => 
                  total + (f.produtos?.length || 0), 0) || 0;
                return totalProdutos;
              })()}
            </div>
            <div className="text-sm text-gray-600">Produtos</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {(() => {
                const totalQuantidade = cotacao.fornecedores?.reduce((total, f) => {
                  return total + (f.produtos?.reduce((sum, p) => sum + (parseFloat(p.qtde) || 0), 0) || 0);
                }, 0) || 0;
                return totalQuantidade.toFixed(2);
              })()}
            </div>
            <div className="text-sm text-gray-600">Quantidade Total</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {(() => {
                const valorTotal = cotacao.fornecedores?.reduce((total, f) => 
                  total + (parseFloat(f.valor_total) || 0), 0) || 0;
                return formatCurrency(valorTotal);
              })()}
            </div>
            <div className="text-sm text-gray-600">Valor Total</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizacaoPadrao; 