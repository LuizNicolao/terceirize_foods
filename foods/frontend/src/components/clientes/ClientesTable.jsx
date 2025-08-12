import React from 'react';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { Button } from '../ui';

const ClientesTable = ({
  clientes,
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

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
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
                Criado em
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clientes.map((cliente) => (
              <tr key={cliente.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {cliente.cnpj || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm text-gray-900">
                      {cliente.municipio || '-'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {cliente.uf || '-'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
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
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(cliente.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(cliente.criado_em)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {canView('clientes') && (
                      <Button
                        onClick={() => onView(cliente)}
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FaEye className="h-4 w-4" />
                      </Button>
                    )}
                    {canEdit('clientes') && (
                      <Button
                        onClick={() => onEdit(cliente)}
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:text-green-900"
                      >
                        <FaEdit className="h-4 w-4" />
                      </Button>
                    )}
                    {canDelete('clientes') && (
                      <Button
                        onClick={() => onDelete(cliente.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {clientes.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500 text-sm">Nenhum cliente encontrado</div>
        </div>
      )}
    </div>
  );
};

export default ClientesTable;
