import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash, FaCheck, FaTimes, FaInfoCircle } from 'react-icons/fa';
import { formatCurrency } from '../utils/formatters';

const AnalisarCotacao = ({ cotacao, onAprovar, onReprovar, onFinalizar }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedFornecedor, setSelectedFornecedor] = useState(null);

  useEffect(() => {
    if (cotacao && cotacao.fornecedores && cotacao.fornecedores.length > 0) {
      setSelectedFornecedor(cotacao.fornecedores[0]);
    }
  }, [cotacao]);

  if (!cotacao) {
    return (
      <div className="p-6 text-center text-gray-500">
        Nenhuma cotação selecionada
      </div>
    );
  }

  const handleFornecedorSelect = (fornecedor) => {
    setSelectedFornecedor(fornecedor);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'aprovada':
        return 'text-green-600 bg-green-100';
      case 'reprovada':
        return 'text-red-600 bg-red-100';
      case 'pendente':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Análise de Cotação
          </h2>
          <p className="text-gray-600">
            ID: {cotacao.id} - {cotacao.data_criacao}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(cotacao.status)}`}>
            {cotacao.status}
          </span>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            {showDetails ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Informações Gerais</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Solicitante:</span>
              <span className="ml-2 font-medium">{cotacao.solicitante}</span>
            </div>
            <div>
              <span className="text-gray-600">Departamento:</span>
              <span className="ml-2 font-medium">{cotacao.departamento}</span>
            </div>
            <div>
              <span className="text-gray-600">Prioridade:</span>
              <span className="ml-2 font-medium">{cotacao.prioridade}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Valores</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Total:</span>
              <span className="ml-2 font-medium text-lg">{formatCurrency(cotacao.valor_total)}</span>
            </div>
            <div>
              <span className="text-gray-600">Fornecedores:</span>
              <span className="ml-2 font-medium">{cotacao.fornecedores?.length || 0}</span>
            </div>
            <div>
              <span className="text-gray-600">Itens:</span>
              <span className="ml-2 font-medium">{cotacao.itens?.length || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Observações</h3>
          <p className="text-sm text-gray-700">
            {cotacao.observacoes || 'Nenhuma observação'}
          </p>
        </div>
      </div>

      {/* Fornecedores */}
      {cotacao.fornecedores && cotacao.fornecedores.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fornecedores</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cotacao.fornecedores.map((fornecedor, index) => (
              <div
                key={index}
                onClick={() => handleFornecedorSelect(fornecedor)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedFornecedor === fornecedor
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{fornecedor.nome}</h4>
                  <span className="text-sm text-gray-500">#{index + 1}</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-gray-600">Valor:</span>
                    <span className="ml-2 font-medium">{formatCurrency(fornecedor.valor_total)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Prazo:</span>
                    <span className="ml-2">{fornecedor.prazo_entrega} dias</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Pagamento:</span>
                    <span className="ml-2">{fornecedor.prazo_pagamento} dias</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detalhes do Fornecedor Selecionado */}
      {selectedFornecedor && showDetails && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Detalhes do Fornecedor: {selectedFornecedor.nome}
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Informações de Contato</h4>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-gray-600">CNPJ:</span>
                    <span className="ml-2">{selectedFornecedor.cnpj}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2">{selectedFornecedor.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Telefone:</span>
                    <span className="ml-2">{selectedFornecedor.telefone}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Condições Comerciais</h4>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-gray-600">Prazo de Entrega:</span>
                    <span className="ml-2">{selectedFornecedor.prazo_entrega} dias</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Prazo de Pagamento:</span>
                    <span className="ml-2">{selectedFornecedor.prazo_pagamento} dias</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Valor Total:</span>
                    <span className="ml-2 font-medium">{formatCurrency(selectedFornecedor.valor_total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Itens */}
      {cotacao.itens && cotacao.itens.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Itens da Cotação</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Unitário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cotacao.itens.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.descricao}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.quantidade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.unidade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.valor_unitario)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.valor_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Actions */}
      {cotacao.status === 'pendente' && (
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            onClick={() => onReprovar(cotacao.id)}
            className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <FaTimes className="mr-2 h-4 w-4" />
            Reprovar
          </button>
          <button
            onClick={() => onAprovar(cotacao.id)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <FaCheck className="mr-2 h-4 w-4" />
            Aprovar
          </button>
        </div>
      )}

      {cotacao.status === 'aprovada' && (
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            onClick={() => onFinalizar(cotacao.id)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaCheck className="mr-2 h-4 w-4" />
            Finalizar
          </button>
        </div>
      )}
    </div>
  );
};

export default AnalisarCotacao; 