import React from 'react';
import { ActionButtons, EmptyState, SortableTableHeader } from '../ui';

const PeriodosRefeicaoTable = ({ 
  periodos, 
  canView, 
  canEdit, 
  canDelete, 
  onView, 
  onEdit, 
  onDelete,
  getStatusLabel,
  formatDate,
  sortField,
  sortDirection,
  onSort
}) => {

  if (periodos.length === 0) {
    return (
      <EmptyState
        title="Nenhum período de refeição encontrado"
        description="Não há períodos de refeição cadastrados ou que correspondam aos filtros aplicados."
      />
    );
  }

  return (
    <>
      {/* Versão Desktop - Tabela completa */}
      <div className="hidden xl:block bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <SortableTableHeader
                  label="Código"
                  field="codigo"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                />
                <SortableTableHeader
                  label="Nome"
                  field="nome"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                />
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <SortableTableHeader
                  label="Status"
                  field="status"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                />
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {periodos.map((periodo) => {
                const statusInfo = getStatusLabel(periodo.status);
                return (
                  <tr key={periodo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {periodo.codigo || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {periodo.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {periodo.descricao || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                        periodo.status === 'ativo'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {getStatusLabel(periodo.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <ActionButtons
                        canView={canView('periodos_refeicao')}
                        canEdit={canEdit('periodos_refeicao')}
                        canDelete={canDelete('periodos_refeicao')}
                        onView={() => onView(periodo)}
                        onEdit={() => onEdit(periodo)}
                        onDelete={() => onDelete(periodo)}
                        item={periodo}
                        size="xs"
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
        {periodos.map((periodo) => (
          <div key={periodo.id} className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{periodo.nome}</h3>
                {periodo.codigo && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border mt-1">
                    {periodo.codigo}
                  </span>
                )}
              </div>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                periodo.status === 'ativo'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {getStatusLabel(periodo.status)}
              </span>
            </div>
            
            {periodo.descricao && (
              <p className="text-sm text-gray-600 mb-3">{periodo.descricao}</p>
            )}
            
            <ActionButtons
              canView={canView('periodos_refeicao')}
              canEdit={canEdit('periodos_refeicao')}
              canDelete={canDelete('periodos_refeicao')}
              onView={() => onView(periodo)}
              onEdit={() => onEdit(periodo)}
              onDelete={() => onDelete(periodo)}
              item={periodo}
              size="xs"
              className="p-2"
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default PeriodosRefeicaoTable;
