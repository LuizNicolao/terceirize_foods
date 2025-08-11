import React from 'react';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { Button, Table } from '../ui';

const UnidadesEscolaresTable = ({ 
  unidades, 
  canView, 
  canEdit, 
  canDelete, 
  onView, 
  onEdit, 
  onDelete, 
  getRotaName,
  loadingRotas
}) => {
  if (unidades.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">
        Nenhuma unidade escolar encontrada
      </div>
    );
  }

  return (
    <>
      {/* Versão Desktop - Tabela completa */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome da Escola</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cidade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rota</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {unidades.map((unidade) => (
              <tr key={unidade.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{unidade.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{unidade.codigo_teknisa}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{unidade.nome_escola}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{unidade.cidade}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{unidade.estado}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {loadingRotas ? (
                    <span className="text-gray-400">Carregando...</span>
                  ) : (
                    getRotaName(unidade.rota_id)
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                    unidade.status === 'ativo' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {unidade.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => onView(unidade)}
                      title="Visualizar"
                    >
                      <FaEye className="text-green-600 text-sm" />
                    </Button>
                    {canEdit('unidades_escolares') && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => onEdit(unidade)}
                        title="Editar"
                      >
                        <FaEdit className="text-blue-600 text-sm" />
                      </Button>
                    )}
                    {canDelete('unidades_escolares') && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => onDelete(unidade.id)}
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
        </Table>
      </div>

      {/* Versão Mobile - Cards */}
      <div className="lg:hidden space-y-3">
        {unidades.map((unidade) => (
          <div key={unidade.id} className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{unidade.nome_escola}</h3>
                <p className="text-gray-600 text-xs">ID: {unidade.id} | Código: {unidade.codigo_teknisa}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => onView(unidade)}
                  title="Visualizar"
                  className="p-2"
                >
                  <FaEye className="text-green-600 text-sm" />
                </Button>
                {canEdit('unidades_escolares') && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onEdit(unidade)}
                    title="Editar"
                    className="p-2"
                  >
                    <FaEdit className="text-blue-600 text-sm" />
                  </Button>
                )}
                {canDelete('unidades_escolares') && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onDelete(unidade.id)}
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
                <span className="text-gray-500">Cidade:</span>
                <p className="font-medium">{unidade.cidade}</p>
              </div>
              <div>
                <span className="text-gray-500">Estado:</span>
                <p className="font-medium">{unidade.estado}</p>
              </div>
              <div>
                <span className="text-gray-500">Rota:</span>
                <p className="font-medium">
                  {loadingRotas ? 'Carregando...' : getRotaName(unidade.rota_id)}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Centro:</span>
                <p className="font-medium">{unidade.centro_distribuicao || '-'}</p>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-100">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                unidade.status === 'ativo' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {unidade.status === 'ativo' ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default UnidadesEscolaresTable;
