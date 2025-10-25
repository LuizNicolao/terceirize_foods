import React from 'react';
import { FaTrash } from 'react-icons/fa';
import { Input } from '../ui';

const AjusteNecessidadesTable = ({
  activeTab,
  necessidadesFiltradas,
  ajustesLocais,
  onAjusteChange,
  onExcluir,
  canEdit
}) => {
  const renderCoordencaoRow = (necessidade) => (
    <>
      <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
        {necessidade.escola_id || 'N/A'}
      </td>
      <td className="px-4 py-2 whitespace-nowrap text-xs font-medium text-gray-900 text-center">
        {necessidade.escola}
      </td>
      <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
        {necessidade.produto_id || 'N/A'}
      </td>
      <td className="px-4 py-2 whitespace-nowrap text-xs font-medium text-gray-900 text-center">
        {necessidade.produto}
      </td>
      <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
        {necessidade.produto_unidade}
      </td>
      <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
        {necessidade.ajuste_coordenacao 
          ? (necessidade.ajuste_coordenacao)
          : (necessidade.ajuste_nutricionista || necessidade.ajuste || 0)
        }
      </td>
      <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
        <Input
          type="number"
          value={ajustesLocais[necessidade.id] || ''}
          onChange={(e) => onAjusteChange(necessidade.id, e.target.value)}
          min="0"
          step="0.001"
          className="w-20 text-center text-xs py-1"
          disabled={necessidade.status === 'CONF' || !canEdit}
        />
      </td>
      <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
        <button
          onClick={() => onExcluir(necessidade.id)}
          className="text-red-600 hover:text-red-800 transition-colors"
          title="Excluir produto"
        >
          <FaTrash className="h-4 w-4" />
        </button>
      </td>
    </>
  );

  const renderNutricionistaRow = (necessidade) => (
    <>
      <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">
        {necessidade.codigo_teknisa || 'N/A'}
      </td>
      <td className="px-4 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
        {necessidade.produto}
      </td>
      <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
        {necessidade.produto_unidade}
      </td>
      <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
        {necessidade.status === 'NEC NUTRI' 
          ? (necessidade.ajuste_nutricionista || 0)
          : (necessidade.ajuste || 0)
        }
      </td>
      <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
        <Input
          type="number"
          value={ajustesLocais[necessidade.id] || ''}
          onChange={(e) => onAjusteChange(necessidade.id, e.target.value)}
          min="0"
          step="0.001"
          className="w-20 text-center text-xs py-1"
          disabled={necessidade.status === 'NEC NUTRI' || !canEdit}
        />
      </td>
      <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
        <button
          onClick={() => onExcluir(necessidade.id)}
          className="text-red-600 hover:text-red-800 transition-colors"
          title="Excluir produto"
        >
          <FaTrash className="h-4 w-4" />
        </button>
      </td>
    </>
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {activeTab === 'coordenacao' ? (
              <>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cod Unidade
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unidade Escolar
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Codigo Produto
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produto
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unidade de Medida
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ajuste
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </>
            ) : (
              <>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unidade
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade (gerada)
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ajuste (nutricionista)
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {necessidadesFiltradas.map((necessidade) => (
            <tr key={necessidade.id} className="hover:bg-gray-50">
              {activeTab === 'coordenacao' 
                ? renderCoordencaoRow(necessidade)
                : renderNutricionistaRow(necessidade)
              }
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AjusteNecessidadesTable;
