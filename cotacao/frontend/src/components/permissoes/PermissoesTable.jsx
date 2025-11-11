import React from 'react';
import { FaUserCog } from 'react-icons/fa';
import { Button, EmptyState } from '../ui';

const roleLabels = {
  administrador: 'Administrador',
  gestor: 'Gestor',
  supervisor: 'Supervisor',
  comprador: 'Comprador'
};

const PermissoesTable = ({ usuarios, canEdit, onUserSelect, getStatusLabel }) => {
  const lista = Array.isArray(usuarios) ? usuarios : [];
  const podeGerenciar = typeof canEdit === 'function' ? canEdit('permissoes') : true;

  if (lista.length === 0) {
    return (
      <EmptyState
        title="Nenhum usuário encontrado"
        description="Ajuste a busca ou os filtros para localizar usuários."
        icon="usuarios"
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">E-mail</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Perfil</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Permissões</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {lista.map((usuario) => {
              const statusLabel = getStatusLabel(usuario.status);

              return (
                <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {usuario.nome || usuario.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {usuario.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {roleLabels[usuario.tipo_de_acesso] || usuario.tipo_de_acesso || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        (usuario.status || '').toLowerCase() === 'ativo'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {statusLabel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {(usuario.permissoes_count || 0)} tela(s)
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {podeGerenciar && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUserSelect(usuario.id)}
                        className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700"
                      >
                        <FaUserCog />
                        <span>Gerenciar</span>
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PermissoesTable;
