import React from 'react';
import { ActionButtons, EmptyState } from '../ui';
import { FaTags } from 'react-icons/fa';

const PrazosPagamentoTable = ({
  prazosPagamento,
  onView,
  onEdit,
  onDelete,
  canView,
  canEdit,
  canDelete,
  getStatusBadge,
  calcularVencimentos,
  formatarParcelas
}) => {
  if (!prazosPagamento || prazosPagamento.length === 0) {
    return (
      <EmptyState
        title="Nenhum prazo de pagamento encontrado"
        description="Não há prazos de pagamento cadastrados ou os filtros aplicados não retornaram resultados"
        icon="prazos-pagamento"
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
                  Parcelas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vencimentos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
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
              {prazosPagamento.map((prazo, index) => {
                const statusBadge = getStatusBadge(prazo.ativo);
                const vencimentos = calcularVencimentos(
                  prazo.dias || 0,
                  prazo.parcelas || 1,
                  prazo.intervalo_dias || 0
                );
                const parcelasText = formatarParcelas(prazo.parcelas || 1);
                const isParcelado = prazo.parcelas && prazo.parcelas > 1;

                return (
                  <tr key={prazo.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{prazo.nome}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <span className="font-medium">{parcelasText}</span>
                        {isParcelado && (
                          <FaTags className="w-4 h-4 text-blue-500" title="Parcelado" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vencimentos}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-md truncate">
                        {prazo.descricao || '-'}
                      </div>
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
                      <div className="flex justify-end">
                        <ActionButtons
                          canView={canView}
                          canEdit={canEdit}
                          canDelete={canDelete}
                          onView={onView}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          item={prazo}
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

      {/* Versão Mobile/Tablet - Cards */}
      <div className="xl:hidden space-y-4">
        {prazosPagamento.map((prazo, index) => {
          const statusBadge = getStatusBadge(prazo.ativo);
          const vencimentos = calcularVencimentos(
            prazo.dias || 0,
            prazo.parcelas || 1,
            prazo.intervalo_dias || 0
          );
          const parcelasText = formatarParcelas(prazo.parcelas || 1);
          const isParcelado = prazo.parcelas && prazo.parcelas > 1;

          return (
            <div key={prazo.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm text-gray-500">#{index + 1}</span>
                    <h3 className="text-sm font-medium text-gray-900">{prazo.nome}</h3>
                  </div>
                  {prazo.descricao && (
                    <p className="text-sm text-gray-500 mt-1">{prazo.descricao}</p>
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
              <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Parcelas:</span>
                  <span className="text-gray-900">{parcelasText}</span>
                  {isParcelado && (
                    <FaTags className="w-3 h-3 text-blue-500" title="Parcelado" />
                  )}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Vencimentos:</span>
                  <span className="text-gray-900 ml-1">{vencimentos}</span>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
                <ActionButtons
                  canView={canView}
                  canEdit={canEdit}
                  canDelete={canDelete}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  item={prazo}
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

export default PrazosPagamentoTable;

