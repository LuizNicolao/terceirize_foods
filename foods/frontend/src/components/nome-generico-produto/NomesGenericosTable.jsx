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
  formatDate
}) => {
  if (nomesGenericos.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">
        Nenhum nome genérico encontrado
      </div>
    );
  }

  return (
    <>
      {/* Versão Desktop - Tabela completa */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                    <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                      nomeGenerico.status === 'ativo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {getStatusLabel(nomeGenerico.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {nomeGenerico.total_produtos || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(nomeGenerico.criado_em)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      {canView('nome-generico-produto') && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => onView(nomeGenerico)}
                          title="Visualizar"
                        >
                          <FaEye className="text-green-600 text-sm" />
                        </Button>
                      )}
                      {canEdit('nome-generico-produto') && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => onEdit(nomeGenerico)}
                          title="Editar"
                        >
                          <FaEdit className="text-blue-600 text-sm" />
                        </Button>
                      )}
                      {canDelete('nome-generico-produto') && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => onDelete(nomeGenerico.id)}
                          title="Excluir"
                        >
                          <FaTrash className="text-red-600 text-sm" />
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

      {/* Versão Mobile - Cards */}
      <div className="lg:hidden space-y-3">
        {nomesGenericos.map((nomeGenerico) => (
          <div key={nomeGenerico.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  {nomeGenerico.nome || '-'}
                </h3>
                <p className="text-xs text-gray-500 mb-2">
                  {nomeGenerico.descricao || '-'}
                </p>
              </div>
              <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                nomeGenerico.status === 'ativo' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {getStatusLabel(nomeGenerico.status)}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
              <span>Produtos: {nomeGenerico.total_produtos || 0}</span>
              <span>{formatDate(nomeGenerico.criado_em)}</span>
            </div>
            
            <div className="flex gap-2">
              {canView('nome-generico-produto') && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => onView(nomeGenerico)}
                  title="Visualizar"
                >
                  <FaEye className="text-green-600 text-sm" />
                </Button>
              )}
              {canEdit('nome-generico-produto') && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => onEdit(nomeGenerico)}
                  title="Editar"
                >
                  <FaEdit className="text-blue-600 text-sm" />
                </Button>
              )}
              {canDelete('nome-generico-produto') && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => onDelete(nomeGenerico.id)}
                  title="Excluir"
                >
                  <FaTrash className="text-red-600 text-sm" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default NomesGenericosTable;
