import React from 'react';
import { ActionButtons, EmptyState , SortableTableHeader } from '../ui';

const ClientesTable = ({
  clientes,
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
      ativo: { label: 'Ativo', className: 'bg-green-100 text-green-800' },
      inativo: { label: 'Inativo', className: 'bg-red-100 text-red-800' },
      pendente: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' }
    };

    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (clientes.length === 0) {
    return (
      <EmptyState
        title="Nenhum cliente encontrado"
        description="Tente ajustar os filtros de busca ou adicionar um novo cliente"
        icon="clientes"
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
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CNPJ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localização
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
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
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
                        {cliente.razao_social || '-'}
                      </div>
                      {cliente.nome_fantasia && (
                        <div className="text-sm text-gray-500">
                          {cliente.nome_fantasia}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {cliente.cnpj || '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm text-gray-900">
                        {cliente.municipio || '-'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {cliente.uf || '-'}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex flex-col">
                      {cliente.email && (
                        <div className="text-sm text-gray-900">
                          {cliente.email}
                        </div>
                      )}
                      {cliente.telefone && (
                        <div className="text-sm text-gray-500">
                          {cliente.telefone}
                        </div>
                      )}
                      {!cliente.email && !cliente.telefone && (
                        <div className="text-sm text-gray-400">-</div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {getStatusBadge(cliente.status)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                    <ActionButtons
                      canView={canView('clientes')}
                      canEdit={canEdit('clientes')}
                      canDelete={canDelete('clientes')}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      item={cliente}
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
        {clientes.map((cliente) => (
          <div key={cliente.id} className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{cliente.razao_social || '-'}</h3>
                {cliente.nome_fantasia && (
                  <p className="text-gray-600 text-xs">{cliente.nome_fantasia}</p>
                )}
              </div>
              <ActionButtons
                canView={canView('clientes')}
                canEdit={canEdit('clientes')}
                canDelete={canDelete('clientes')}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                item={cliente}
                size="xs"
                className="p-2"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500">CNPJ:</span>
                <p className="font-medium">{cliente.cnpj || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">UF:</span>
                <p className="font-medium">{cliente.uf || '-'}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Cidade:</span>
                <p className="font-medium">{cliente.municipio || '-'}</p>
              </div>
              {cliente.email && (
                <div className="col-span-2">
                  <span className="text-gray-500">Email:</span>
                  <p className="font-medium truncate">{cliente.email}</p>
                </div>
              )}
              {cliente.telefone && (
                <div className="col-span-2">
                  <span className="text-gray-500">Telefone:</span>
                  <p className="font-medium">{cliente.telefone}</p>
                </div>
              )}
            </div>
            
            <div className="mt-3">
              <span className="text-gray-500 text-xs">Status:</span>
              {getStatusBadge(cliente.status)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ClientesTable;
