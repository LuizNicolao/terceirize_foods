import React from 'react';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { Button } from '../ui';

const ProdutosTable = ({ 
  produtos, 
  canView, 
  canEdit, 
  canDelete, 
  onView, 
  onEdit, 
  onDelete, 
  getGrupoName 
}) => {
  if (produtos.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">
        Nenhum produto encontrado
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
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grupo
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
              {produtos.map((produto) => (
                <tr key={produto.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {produto.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {produto.nome}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {produto.codigo_barras}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getGrupoName(produto.grupo_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                      produto.status === 1 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {produto.status === 1 ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      {canView('produtos') && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => onView(produto)}
                          title="Visualizar"
                        >
                          <FaEye className="text-green-600 text-sm" />
                        </Button>
                      )}
                      {canEdit('produtos') && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => onEdit(produto)}
                          title="Editar"
                        >
                          <FaEdit className="text-blue-600 text-sm" />
                        </Button>
                      )}
                      {canDelete('produtos') && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => onDelete(produto.id)}
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
        {produtos.map((produto) => (
          <div key={produto.id} className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{produto.nome}</h3>
                <p className="text-gray-600 text-xs">ID: {produto.id} | Código: {produto.codigo_barras}</p>
              </div>
              <div className="flex gap-2">
                {canView('produtos') && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onView(produto)}
                    title="Visualizar"
                    className="p-2"
                  >
                    <FaEye className="text-green-600 text-sm" />
                  </Button>
                )}
                {canEdit('produtos') && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onEdit(produto)}
                    title="Editar"
                    className="p-2"
                  >
                    <FaEdit className="text-blue-600 text-sm" />
                  </Button>
                )}
                {canDelete('produtos') && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onDelete(produto.id)}
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
                <p className="font-medium">{getGrupoName(produto.grupo_id)}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Status:</span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ml-2 ${
                  produto.status === 1 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {produto.status === 1 ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ProdutosTable;
