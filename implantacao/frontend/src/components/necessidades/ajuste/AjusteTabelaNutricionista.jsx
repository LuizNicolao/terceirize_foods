import React from 'react';
import { FaTrash } from 'react-icons/fa';
import { Input } from '../../ui';

const AjusteTabelaNutricionista = ({
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
    if (necessidade.status === 'CONF NUTRI') {
      return necessidade.ajuste_coordenacao ?? 0;
    }
    if (necessidade.status === 'NEC NUTRI') {
      return necessidade.ajuste ?? 0;
    }
    return 0;
  };

  // Função para calcular quantidade atual baseado no status
  const getQuantidadeAtual = (necessidade) => {
    if (necessidade.status === 'CONF NUTRI') {
      return necessidade.ajuste_conf_nutri ?? necessidade.ajuste_coordenacao ?? necessidade.ajuste_nutricionista ?? necessidade.ajuste ?? 0;
    }
    if (necessidade.status === 'NEC NUTRI') {
      return necessidade.ajuste_nutricionista ?? necessidade.ajuste ?? 0;
    }
    return necessidade.ajuste ?? 0;
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
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">
                {necessidade.produto_id || 'N/A'}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                {necessidade.produto}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                {necessidade.produto_unidade}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                {necessidade.status === 'CONF NUTRI'
                  ? (necessidade.ajuste_conf_nutri ?? necessidade.ajuste_coordenacao ?? necessidade.ajuste_nutricionista ?? necessidade.ajuste ?? 0)
                  : (necessidade.status === 'NEC NUTRI'
                      ? (necessidade.ajuste_nutricionista ?? necessidade.ajuste ?? 0)
                      : (necessidade.ajuste ?? 0))}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
                {getQuantidadeAnterior(necessidade)}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                <Input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.,]?[0-9]*"
                  value={ajustesLocais[`${necessidade.escola_id}_${necessidade.produto_id}`] || ''}
                  onChange={(e) => {
                    const valor = e.target.value;
                    // Permitir apenas números, vírgula e ponto
                    // Permite: vazio, números, "0,", "0.", "0,5", "0.5", etc.
                    if (valor === '' || /^[0-9]*[.,]?[0-9]*$/.test(valor)) {
                      onAjusteChange({
                        escola_id: necessidade.escola_id,
                        produto_id: necessidade.produto_id,
                        valor: valor
                      });
                    }
                  }}
                  className="w-20 text-center text-xs py-1"
                  disabled={!canEdit}
                  placeholder="0.000"
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

export default AjusteTabelaNutricionista;
