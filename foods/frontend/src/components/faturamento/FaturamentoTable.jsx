import React from 'react';
import { ActionButtons, EmptyState } from '../ui';

const FaturamentoTable = ({
  faturamentos,
  canView,
  canEdit,
  canDelete,
  onView,
  onEdit,
  onDelete,
  formatDate,
  getMonthName
}) => {
  if (!faturamentos || faturamentos.length === 0) {
    return <EmptyState message="Nenhum faturamento encontrado" />;
  }

  return (
    <>
      {/* Versão Desktop - Tabela */}
      <div className="hidden xl:block bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unidade Escolar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Período
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total de Refeições
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {faturamentos.map((faturamento) => {
                // Usar total calculado no backend
                const totalRefeicoes = faturamento.total_refeicoes || 0;

                return (
                  <tr key={faturamento.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {faturamento.nome_escola}
                        </div>
                        <div className="text-sm text-gray-500">
                          {faturamento.codigo_teknisa}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getMonthName(faturamento.mes)}/{faturamento.ano}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {totalRefeicoes.toLocaleString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <ActionButtons
                        item={faturamento}
                        canView={canView}
                        canEdit={canEdit}
                        canDelete={canDelete}
                        onView={onView}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Versão Mobile e Tablet - Cards */}
      <div className="xl:hidden space-y-3">
        {faturamentos.map((faturamento) => {
          // Usar total calculado no backend
          const totalRefeicoes = faturamento.total_refeicoes || 0;

          return (
            <div key={faturamento.id} className="bg-white rounded-lg shadow-sm p-4 border">
              <div className="mb-3">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {faturamento.nome_escola}
                </h3>
                <p className="text-xs text-gray-500">
                  {faturamento.codigo_teknisa}
                </p>
              </div>
              
              <div className="text-xs space-y-1 mb-3">
                <div>
                  <span className="text-gray-500">Período:</span>
                  <p className="font-medium">{getMonthName(faturamento.mes)}/{faturamento.ano}</p>
                </div>
                <div>
                  <span className="text-gray-500">Total de Refeições:</span>
                  <p className="font-medium">{totalRefeicoes.toLocaleString('pt-BR')}</p>
                </div>
              </div>

              <div className="flex justify-end">
                <ActionButtons
                  item={faturamento}
                  canView={canView}
                  canEdit={canEdit}
                  canDelete={canDelete}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  size="xs"
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default FaturamentoTable;
