import React from 'react';
import { FaTrash } from 'react-icons/fa';
import { Input } from '../../ui';

const AjusteTabelaCoordenacao = ({
  necessidades,
  ajustesLocais,
  onAjusteChange,
  onExcluirNecessidade,
  canEdit
}) => {
  // Função para calcular quantidade anterior baseado no status
  const getQuantidadeAnterior = (necessidade) => {
    // Para CONF COORD, mostrar ajuste_conf_nutri
    if (necessidade.status === 'CONF COORD') {
      return necessidade.ajuste_conf_nutri ?? 0;
    }
    // Para NEC COORD, mostrar ajuste_nutricionista
    if (necessidade.status === 'NEC COORD') {
      return necessidade.ajuste_nutricionista ?? 0;
    }
    // Para outros status, não há anterior
    return 0;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
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
              Quantidade anterior
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
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {necessidades.map((necessidade) => (
            <tr key={necessidade.id} className="hover:bg-gray-50">
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
                {getQuantidadeAnterior(necessidade)}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
                {necessidade.produto_unidade}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                {necessidade.status === 'CONF COORD'
                  ? (necessidade.ajuste_conf_coord ?? necessidade.ajuste_conf_nutri ?? necessidade.ajuste_nutricionista ?? necessidade.ajuste_coordenacao ?? necessidade.ajuste ?? 0)
                  : necessidade.status === 'NEC COORD'
                  ? (necessidade.ajuste_coordenacao ?? necessidade.ajuste_nutricionista ?? necessidade.ajuste ?? 0)
                  : (necessidade.ajuste_nutricionista ?? necessidade.ajuste_coordenacao ?? necessidade.ajuste ?? 0)}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                <Input
                  type="number"
                  value={ajustesLocais[`${necessidade.escola_id}_${necessidade.produto_id}`] || ''}
                  onChange={(e) => onAjusteChange({
                    escola_id: necessidade.escola_id,
                    produto_id: necessidade.produto_id,
                    valor: e.target.value
                  })}
                  min="0"
                  step="0.001"
                  className="w-20 text-center text-xs py-1"
                  disabled={necessidade.status === 'CONF' || !canEdit}
                />
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                <button
                  onClick={() => onExcluirNecessidade(necessidade)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                  title="Excluir produto"
                >
                  <FaTrash className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AjusteTabelaCoordenacao;
