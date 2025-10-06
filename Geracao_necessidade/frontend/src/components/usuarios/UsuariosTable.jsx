import React from 'react';
import { FaUsers } from 'react-icons/fa';
import ActionButtons from '../ui/ActionButtons';
import Button from '../ui/Button';
import { Pagination } from '../shared';

const UsuariosTable = ({ 
  usuarios = [], 
  loading = false,
  pagination = {},
  canView = false,
  canEdit = false,
  canDelete = false,
  onView,
  onEdit,
  onDelete,
  onPermissoes,
  onAdd,
  onPageChange,
  onLimitChange
}) => {
  const getStatusBadge = (ativo) => {
    return ativo ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Ativo
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Inativo
      </span>
    );
  };

  const getTipoUsuarioBadge = (tipo) => {
    const colors = {
      'Coordenacao': 'bg-blue-100 text-blue-800',
      'Supervisao': 'bg-purple-100 text-purple-800',
      'Nutricionista': 'bg-green-100 text-green-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[tipo] || 'bg-gray-100 text-gray-800'}`}>
        {tipo}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-gray-600">Carregando usuários...</span>
        </div>
      </div>
    );
  }

  if (usuarios.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="text-center py-8 text-gray-500">
          <FaUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário encontrado</h3>
          <p className="text-gray-600 mb-4">Comece adicionando usuários ao sistema</p>
          {onAdd && (
            <Button
              onClick={onAdd}
              variant="primary"
              className="inline-flex items-center"
            >
              <FaUsers className="mr-2" />
              Adicionar Usuário
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header da Tabela */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Lista de Usuários ({pagination.totalItems || usuarios.length})
        </h3>
      </div>

      {/* Versão Desktop - Tabela completa */}
      <div className="hidden xl:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rota
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {usuario.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTipoUsuarioBadge(usuario.tipo_usuario)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {usuario.rota || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(usuario.ativo)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <ActionButtons
                      canView={canView}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      canPermissions={canEdit && !!onPermissoes}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onPermissions={onPermissoes}
                      item={usuario}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Versão Mobile e Tablet - Cards */}
      <div className="xl:hidden p-4 space-y-3">
        {usuarios.map((usuario) => (
          <div key={usuario.id} className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{usuario.nome}</h3>
                <p className="text-gray-600 text-xs">{usuario.email}</p>
              </div>
              <ActionButtons
                canView={canView}
                canEdit={canEdit}
                canDelete={canDelete}
                canPermissions={canEdit && !!onPermissoes}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                onPermissions={onPermissoes}
                item={usuario}
                size="xs"
                className="p-2"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-xs">Tipo:</span>
                {getTipoUsuarioBadge(usuario.tipo_usuario)}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-xs">Rota:</span>
                <span className="text-gray-900 text-xs">{usuario.rota || '-'}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-xs">Status:</span>
                {getStatusBadge(usuario.ativo)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          loading={loading}
        />
      )}
    </div>
  );
};

export default UsuariosTable;
