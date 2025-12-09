import React from 'react';
import { ActionButtons, EmptyState, SortableTableHeader } from '../ui';

/**
 * Componente de tabela para Tipos de Receitas
 */
const TiposReceitasTable = ({
  tiposReceitas = [],
  loading = false,
  canView = true,
  canEdit = true,
  canDelete = true,
  onView,
  onEdit,
  onDelete,
  sortField,
  sortDirection,
  onSort
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tiposReceitas.length === 0) {
    return (
      <EmptyState
        title="Nenhum tipo de receita encontrado"
        description="Não há tipos de receitas cadastrados ou os filtros aplicados não retornaram resultados"
        icon="receita"
      />
    );
  }

  // Normalizar sortDirection para 'asc' ou 'desc' (o SortableTableHeader espera isso)
  const normalizedSortDirection = sortDirection === 'ASC' ? 'asc' : sortDirection === 'DESC' ? 'desc' : null;
  
  // Handler para ordenação compatível com SortableTableHeader
  const handleSort = (field) => {
    if (onSort) {
      onSort(field);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <SortableTableHeader
                label="Código"
                field="codigo"
                currentSort={sortField}
                currentDirection={normalizedSortDirection}
                onSort={handleSort}
                align="left"
              />
              <SortableTableHeader
                label="Tipo de Receita"
                field="tipo_receita"
                currentSort={sortField}
                currentDirection={normalizedSortDirection}
                onSort={handleSort}
                align="left"
              />
              <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tiposReceitas.map((tipoReceita) => (
              <tr key={tipoReceita.id} className="hover:bg-gray-50">
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 font-mono">
                  {tipoReceita.codigo || '-'}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  {tipoReceita.tipo_receita || '-'}
                </td>
                <td className="px-6 py-2 text-sm text-gray-900">
                  {tipoReceita.descricao ? (
                    <span className="line-clamp-2" title={tipoReceita.descricao}>
                      {tipoReceita.descricao}
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-center">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    tipoReceita.status === 1 || tipoReceita.status === true
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {tipoReceita.status === 1 || tipoReceita.status === true ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center">
                    <ActionButtons
                      canView={canView}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      onView={() => onView && onView(tipoReceita)}
                      onEdit={() => onEdit && onEdit(tipoReceita)}
                      onDelete={() => onDelete && onDelete(tipoReceita)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TiposReceitasTable;

