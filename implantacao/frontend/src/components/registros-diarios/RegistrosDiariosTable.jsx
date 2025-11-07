import React from 'react';
import { ActionButtons, EmptyState } from '../ui';
import { formatarDataParaExibicao } from '../../utils/recebimentos/recebimentosUtils';

const RegistrosDiariosTable = ({
  registros,
  canView,
  canEdit,
  canDelete,
  onView,
  onEdit,
  onDelete,
  loading
}) => {
  const formatQuantidade = (valor) => {
    const numero = Number(valor);
    if (!Number.isFinite(numero) || numero <= 0) {
      return '-';
    }
    return numero;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Carregando registros...</span>
      </div>
    );
  }

  if (!registros || registros.length === 0) {
    return (
      <EmptyState
        title="Nenhum registro encontrado"
        description="Adicione um novo registro diário para começar"
        icon="calendar"
      />
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden xl:block bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Escola</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Data</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Lanche Manhã</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Parcial Manhã</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Almoço</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Lanche Tarde</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Parcial Tarde</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">EJA</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {registros.map((registro) => (
                <tr key={`${registro.escola_id}-${registro.data}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{registro.escola_nome || `Escola ID ${registro.escola_id}`}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-center">
                    {formatarDataParaExibicao(registro.data)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-center">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {formatQuantidade(registro.lanche_manha)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-center">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                      {formatQuantidade(registro.parcial_manha ?? registro.parcial)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-center">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      {formatQuantidade(registro.almoco)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-center">
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                      {formatQuantidade(registro.lanche_tarde)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-center">
                    <span className="px-2 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-medium">
                      {formatQuantidade(registro.parcial_tarde)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-center">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                      {formatQuantidade(registro.eja)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ActionButtons
                      canView={canView}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      onView={() => onView(registro)}
                      onEdit={() => onEdit(registro)}
                      onDelete={() => onDelete(registro.escola_id, registro.data, registro.escola_nome)}
                      item={registro}
                      size="xs"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile */}
      <div className="xl:hidden space-y-3">
        {registros.map((registro) => (
          <div key={`${registro.escola_id}-${registro.data}`} className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{registro.escola_nome || `Escola ID ${registro.escola_id}`}</h3>
                <p className="text-gray-600 text-xs">{formatarDataParaExibicao(registro.data)}</p>
              </div>
              <ActionButtons
                canView={canView}
                canEdit={canEdit}
                canDelete={canDelete}
                onView={() => onView(registro)}
                onEdit={() => onEdit(registro)}
                onDelete={() => onDelete(registro.escola_id, registro.data, registro.escola_nome)}
                item={registro}
                size="xs"
                className="p-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Lanche Manhã:</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-medium">{formatQuantidade(registro.lanche_manha)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Parcial Manhã:</span>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full font-medium">{formatQuantidade(registro.parcial_manha ?? registro.parcial)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Almoço:</span>
                <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full font-medium">{formatQuantidade(registro.almoco)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Lanche Tarde:</span>
                <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full font-medium">{formatQuantidade(registro.lanche_tarde)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Parcial Tarde:</span>
                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full font-medium">{formatQuantidade(registro.parcial_tarde)}</span>
              </div>
              <div className="flex justify-between items-center col-span-2">
                <span className="text-gray-500">EJA:</span>
                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full font-medium">{formatQuantidade(registro.eja)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default RegistrosDiariosTable;

