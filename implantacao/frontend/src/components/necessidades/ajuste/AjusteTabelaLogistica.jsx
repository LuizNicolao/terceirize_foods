import React from 'react';
import { FaTrash } from 'react-icons/fa';
import { Input } from '../../ui';

const AjusteTabelaLogistica = ({
  necessidades,
  ajustesLocais,
  onAjusteChange,
  onExcluirNecessidade,
  canEdit
}) => {
  // Função para calcular quantidade anterior baseado no status
  const getQuantidadeAnterior = (necessidade) => {
    // Para CONF NUTRI, mostrar ajuste_coordenacao
    if (necessidade.status === 'CONF NUTRI') {
      return necessidade.ajuste_coordenacao ?? 0;
    }
    // Para NEC LOG, mostrar ajuste_nutricionista
    if (necessidade.status === 'NEC LOG') {
      return necessidade.ajuste_nutricionista ?? 0;
    }
    // Para outros status, não há anterior
    return 0;
  };

  // Função para calcular quantidade atual baseado no status
  const getQuantidadeAtual = (necessidade) => {
    if (necessidade.status === 'CONF NUTRI') {
      return necessidade.ajuste_conf_nutri ?? necessidade.ajuste_coordenacao ?? necessidade.ajuste_nutricionista ?? necessidade.ajuste_logistica ?? necessidade.ajuste ?? 0;
    }
    if (necessidade.status === 'NEC LOG') {
      return necessidade.ajuste_logistica ?? necessidade.ajuste_nutricionista ?? necessidade.ajuste_coordenacao ?? necessidade.ajuste ?? 0;
    }
    return necessidade.ajuste_logistica ?? necessidade.ajuste_coordenacao ?? necessidade.ajuste_nutricionista ?? necessidade.ajuste ?? 0;
  };

  // Função para calcular a diferença
  const getDiferenca = (necessidade) => {
    const atual = getQuantidadeAtual(necessidade);
    const anterior = getQuantidadeAnterior(necessidade);
    return atual - anterior;
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
              Unidade de Medida
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantidade
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantidade anterior
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ajuste
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Diferença
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
                {necessidade.produto_unidade}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                {getQuantidadeAtual(necessidade)}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
                {getQuantidadeAnterior(necessidade)}
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
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center font-semibold">
                {getDiferenca(necessidade) !== 0 && (
                  <span className={getDiferenca(necessidade) > 0 ? 'text-green-600' : 'text-red-600'}>
                    {getDiferenca(necessidade) > 0 ? '+' : ''}{getDiferenca(necessidade)}
                  </span>
                )}
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

export default AjusteTabelaLogistica;

