import React from 'react';
import { FaUserCog } from 'react-icons/fa';
import { Button, Table, EmptyState } from '../ui';

const PermissoesTable = ({ 
  usuarios, 
  canView: _canView, 
  canEdit, 
  canDelete: _canDelete, 
  onUserSelect, 
  getStatusLabel
}) => {
  const usuariosProcessados = Array.isArray(usuarios) ? usuarios : [];
  const podeGerenciar = typeof canEdit === 'function' ? canEdit('permissoes') : true;

  if (usuariosProcessados.length === 0) {
    return (
      <EmptyState
        title="Nenhum usuário encontrado"
        description="Ajuste a busca ou os filtros para localizar usuários"
        icon="usuarios"
      />
    );
  }

  const renderAcao = (usuario) => {
    if (!podeGerenciar) {
      return null;
    }

    return (
      <Button
        variant="ghost"
        size="xs"
        onClick={() => onUserSelect(usuario.id)}
        title="Gerenciar Permissões"
      >
        <FaUserCog className="text-purple-600 text-sm" />
      </Button>
    );
  };

  return (
    <>
      {/* Versão Desktop - Tabela completa */}
      <div className="hidden xl:block bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nível</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissões</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usuariosProcessados.map((usuario) => {
              const statusLabel = getStatusLabel(usuario.status);

              return (
                <tr key={usuario.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{usuario.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{usuario.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{usuario.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{usuario.nivel_de_acesso || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{usuario.tipo_de_acesso || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                      usuario.status === 'ativo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {statusLabel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {usuario.permissoes_count || 0} tela(s)
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex gap-2">
                      {renderAcao(usuario)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>

      {/* Versão Mobile e Tablet - Cards */}
      <div className="xl:hidden space-y-3">
        {usuariosProcessados.map((usuario) => {
          const statusLabel = getStatusLabel(usuario.status);

          return (
            <div key={usuario.id} className="bg-white rounded-lg shadow-sm p-4 border">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">{usuario.nome}</h3>
                  <p className="text-gray-600 text-xs">ID: {usuario.id}</p>
                </div>
                <div className="flex gap-2">
                  {renderAcao(usuario)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500">Email:</span>
                  <p className="font-medium truncate">{usuario.email}</p>
                </div>
                <div>
                  <span className="text-gray-500">Nível:</span>
                  <p className="font-medium">{usuario.nivel_de_acesso || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Tipo:</span>
                  <p className="font-medium">{usuario.tipo_de_acesso || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                    usuario.status === 'ativo' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {statusLabel}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Permissões:</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">
                    {usuario.permissoes_count || 0} tela(s)
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default PermissoesTable;
