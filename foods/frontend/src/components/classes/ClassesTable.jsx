import React from 'react';
import { ActionButtons } from '../ui';

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
  if (classes.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">
        Nenhuma classe encontrada
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
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
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
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {classes.map((classe) => (
                <tr key={classe.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {classe.codigo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {classe.nome}
                    </div>
                    {classe.descricao && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {classe.descricao}
                      </div>
                    )}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <ActionButtons
                      canView={canView('classes')}
                      canEdit={canEdit('classes')}
                      canDelete={canDelete('classes')}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      item={classe}
                      size="xs"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Versão Mobile - Cards */}
      <div className="lg:hidden space-y-3">
        {classes.map((classe) => (
          <div key={classe.id} className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{classe.nome}</h3>
                <p className="text-gray-600 text-xs">Código: {classe.codigo}</p>
              </div>
              <ActionButtons
                canView={canView('classes')}
                canEdit={canEdit('classes')}
                canDelete={canDelete('classes')}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                item={classe}
                size="xs"
                className="p-2"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-gray-500">Subgrupo:</span>
                <p className="font-medium">{getSubgrupoNome(classe.subgrupo_id)}</p>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                  classe.status === 'ativo'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {getStatusLabel(classe.status)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Produtos:</span>
                <p className="font-medium">{classe.total_produtos || 0}</p>
              </div>

            </div>
            
            {classe.descricao && (
              <div className="mt-3 text-xs">
                <span className="text-gray-500">Descrição:</span>
                <p className="text-gray-700 mt-1">{classe.descricao}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default ClassesTable;
