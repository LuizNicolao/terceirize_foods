import React from 'react';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { Button } from '../ui';

const SubgruposTable = ({ 
  subgrupos, 
  canView, 
  canEdit, 
  canDelete, 
  onView, 
  onEdit, 
  onDelete, 
  getStatusLabel,
  getGrupoNome,
  formatDate
}) => {
  if (subgrupos.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">
        Nenhum subgrupo encontrado
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
                  Produtos
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
              {subgrupos.map((subgrupo) => (
                <tr key={subgrupo.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {subgrupo.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {subgrupo.nome}
                    </div>
                    {subgrupo.descricao && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {subgrupo.descricao}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subgrupo.codigo || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getGrupoNome(subgrupo.grupo_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subgrupo.total_produtos || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                      subgrupo.status === 'ativo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {getStatusLabel(subgrupo.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      {canView('subgrupos') && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => onView(subgrupo)}
                          title="Visualizar"
                        >
                          <FaEye className="text-green-600 text-sm" />
                        </Button>
                      )}
                      {canEdit('subgrupos') && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => onEdit(subgrupo)}
                          title="Editar"
                        >
                          <FaEdit className="text-blue-600 text-sm" />
                        </Button>
                      )}
                      {canDelete('subgrupos') && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => onDelete(subgrupo.id)}
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
        {subgrupos.map((subgrupo) => (
          <div key={subgrupo.id} className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{subgrupo.nome}</h3>
                <p className="text-gray-600 text-xs">ID: {subgrupo.id}</p>
                {subgrupo.codigo && (
                  <p className="text-gray-600 text-xs">Código: {subgrupo.codigo}</p>
                )}
              </div>
              <div className="flex gap-2">
                {canView('subgrupos') && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onView(subgrupo)}
                    title="Visualizar"
                    className="p-2"
                  >
                    <FaEye className="text-green-600 text-sm" />
                  </Button>
                )}
                {canEdit('subgrupos') && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onEdit(subgrupo)}
                    title="Editar"
                    className="p-2"
                  >
                    <FaEdit className="text-blue-600 text-sm" />
                  </Button>
                )}
                {canDelete('subgrupos') && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onDelete(subgrupo.id)}
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
                <p className="font-medium">{getGrupoNome(subgrupo.grupo_id)}</p>
              </div>
              <div>
                <span className="text-gray-500">Produtos:</span>
                <p className="font-medium">{subgrupo.total_produtos || 0}</p>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ml-2 ${
                  subgrupo.status === 'ativo' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {getStatusLabel(subgrupo.status)}
                </span>
              </div>
            </div>
            
            {subgrupo.descricao && (
              <div className="mt-3 text-xs">
                <span className="text-gray-500">Descrição:</span>
                <p className="text-gray-700 mt-1">{subgrupo.descricao}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default SubgruposTable;
