import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash, FaChartLine, FaDollarSign, FaPercentage, FaTrendingUp, FaTrendingDown } from 'react-icons/fa';
import { formatCurrency, formatPercentage } from '../utils/formatters';

const VisualizarSaving = ({ saving, onAprovar, onReprovar }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!saving) {
    return (
      <div className="p-6 text-center text-gray-500">
        Nenhum saving selecionado
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'aprovado':
        return 'text-green-600 bg-green-100';
      case 'reprovado':
        return 'text-red-600 bg-red-100';
      case 'pendente':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getVariationColor = (variation) => {
    if (variation > 0) return 'text-green-600';
    if (variation < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getVariationIcon = (variation) => {
    if (variation > 0) return <FaTrendingUp className="text-green-500" />;
    if (variation < 0) return <FaTrendingDown className="text-red-500" />;
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Visualizar Saving
          </h2>
          <p className="text-gray-600">
            ID: {saving.id} - {saving.data_criacao}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(saving.status)}`}>
            {saving.status}
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
              <span className="ml-2 font-medium">{saving.solicitante}</span>
            </div>
            <div>
              <span className="text-gray-600">Departamento:</span>
              <span className="ml-2 font-medium">{saving.departamento}</span>
            </div>
            <div>
              <span className="text-gray-600">Tipo:</span>
              <span className="ml-2 font-medium">{saving.tipo}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <FaDollarSign />
            Valores
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Valor Anterior:</span>
              <span className="ml-2 font-medium">{formatCurrency(saving.valor_anterior)}</span>
            </div>
            <div>
              <span className="text-gray-600">Valor Atual:</span>
              <span className="ml-2 font-medium">{formatCurrency(saving.valor_atual)}</span>
            </div>
            <div>
              <span className="text-gray-600">Economia:</span>
              <span className={`ml-2 font-medium ${getVariationColor(saving.economia)}`}>
                {formatCurrency(saving.economia)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <FaPercentage />
            Percentuais
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Redução:</span>
              <span className={`ml-2 font-medium ${getVariationColor(saving.percentual_reducao)}`}>
                {formatPercentage(saving.percentual_reducao)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Período:</span>
              <span className="ml-2 font-medium">{saving.periodo}</span>
            </div>
            <div>
              <span className="text-gray-600">Frequência:</span>
              <span className="ml-2 font-medium">{saving.frequencia}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detalhes */}
      {showDetails && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaChartLine />
            Detalhes do Saving
          </h3>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Justificativa</h4>
                <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                  {saving.justificativa || 'Nenhuma justificativa fornecida'}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Métricas</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white p-3 rounded border">
                    <span className="text-sm text-gray-600">Economia Mensal:</span>
                    <span className={`font-medium ${getVariationColor(saving.economia_mensal)}`}>
                      {formatCurrency(saving.economia_mensal)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between bg-white p-3 rounded border">
                    <span className="text-sm text-gray-600">Economia Anual:</span>
                    <span className={`font-medium ${getVariationColor(saving.economia_anual)}`}>
                      {formatCurrency(saving.economia_anual)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between bg-white p-3 rounded border">
                    <span className="text-sm text-gray-600">ROI:</span>
                    <span className={`font-medium ${getVariationColor(saving.roi)}`}>
                      {formatPercentage(saving.roi)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Produtos/Serviços */}
      {saving.produtos && saving.produtos.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Produtos/Serviços</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Anterior
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Atual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Economia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Redução
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {saving.produtos.map((produto, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {produto.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(produto.valor_anterior)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(produto.valor_atual)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-medium ${getVariationColor(produto.economia)}`}>
                        {formatCurrency(produto.economia)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        {getVariationIcon(produto.percentual_reducao)}
                        <span className={`font-medium ${getVariationColor(produto.percentual_reducao)}`}>
                          {formatPercentage(produto.percentual_reducao)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Actions */}
      {saving.status === 'pendente' && (
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            onClick={() => onReprovar(saving.id)}
            className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <FaTrendingDown className="mr-2 h-4 w-4" />
            Reprovar
          </button>
          <button
            onClick={() => onAprovar(saving.id)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <FaTrendingUp className="mr-2 h-4 w-4" />
            Aprovar
          </button>
        </div>
      )}
    </div>
  );
};

export default VisualizarSaving; 