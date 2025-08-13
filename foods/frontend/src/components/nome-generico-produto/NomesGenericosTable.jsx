import React from 'react';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { Button } from '../../components/ui';

const NomesGenericosTable = ({
  nomesGenericos,
  canView,
  canEdit,
  canDelete,
  onView,
  onEdit,
  onDelete,
  getStatusLabel,
  getStatusColor,
  formatDate
}) => {
  if (!Array.isArray(nomesGenericos) || nomesGenericos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500 text-lg">Nenhum nome genérico encontrado</p>
        <p className="text-gray-400 text-sm mt-2">
          Tente ajustar os filtros de busca ou adicionar um novo nome genérico
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome Genérico
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produtos Vinculados
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
            {nomesGenericos.map((nomeGenerico) => (
              <tr key={nomeGenerico.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {nomeGenerico.nome || '-'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {nomeGenerico.descricao || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(nomeGenerico.status)}`}>
                    {getStatusLabel(nomeGenerico.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {nomeGenerico.total_produtos || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(nomeGenerico.criado_em)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    {canView('nome-generico-produto') && (
                      <Button
                        onClick={() => onView(nomeGenerico)}
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FaEye className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {canEdit('nome-generico-produto') && (
                      <Button
                        onClick={() => onEdit(nomeGenerico)}
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:text-green-900"
                      >
                        <FaEdit className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {canDelete('nome-generico-produto') && (
                      <Button
                        onClick={() => onDelete(nomeGenerico.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash className="w-4 h-4" />
                      </Button>
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

export default NomesGenericosTable;
