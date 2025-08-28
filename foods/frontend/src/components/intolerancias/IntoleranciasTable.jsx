import React from 'react';
import { ActionButtons, EmptyState } from '../ui';

const IntoleranciasTable = ({ 
  intolerancias, 
  canView, 
  canEdit, 
  canDelete, 
  onView, 
  onEdit, 
  onDelete, 
  formatDate 
}) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      ativo: { color: 'bg-green-100 text-green-800', text: 'Ativo' },
      inativo: { color: 'bg-red-100 text-red-800', text: 'Inativo' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (!intolerancias || intolerancias.length === 0) {
    return <EmptyState message="Nenhuma intolerância encontrada" />;
  }

  return (
    <>
      {/* Versão Desktop - Tabela */}
      <div className="hidden lg:block bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {intolerancia.nome}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(intolerancia.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <ActionButtons
                      canView={!!onView}
                      canEdit={!!onEdit}
                      canDelete={!!onDelete}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      item={intolerancia}
                      size="xs"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Versão Mobile - Cards */}
      <div className="lg:hidden space-y-3">
        {intolerancias.map((intolerancia) => (
          <div key={intolerancia.id} className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{intolerancia.nome}</h3>
              </div>
              <ActionButtons
                canView={!!onView}
                canEdit={!!onEdit}
                canDelete={!!onDelete}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                item={intolerancia}
                size="xs"
                className="p-2"
              />
            </div>
            
            <div className="flex items-center">
              <span className="text-gray-500 text-xs mr-2">Status:</span>
              {getStatusBadge(intolerancia.status)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default IntoleranciasTable;
