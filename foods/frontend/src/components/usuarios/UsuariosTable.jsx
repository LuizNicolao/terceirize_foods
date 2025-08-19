import React from 'react';
import { ActionButtons, EmptyState } from '../ui';

const UsuariosTable = ({ 
  usuarios, 
  canView, 
  canEdit, 
  canDelete, 
  onView, 
  onEdit, 
  onDelete, 
  getTipoAcessoLabel,
  getNivelAcessoLabel,
  getStatusLabel,
  formatDate
}) => {
  if (usuarios.length === 0) {
    return (
      <EmptyState
        title="Nenhum usuário encontrado"
        description="Tente ajustar os filtros de busca ou adicionar um novo usuário"
        icon="usuarios"
      />
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
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo de Acesso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nível
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
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {usuario.nome}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {usuario.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getTipoAcessoLabel(usuario.tipo_de_acesso)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getNivelAcessoLabel(usuario.nivel_de_acesso)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                      usuario.status === 'ativo' 
                        ? 'bg-green-100 text-green-800' 
                        : usuario.status === 'bloqueado'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {getStatusLabel(usuario.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <ActionButtons
                      canView={canView('usuarios')}
                      canEdit={canEdit('usuarios')}
                      canDelete={canDelete('usuarios')}
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

      {/* Versão Mobile - Cards */}
      <div className="lg:hidden space-y-3">
        {usuarios.map((usuario) => (
          <div key={usuario.id} className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{usuario.nome}</h3>
                <p className="text-gray-600 text-xs">Email: {usuario.email}</p>
              </div>
              <ActionButtons
                canView={canView('usuarios')}
                canEdit={canEdit('usuarios')}
                canDelete={canDelete('usuarios')}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                item={usuario}
                size="xs"
                className="p-2"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500">Email:</span>
                <p className="font-medium">{usuario.email}</p>
              </div>
              <div>
                <span className="text-gray-500">Tipo:</span>
                <p className="font-medium">{getTipoAcessoLabel(usuario.tipo_de_acesso)}</p>
              </div>
              <div>
                <span className="text-gray-500">Nível:</span>
                <p className="font-medium">{getNivelAcessoLabel(usuario.nivel_de_acesso)}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Status:</span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ml-2 ${
                  usuario.status === 'ativo' 
                    ? 'bg-green-100 text-green-800' 
                    : usuario.status === 'bloqueado'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {getStatusLabel(usuario.status)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default UsuariosTable;
