import React from 'react';
import { ActionButtons, EmptyState } from '../ui';

const roleLabels = {
  administrador: 'Administrador',
  gestor: 'Gestor',
  supervisor: 'Supervisor',
  comprador: 'Comprador'
};

const statusLabels = {
  ativo: 'Ativo',
  inativo: 'Inativo'
};

const statusStyles = {
  ativo: 'bg-green-100 text-green-800',
  inativo: 'bg-red-100 text-red-800'
};

const UsuariosTable = ({
  usuarios = [],
  canView = false,
  canEdit = false,
  canDelete = false,
  onView,
  onEdit,
  onDelete
}) => {
  if (!usuarios.length) {
    return (
      <EmptyState
        title="Nenhum usuário encontrado"
        description="Ajuste os filtros de busca ou adicione um novo usuário."
        icon="usuarios"
      />
    );
  }

  return (
    <>
      <div className="hidden xl:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  E-mail
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usuarios.map(usuario => (
                <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {usuario.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {usuario.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {roleLabels[usuario.role] || usuario.role || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[usuario.status] || 'bg-gray-100 text-gray-800'}`}
                    >
                      {statusLabels[usuario.status] || usuario.status || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <ActionButtons
                      canView={canView}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      item={usuario}
                      size="xs"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="xl:hidden space-y-3">
        {usuarios.map(usuario => (
          <div key={usuario.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{usuario.name}</h3>
                <p className="text-xs text-gray-500">{usuario.email}</p>
              </div>
              <ActionButtons
                canView={canView}
                canEdit={canEdit}
                canDelete={canDelete}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                item={usuario}
                size="xs"
                className="p-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
              <div>
                <span className="font-medium text-gray-700">Tipo:</span>
                <div>{roleLabels[usuario.role] || usuario.role || '-'}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <div>
                  <span
                    className={`inline-flex px-2 py-1 rounded-full font-medium ${statusStyles[usuario.status] || 'bg-gray-100 text-gray-800'}`}
                  >
                    {statusLabels[usuario.status] || usuario.status || '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default UsuariosTable;
