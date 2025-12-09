import React from 'react';
import { ActionButtons, EmptyState, SortableTableHeader } from '../ui';

/**
 * Componente de tabela para Pratos
 */
const PratosTable = ({
  pratos = [],
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

  if (pratos.length === 0) {
    return (
      <EmptyState
        title="Nenhum prato encontrado"
        description="Não há pratos cadastrados ou os filtros aplicados não retornaram resultados"
        icon="prato"
      />
    );
  }

  // Normalizar sortDirection para 'asc' ou 'desc'
  const normalizedSortDirection = sortDirection === 'ASC' ? 'asc' : sortDirection === 'DESC' ? 'desc' : null;
  
  // Handler para ordenação
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
                label="Nome do Prato"
                field="nome"
                currentSort={sortField}
                currentDirection={normalizedSortDirection}
                onSort={handleSort}
                align="left"
              />
              <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo de Prato
              </th>
              <th className="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Receitas
              </th>
              <th className="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produtos
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
            {pratos.map((prato) => (
              <tr key={prato.id} className="hover:bg-gray-50">
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 font-mono">
                  {prato.codigo || '-'}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  {prato.nome || '-'}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                  {prato.tipo_prato || '-'}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-center text-sm text-gray-900">
                  {prato.total_receitas || 0}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-center text-sm text-gray-900">
                  {prato.total_produtos || 0}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-center">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    prato.status === 1 || prato.status === true
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {prato.status === 1 || prato.status === true ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-center text-sm font-medium flex justify-center items-center">
                  <ActionButtons
                    item={prato}
                    canView={canView}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
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

export default PratosTable;

