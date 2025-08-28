import React from 'react';
import { ActionButtons, EmptyState } from '../ui';

const IntoleranciasTable = ({ 
  intolerancias, 
  onView, 
  onEdit, 
  onDelete, 
  canView, 
  canEdit, 
  canDelete
}) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      ativo: { className: 'bg-green-100 text-green-800', label: 'Ativo' },
      inativo: { className: 'bg-red-100 text-red-800', label: 'Inativo' }
    };

    const config = statusConfig[status] || statusConfig.inativo;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (!intolerancias || intolerancias.length === 0) {
    return <EmptyState message="Nenhuma intolerância encontrada" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nome
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
          {intolerancias.map((intolerancia) => (
            <tr key={intolerancia.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {intolerancia.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {intolerancia.nome}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(intolerancia.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end">
                  <ActionButtons
                    canView={canView('intolerancias')}
                    canEdit={canEdit('intolerancias')}
                    canDelete={canDelete('intolerancias')}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    item={intolerancia}
                    size="sm"
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IntoleranciasTable;
