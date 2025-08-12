import React from 'react';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { Button } from '../ui';

const ClassesTable = ({
  classes,
  canView,
  canEdit,
  canDelete,
  onView,
  onEdit,
  onDelete,
  getStatusLabel,
  getSubgrupoNome,
  formatDate
}) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subgrupo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produtos
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
            {classes.map((classe) => (
              <tr key={classe.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{classe.nome}</div>
                  {classe.descricao && (
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {classe.descricao}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {classe.codigo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getSubgrupoNome(classe.subgrupo_id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                    classe.status === 'ativo'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {getStatusLabel(classe.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {classe.total_produtos || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(classe.criado_em)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    {canView('classes') && (
                      <Button
                        onClick={() => onView(classe)}
                        variant="ghost"
                        size="sm"
                        title="Visualizar"
                      >
                        <FaEye className="h-4 w-4" />
                      </Button>
                    )}
                    {canEdit('classes') && (
                      <Button
                        onClick={() => onEdit(classe)}
                        variant="ghost"
                        size="sm"
                        title="Editar"
                      >
                        <FaEdit className="h-4 w-4" />
                      </Button>
                    )}
                    {canDelete('classes') && (
                      <Button
                        onClick={() => onDelete(classe.id)}
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

      {/* Mobile Cards */}
      <div className="lg:hidden">
        <div className="p-4 space-y-4">
          {classes.map((classe) => (
            <div key={classe.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">{classe.nome}</h3>
                  <p className="text-sm text-gray-500">Código: {classe.codigo}</p>
                  <p className="text-sm text-gray-500">Subgrupo: {getSubgrupoNome(classe.subgrupo_id)}</p>
                  {classe.descricao && (
                    <p className="text-sm text-gray-500 mt-1">{classe.descricao}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {canView('classes') && (
                    <Button
                      onClick={() => onView(classe)}
                      variant="ghost"
                      size="sm"
                      title="Visualizar"
                    >
                      <FaEye className="h-4 w-4" />
                    </Button>
                  )}
                  {canEdit('classes') && (
                    <Button
                      onClick={() => onEdit(classe)}
                      variant="ghost"
                      size="sm"
                      title="Editar"
                    >
                      <FaEdit className="h-4 w-4" />
                    </Button>
                  )}
                  {canDelete('classes') && (
                    <Button
                      onClick={() => onDelete(classe.id)}
                      variant="ghost"
                      size="sm"
                      title="Excluir"
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                  classe.status === 'ativo'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {getStatusLabel(classe.status)}
                </span>
                <div className="text-sm text-gray-500">
                  {classe.total_produtos || 0} produtos
                </div>
              </div>
              <div className="text-xs text-gray-400">
                Criado em: {formatDate(classe.criado_em)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClassesTable;
