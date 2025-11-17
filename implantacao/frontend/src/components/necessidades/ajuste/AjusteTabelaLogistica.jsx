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
  // Função para calcular quantidade anterior
  // Usa a coluna ajuste_anterior do banco de dados
  const getQuantidadeAnterior = (necessidade) => {
    // Se existe ajuste_anterior, usar ele
    if (necessidade.ajuste_anterior !== null && necessidade.ajuste_anterior !== undefined) {
      return necessidade.ajuste_anterior ?? 0;
    }
    // Fallback para lógica antiga se ajuste_anterior não existir
    return necessidade.ajuste_coordenacao ?? 0;
  };

  // Função para calcular quantidade atual baseado no status
  const getQuantidadeAtual = (necessidade) => {
    // Para NEC LOG, mostrar ajuste_logistica
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
                {necessidade.escola_id}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                {necessidade.escola}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
                {necessidade.codigo_teknisa}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs font-medium text-gray-900 text-center">
                {necessidade.produto}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
                {necessidade.produto_unidade}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                {necessidade.ajuste_logistica ?? necessidade.ajuste_coordenacao ?? necessidade.ajuste_nutricionista ?? necessidade.ajuste ?? 0}
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
                  disabled={!canEdit}
                />
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center font-semibold">
                {getDiferenca(necessidade) !== 0 && (
                  <span className={getDiferenca(necessidade) > 0 ? 'text-green-600' : 'text-red-600'}>
                    {getDiferenca(necessidade) > 0 ? '+' : ''}{getDiferenca(necessidade)}
                  </span>
                )}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-center">
                <button
                  onClick={() => onExcluirNecessidade(necessidade.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Excluir produto"
                  disabled={!canEdit}
                >
                  <FaTrash />
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

