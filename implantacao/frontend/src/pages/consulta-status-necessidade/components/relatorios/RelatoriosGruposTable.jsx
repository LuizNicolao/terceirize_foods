import React from 'react';
import { ActionButtons } from '../../../../components/ui';

const RelatoriosGruposTable = ({ estatisticas, loading, onVisualizarGrupo }) => {
  const formatarNumero = (num) => {
    if (!num) return '0';
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  const formatarQuantidade = (num) => {
    if (!num) return '0';
    const numFloat = parseFloat(num);
    if (Number.isInteger(numFloat)) {
      return numFloat.toLocaleString('pt-BR');
    }
    return numFloat.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 3 });
  };

  if (!estatisticas?.grupos || estatisticas.grupos.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Análise por Grupo de Produtos
      </h3>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grupo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade de Necessidades
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Média por Necessidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {estatisticas.grupos.map((grupo, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {grupo.grupo || 'Sem Grupo'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatarNumero(grupo.quantidade)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatarQuantidade(grupo.total_quantidade)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatarQuantidade(
                      grupo.quantidade > 0 
                        ? parseFloat(grupo.total_quantidade) / parseInt(grupo.quantidade)
                        : 0
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <ActionButtons
                      canView={true}
                      onView={() => onVisualizarGrupo(grupo.grupo)}
                      item={grupo}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RelatoriosGruposTable;

