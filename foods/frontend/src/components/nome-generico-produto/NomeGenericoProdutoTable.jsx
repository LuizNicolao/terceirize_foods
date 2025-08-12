import React from 'react';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { Button } from '../ui';

const NomeGenericoProdutoTable = ({
  nomesGenericos,
  canView,
  canEdit,
  canDelete,
  onView,
  onEdit,
  onDelete,
  getStatusLabel,
  getGrupoNome,
  getSubgrupoNome,
  getClasseNome,
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
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grupo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subgrupo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Classe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {nomeGenerico.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {nomeGenerico.nome}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getGrupoNome(nomeGenerico.grupo_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getSubgrupoNome(nomeGenerico.subgrupo_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getClasseNome(nomeGenerico.classe_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                      nomeGenerico.status === 1
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {getStatusLabel(nomeGenerico.status)}
                    </span>
                  </td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     {formatDate(nomeGenerico.created_at)}
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      {canView('nome_generico_produto') && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => onView(nomeGenerico)}
                          title="Visualizar"
                        >
                          <FaEye className="text-green-600 text-sm" />
                        </Button>
                      )}
                      {canEdit('nome_generico_produto') && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => onEdit(nomeGenerico)}
                          title="Editar"
                        >
                          <FaEdit className="text-blue-600 text-sm" />
                        </Button>
                      )}
                      {canDelete('nome_generico_produto') && (
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
          <div key={nomeGenerico.id} className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{nomeGenerico.nome}</h3>
                <p className="text-gray-600 text-xs">ID: {nomeGenerico.id}</p>
              </div>
              <div className="flex gap-2">
                {canView('nome_generico_produto') && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onView(nomeGenerico)}
                    title="Visualizar"
                    className="p-2"
                  >
                    <FaEye className="text-green-600 text-sm" />
                  </Button>
                )}
                {canEdit('nome_generico_produto') && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onEdit(nomeGenerico)}
                    title="Editar"
                    className="p-2"
                  >
                    <FaEdit className="text-blue-600 text-sm" />
                  </Button>
                )}
                {canDelete('nome_generico_produto') && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onDelete(nomeGenerico.id)}
                    title="Excluir"
                    className="p-2"
                  >
                    <FaTrash className="text-red-600 text-sm" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500">Grupo:</span>
                <p className="font-medium">{getGrupoNome(nomeGenerico.grupo_id)}</p>
              </div>
              <div>
                <span className="text-gray-500">Subgrupo:</span>
                <p className="font-medium">{getSubgrupoNome(nomeGenerico.subgrupo_id)}</p>
              </div>
              <div>
                <span className="text-gray-500">Classe:</span>
                <p className="font-medium">{getClasseNome(nomeGenerico.classe_id)}</p>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                                     nomeGenerico.status === 1
                     ? 'bg-green-100 text-green-800'
                     : 'bg-red-100 text-red-800'
                }`}>
                  {getStatusLabel(nomeGenerico.status)}
                </span>
              </div>
            </div>
            
                         <div className="mt-3 text-xs">
               <span className="text-gray-500">Criado em:</span>
               <p className="font-medium">{formatDate(nomeGenerico.created_at)}</p>
             </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default NomeGenericoProdutoTable;
