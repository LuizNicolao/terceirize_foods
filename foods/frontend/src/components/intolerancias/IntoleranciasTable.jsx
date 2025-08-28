import React from 'react';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { Button } from '../ui';

const IntoleranciasTable = ({ 
  intolerancias, 
  onView, 
  onEdit, 
  onDelete, 
  canView, 
  canEdit, 
  canDelete,
  formatDate 
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
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhuma intolerância encontrada</p>
      </div>
    );
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
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Criado em
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Atualizado em
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
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(intolerancia.criado_em)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(intolerancia.atualizado_em)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  {canView('intolerancias') && (
                    <Button
                      onClick={() => onView(intolerancia)}
                      variant="ghost"
                      size="sm"
                      title="Visualizar"
                    >
                      <FaEye className="h-4 w-4" />
                    </Button>
                  )}
                  {canEdit('intolerancias') && (
                    <Button
                      onClick={() => onEdit(intolerancia)}
                      variant="ghost"
                      size="sm"
                      title="Editar"
                    >
                      <FaEdit className="h-4 w-4" />
                    </Button>
                  )}
                  {canDelete('intolerancias') && (
                    <Button
                      onClick={() => onDelete(intolerancia.id)}
                      variant="ghost"
                      size="sm"
                      title="Excluir"
                      className="text-red-600 hover:text-red-800"
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
  );
};

export default IntoleranciasTable;
