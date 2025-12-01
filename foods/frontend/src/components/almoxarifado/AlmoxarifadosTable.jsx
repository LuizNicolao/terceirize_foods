import React from 'react';
import { ActionButtons, EmptyState, SortableTableHeader } from '../ui';

const AlmoxarifadosTable = ({ 
  almoxarifados, 
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
  if (!Array.isArray(almoxarifados) || almoxarifados.length === 0) {
    return (
      <EmptyState
        title="Nenhum almoxarifado encontrado"
        description="Tente ajustar os filtros de busca ou adicionar um novo almoxarifado"
        icon="almoxarifado"
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
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Filial
                </th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Centro de Custo
                </th>
                <SortableTableHeader
                  label="Status"
                  field="status"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                />
                <th className="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {almoxarifados.map((almoxarifado) => (
                <tr key={almoxarifado.id} className="hover:bg-gray-50">
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {almoxarifado.codigo || '-'}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {almoxarifado.nome}
                    </div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {almoxarifado.filial_nome || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {almoxarifado.centro_custo_nome || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      almoxarifado.status === 1 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {getStatusLabel(almoxarifado.status)}
                    </span>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-center text-sm font-medium">
                    <ActionButtons
                      canView={canView('almoxarifado') && onView}
                      canEdit={canEdit('almoxarifado') && onEdit}
                      canDelete={canDelete('almoxarifado') && onDelete}
                      onView={() => onView(almoxarifado.id)}
                      onEdit={() => onEdit(almoxarifado.id)}
                      onDelete={() => onDelete(almoxarifado.id)}
                      item={almoxarifado.id}
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
        {almoxarifados.map((almoxarifado) => (
          <div key={almoxarifado.id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-base">{almoxarifado.nome}</h3>
                <p className="text-gray-600 text-sm">
                  Código: {almoxarifado.codigo || '-'}
                </p>
              </div>
              <ActionButtons
                canView={canView('almoxarifado') && onView}
                canEdit={canEdit('almoxarifado') && onEdit}
                canDelete={canDelete('almoxarifado') && onDelete}
                onView={() => onView(almoxarifado.id)}
                onEdit={() => onEdit(almoxarifado.id)}
                onDelete={() => onDelete(almoxarifado.id)}
                item={almoxarifado.id}
                size="xs"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Filial:</span>
                <p className="font-medium">{almoxarifado.filial_nome || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">Centro de Custo:</span>
                <p className="font-medium">{almoxarifado.centro_custo_nome || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                  almoxarifado.status === 1 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {getStatusLabel(almoxarifado.status)}
                </span>
              </div>
            </div>
            
            {almoxarifado.observacoes && (
              <div className="mt-3 text-sm">
                <span className="text-gray-500">Observações:</span>
                <p className="font-medium text-gray-700 mt-1">{almoxarifado.observacoes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default AlmoxarifadosTable;

