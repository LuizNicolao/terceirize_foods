import React from 'react';
import { Button, Input } from '../../ui';

/**
 * Seção de Vínculos de Unidades Escolares
 */
const UnidadesEscolares = ({
  filialId,
  unidades,
  unidadesSelecionadas,
  buscaUnidade,
  loadingUnidades,
  isViewMode,
  saving,
  onBuscaUnidadeChange,
  onBuscaUnidadeSubmit,
  onUnidadeToggle
}) => {
  if (!filialId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-yellow-800 text-sm">
          Selecione uma filial na aba "Informações Básicas" para ver as unidades escolares.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Buscar unidade por nome..."
          value={buscaUnidade}
          onChange={(e) => onBuscaUnidadeChange(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onBuscaUnidadeSubmit();
            }
          }}
          disabled={loadingUnidades}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
        />
        <Button
          type="button"
          onClick={onBuscaUnidadeSubmit}
          disabled={loadingUnidades}
          size="sm"
        >
          Buscar
        </Button>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                  Selecionar
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                  Unidade Escolar
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loadingUnidades ? (
                <tr>
                  <td colSpan={2} className="px-4 py-6 text-center text-gray-500">
                    Carregando unidades...
                  </td>
                </tr>
              ) : unidades.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-6 text-center text-gray-500">
                    Nenhuma unidade encontrada
                  </td>
                </tr>
              ) : (
                unidades.map(unidade => (
                  <tr key={unidade.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={unidadesSelecionadas.includes(unidade.id)}
                        onChange={() => onUnidadeToggle(unidade.id)}
                        disabled={isViewMode || saving}
                        className="w-5 h-5 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      <div className="font-medium">{unidade.nome_escola || unidade.nome}</div>
                      <div className="text-xs text-gray-500">ID: {unidade.id}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UnidadesEscolares;

