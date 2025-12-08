import React from 'react';
import { ActionButtons, EmptyState, SortableTableHeader } from '../ui';

/**
 * Componente de tabela para Receitas
 */
const ReceitasTable = ({
  receitas = [],
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

  if (receitas.length === 0) {
    return (
      <EmptyState
        title="Nenhuma receita encontrada"
        description="Não há receitas cadastradas ou os filtros aplicados não retornaram resultados"
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
                onSort={onSort}
                align="left"
              />
              <SortableTableHeader
                label="Nome"
                field="nome"
                currentSort={sortField}
                currentDirection={normalizedSortDirection}
                onSort={onSort}
                align="left"
              />
              <SortableTableHeader
                label="Tipo"
                field="tipo_receita"
                currentSort={sortField}
                currentDirection={normalizedSortDirection}
                onSort={onSort}
                align="left"
              />
              <SortableTableHeader
                label="Filial"
                field="filial"
                currentSort={sortField}
                currentDirection={normalizedSortDirection}
                onSort={onSort}
                align="left"
              />
              <SortableTableHeader
                label="Centro de Custo"
                field="centro_custo"
                currentSort={sortField}
                currentDirection={normalizedSortDirection}
                onSort={onSort}
                align="left"
              />
              <th className="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produtos
              </th>
              <th className="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {receitas.map((receita) => (
              <tr key={receita.id} className="hover:bg-gray-50">
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 font-mono">
                  {receita.codigo || '-'}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  {receita.nome || '-'}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                  {receita.tipo_receita || '-'}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                  {receita.filial || '-'}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                  {receita.centro_custo || '-'}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-center text-sm font-medium">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {receita.total_produtos || 0}
                  </span>
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-center text-sm font-medium">
                  <ActionButtons
                    canView={canView}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    onView={() => onView && onView(receita)}
                    onEdit={() => onEdit && onEdit(receita)}
                    onDelete={() => onDelete && onDelete(receita)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReceitasTable;

