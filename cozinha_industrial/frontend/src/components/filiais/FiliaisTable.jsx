import React from 'react';
import { ActionButtons, EmptyState } from '../ui';

const FiliaisTable = ({
  filiais,
  loading,
  canView,
  canEdit,
  canDelete,
  onView,
  onEdit,
  onDelete,
  formatDate,
  mode = 'normal' // 'normal' ou 'consulta'
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!filiais || filiais.length === 0) {
    return (
      <EmptyState
        title="Nenhuma filial encontrada"
        description={mode === 'consulta' ? 
          "Não há filiais cadastradas no sistema Foods" : 
          "Tente ajustar os filtros de busca ou adicionar uma nova filial"
        }
        icon="filiais"
      />
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
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
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filiais.map((filial) => (
              <tr key={filial.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {filial.codigo_filial || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {filial.cnpj || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {filial.filial}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {filial.razao_social}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{filial.cidade}</div>
                  <div className="text-sm text-gray-500">{filial.estado}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(filial.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end">
                    {mode === 'consulta' ? (
                      <ActionButtons
                        canView={canView}
                        canEdit={false}
                        canDelete={false}
                        onView={onView}
                        item={filial}
                        size="sm"
                      />
                    ) : (
                      <ActionButtons
                        canView={canView}
                        canEdit={canEdit}
                        canDelete={canDelete}
                        onView={onView}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        item={filial}
                        size="sm"
                      />
                    )}
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

export default FiliaisTable;
