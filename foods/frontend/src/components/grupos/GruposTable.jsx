import React from 'react';
import { ActionButtons, EmptyState , SortableTableHeader } from '../ui';

const GruposTable = ({ 
  grupos, 
  canView, 
  canEdit, 
  canDelete, 
  onView, 
  onEdit, 
  onDelete, 
  getStatusLabel,
  formatDate
,
  sortField,
  sortDirection,
  onSort
}) => {
  if (grupos.length === 0) {
    return (
      <EmptyState
        title="Nenhum grupo encontrado"
        description="Tente ajustar os filtros de busca ou adicionar um novo grupo"
        icon="grupos"
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
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subgrupos
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
              {grupos.map((grupo) => (
                <tr key={grupo.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {grupo.codigo || '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {grupo.nome}
                    </div>
                    {grupo.descricao && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {grupo.descricao}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    {grupo.tipo || '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    {grupo.subgrupos_count || 0}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                      grupo.status === 'ativo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {getStatusLabel(grupo.status)}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                    <ActionButtons
                      canView={canView('grupos')}
                      canEdit={canEdit('grupos')}
                      canDelete={canDelete('grupos')}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      item={grupo}
                      size="xs"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Versão Mobile e Tablet - Cards */}
      <div className="xl:hidden space-y-3">
        {grupos.map((grupo) => (
          <div key={grupo.id} className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{grupo.nome}</h3>
                <p className="text-gray-600 text-xs">ID: {grupo.id}</p>
              </div>
              <ActionButtons
                canView={canView('grupos')}
                canEdit={canEdit('grupos')}
                canDelete={canDelete('grupos')}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                item={grupo}
                size="xs"
                className="p-2"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500">Código:</span>
                <p className="font-medium">{grupo.codigo || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">Tipo:</span>
                <p className="font-medium">{grupo.tipo || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">Subgrupos:</span>
                <p className="font-medium">{grupo.subgrupos_count || 0}</p>
              </div>
            </div>
            
            {grupo.descricao && (
              <div className="mt-3 text-xs">
                <span className="text-gray-500">Descrição:</span>
                <p className="text-gray-700 mt-1">{grupo.descricao}</p>
              </div>
            )}
            
            <div className="mt-3">
              <span className="text-gray-500 text-xs">Status:</span>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ml-2 ${
                grupo.status === 'ativo' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {getStatusLabel(grupo.status)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default GruposTable;
