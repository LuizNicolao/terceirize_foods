import React from 'react';
import { ActionButtons, EmptyState , SortableTableHeader } from '../ui';

const FiliaisTable = ({
  filiais,
  canView,
  canEdit,
  canDelete,
  onView,
  onEdit,
  onDelete,
  formatDate
,
  sortField,
  sortDirection,
  onSort
}) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      1: { label: 'Ativa', className: 'bg-green-100 text-green-800' },
      0: { label: 'Inativa', className: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status] || { label: 'Desconhecido', className: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (filiais.length === 0) {
    return (
      <EmptyState
        title="Nenhuma filial encontrada"
        description="Tente ajustar os filtros de busca ou adicionar uma nova filial"
        icon="filiais"
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CNPJ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Filial
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Razão Social
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cidade/Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filiais.map((filial) => (
                <tr key={filial.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {filial.codigo_filial || '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {filial.cnpj || '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {filial.filial}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {filial.razao_social}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {filial.cidade && filial.estado ? `${filial.cidade}/${filial.estado}` : filial.cidade || filial.estado || '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {getStatusBadge(filial.status)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                    <ActionButtons
                      canView={canView('filiais')}
                      canEdit={canEdit('filiais')}
                      canDelete={canDelete('filiais')}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      item={filial}
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
        {filiais.map((filial) => (
          <div key={filial.id} className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{filial.filial}</h3>
                <p className="text-gray-600 text-xs">{filial.razao_social}</p>
              </div>
              <ActionButtons
                canView={canView('filiais')}
                canEdit={canEdit('filiais')}
                canDelete={canDelete('filiais')}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                item={filial}
                size="xs"
                className="p-2"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500">Código:</span>
                <p className="font-medium">{filial.codigo_filial || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">CNPJ:</span>
                <p className="font-medium">{filial.cnpj || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">Cidade:</span>
                <p className="font-medium">{filial.cidade || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">Estado:</span>
                <p className="font-medium">{filial.estado || '-'}</p>
              </div>
            </div>
            
            <div className="mt-3">
              <span className="text-gray-500 text-xs">Status:</span>
              {getStatusBadge(filial.status)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default FiliaisTable;
