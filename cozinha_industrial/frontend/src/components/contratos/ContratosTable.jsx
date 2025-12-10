import React from 'react';
import { ActionButtons, EmptyState, SortableTableHeader } from '../ui';

/**
 * Componente de tabela para Contratos
 */
const ContratosTable = ({
  contratos = [],
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

  if (contratos.length === 0) {
    return (
      <EmptyState
        title="Nenhum contrato encontrado"
        description="Não há contratos cadastrados ou os filtros aplicados não retornaram resultados"
        icon="file-contract"
      />
    );
  }

  // Normalizar sortDirection para 'asc' ou 'desc'
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
                label="Nome"
                field="nome"
                currentSort={sortField}
                currentDirection={normalizedSortDirection}
                onSort={handleSort}
                align="left"
              />
              <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Filial
              </th>
              <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Centro de Custo
              </th>
              <th className="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unidades
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
            {contratos.map((contrato) => (
              <tr key={contrato.id} className="hover:bg-gray-50">
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 font-mono">
                  {contrato.codigo || '-'}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  {contrato.nome || '-'}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                  {contrato.cliente_nome || '-'}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                  {contrato.filial_nome || '-'}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                  {contrato.centro_custo_nome || '-'}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-center">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {contrato.total_unidades_vinculadas || 0}
                  </span>
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-center">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {contrato.total_produtos_vinculados || 0}
                  </span>
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-center">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    contrato.status === 'ativo'
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {contrato.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center">
                    <ActionButtons
                      canView={canView}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      onView={() => onView && onView(contrato)}
                      onEdit={() => onEdit && onEdit(contrato)}
                      onDelete={() => onDelete && onDelete(contrato)}
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

export default ContratosTable;

