import React from 'react';
import { ActionButtons, EmptyState } from '../ui';

const PedidosComprasTable = ({
  pedidosCompras,
  onView,
  onEdit,
  onDelete,
  canView,
  canEdit,
  canDelete,
  getStatusBadge
}) => {
  if (!pedidosCompras || pedidosCompras.length === 0) {
    return (
      <EmptyState
        title="Nenhum pedido de compras encontrado"
        description="Não há pedidos de compras cadastrados ou os filtros aplicados não retornaram resultados"
        icon="pedidos-compras"
      />
    );
  }

  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <>
      {/* Versão Desktop - Tabela completa */}
      <div className="hidden xl:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Número
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Solicitação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fornecedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Filial
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Entrega
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pedidosCompras.map((pedido, index) => {
                const statusBadge = getStatusBadge(pedido.status);
                return (
                  <tr key={pedido.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{pedido.numero_pedido}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{pedido.numero_solicitacao || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{pedido.fornecedor_nome || '-'}</div>
                      {pedido.fornecedor_cnpj && (
                        <div className="text-sm text-gray-500">{pedido.fornecedor_cnpj}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pedido.filial_nome || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pedido.data_entrega_formatada || pedido.data_entrega_cd || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(pedido.valor_total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusBadge.color === 'green'
                            ? 'bg-green-100 text-green-800'
                            : statusBadge.color === 'yellow'
                            ? 'bg-yellow-100 text-yellow-800'
                            : statusBadge.color === 'blue'
                            ? 'bg-blue-100 text-blue-800'
                            : statusBadge.color === 'red'
                            ? 'bg-red-100 text-red-800'
                            : statusBadge.color === 'orange'
                            ? 'bg-orange-100 text-orange-800'
                            : statusBadge.color === 'purple'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {statusBadge.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end">
                        <ActionButtons
                          canView={canView}
                          canEdit={canEdit}
                          canDelete={canDelete}
                          onView={onView}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          item={pedido}
                          size="xs"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Versão Mobile - Cards */}
      <div className="xl:hidden space-y-4">
        {pedidosCompras.map((pedido) => {
          const statusBadge = getStatusBadge(pedido.status);
          return (
            <div key={pedido.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{pedido.numero_pedido}</h3>
                  <p className="text-xs text-gray-500 mt-1">{pedido.numero_solicitacao || 'Sem solicitação'}</p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    statusBadge.color === 'green'
                      ? 'bg-green-100 text-green-800'
                      : statusBadge.color === 'yellow'
                      ? 'bg-yellow-100 text-yellow-800'
                      : statusBadge.color === 'blue'
                      ? 'bg-blue-100 text-blue-800'
                      : statusBadge.color === 'red'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {statusBadge.text}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Fornecedor: </span>
                  <span className="text-gray-900">{pedido.fornecedor_nome || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Filial: </span>
                  <span className="text-gray-900">{pedido.filial_nome || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Data Entrega: </span>
                  <span className="text-gray-900">{pedido.data_entrega_formatada || pedido.data_entrega_cd || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Valor Total: </span>
                  <span className="text-gray-900 font-semibold">{formatCurrency(pedido.valor_total)}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <ActionButtons
                  canView={canView}
                  canEdit={canEdit}
                  canDelete={canDelete}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  item={pedido}
                  size="sm"
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default PedidosComprasTable;

