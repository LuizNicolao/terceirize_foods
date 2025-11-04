import React from 'react';
import { FaCreditCard } from 'react-icons/fa';
import { ActionButtons, EmptyState } from '../ui';

const FormasPagamentoTable = ({
  formasPagamento,
  onView,
  onEdit,
  onDelete,
  canView,
  canEdit,
  canDelete,
  getStatusBadge
}) => {
  if (!formasPagamento || formasPagamento.length === 0) {
    return (
      <EmptyState
        title="Nenhuma forma de pagamento encontrada"
        description="Não há formas de pagamento cadastradas ou os filtros aplicados não retornaram resultados"
        icon="formas-pagamento"
      />
    );
  }

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
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prazo Padrão
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
              {formasPagamento.map((forma, index) => {
                const statusBadge = getStatusBadge(forma.ativo);
                return (
                  <tr key={forma.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{forma.nome}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-md truncate">
                        {forma.descricao || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {forma.prazo_padrao || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusBadge.color === 'green'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {statusBadge.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <ActionButtons
                        onView={canView ? () => onView(forma) : null}
                        onEdit={canEdit ? () => onEdit(forma) : null}
                        onDelete={canDelete ? () => onDelete(forma) : null}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Versão Mobile/Tablet - Cards */}
      <div className="xl:hidden space-y-4">
        {formasPagamento.map((forma, index) => {
          const statusBadge = getStatusBadge(forma.ativo);
          return (
            <div key={forma.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm text-gray-500">#{index + 1}</span>
                    <h3 className="text-sm font-medium text-gray-900">{forma.nome}</h3>
                  </div>
                  {forma.descricao && (
                    <p className="text-sm text-gray-500 mt-1">{forma.descricao}</p>
                  )}
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    statusBadge.color === 'green'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {statusBadge.text}
                </span>
              </div>
              {forma.prazo_padrao && (
                <div className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">Prazo:</span> {forma.prazo_padrao}
                </div>
              )}
              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
                <ActionButtons
                  onView={canView ? () => onView(forma) : null}
                  onEdit={canEdit ? () => onEdit(forma) : null}
                  onDelete={canDelete ? () => onDelete(forma) : null}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default FormasPagamentoTable;

