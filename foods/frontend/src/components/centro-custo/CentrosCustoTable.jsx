import React from 'react';
import { ActionButtons, EmptyState, SortableTableHeader } from '../ui';

const CentrosCustoTable = ({ 
  centrosCusto, 
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
  if (!Array.isArray(centrosCusto) || centrosCusto.length === 0) {
    return (
      <EmptyState
        title="Nenhum centro de custo encontrado"
        description="Tente ajustar os filtros de busca ou adicionar um novo centro de custo"
        icon="centro-custo"
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
                  Filial
                </th>
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
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {centrosCusto.map((centroCusto) => (
                <tr key={centroCusto.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {centroCusto.codigo || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {centroCusto.nome}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {centroCusto.filial_nome || '-'}
                    </div>
                    {centroCusto.codigo_filial && (
                      <div className="text-xs text-gray-500">
                        {centroCusto.codigo_filial}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {centroCusto.descricao || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      centroCusto.status === 1 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {getStatusLabel(centroCusto.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <ActionButtons
                      canView={canView('centro_custo') && onView}
                      canEdit={canEdit('centro_custo') && onEdit}
                      canDelete={canDelete('centro_custo') && onDelete}
                      onView={() => onView(centroCusto.id)}
                      onEdit={() => onEdit(centroCusto.id)}
                      onDelete={() => onDelete(centroCusto.id)}
                      item={centroCusto.id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Versão Mobile e Tablet - Cards */}
      <div className="xl:hidden space-y-4">
        {centrosCusto.map((centroCusto) => (
          <div key={centroCusto.id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-base">{centroCusto.nome}</h3>
                <p className="text-gray-600 text-sm">
                  Código: {centroCusto.codigo || '-'}
                </p>
              </div>
              <ActionButtons
                canView={canView('centro_custo') && onView}
                canEdit={canEdit('centro_custo') && onEdit}
                canDelete={canDelete('centro_custo') && onDelete}
                onView={() => onView(centroCusto.id)}
                onEdit={() => onEdit(centroCusto.id)}
                onDelete={() => onDelete(centroCusto.id)}
                item={centroCusto.id}
                size="xs"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Filial:</span>
                <p className="font-medium">{centroCusto.filial_nome || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                  centroCusto.status === 1 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {getStatusLabel(centroCusto.status)}
                </span>
              </div>
              {centroCusto.descricao && (
                <div className="col-span-2">
                  <span className="text-gray-500">Descrição:</span>
                  <p className="font-medium">{centroCusto.descricao}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default CentrosCustoTable;

