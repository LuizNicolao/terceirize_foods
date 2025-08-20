import React from 'react';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import PermissionGuard from '../../../components/PermissionGuard';

const UsuariosTable = ({ 
  usuarios, 
  onView, 
  onEdit, 
  onDelete, 
  getRoleLabel, 
  getStatusLabel,
  deletingUserId,
  searchTerm,
  statusFilter
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-4 text-left font-semibold text-gray-700 text-sm border-b border-gray-200">Nome</th>
              <th className="px-4 py-4 text-left font-semibold text-gray-700 text-sm border-b border-gray-200">Email</th>
              <th className="px-4 py-4 text-left font-semibold text-gray-700 text-sm border-b border-gray-200">Tipo</th>
              <th className="px-4 py-4 text-left font-semibold text-gray-700 text-sm border-b border-gray-200">Status</th>
              <th className="px-4 py-4 text-left font-semibold text-gray-700 text-sm border-b border-gray-200">Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8">
                  <div className="text-center text-gray-500 text-base">
                    {searchTerm || statusFilter !== 'todos' 
                      ? 'Nenhum usuário encontrado com os filtros aplicados'
                      : 'Nenhum usuário cadastrado'
                    }
                  </div>
                </td>
              </tr>
            ) : (
              usuarios.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm text-gray-800 border-b border-gray-100">{user.name}</td>
                  <td className="px-4 py-4 text-sm text-gray-800 border-b border-gray-100">{user.email}</td>
                  <td className="px-4 py-4 border-b border-gray-100">
                    <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-4 py-4 border-b border-gray-100">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'ativo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {getStatusLabel(user.status)}
                    </span>
                  </td>
                  <td className="px-4 py-4 border-b border-gray-100">
                    <div className="flex gap-2">
                      <button
                        className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Visualizar"
                        onClick={() => onView(user)}
                      >
                        <FaEye />
                      </button>
                      <PermissionGuard screen="usuarios" action="can_edit">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Editar"
                          onClick={() => onEdit(user)}
                        >
                          <FaEdit />
                        </button>
                      </PermissionGuard>
                      <PermissionGuard screen="usuarios" action="can_delete">
                        <button
                          className={`p-2 rounded transition-colors ${
                            deletingUserId === user.id
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                          title="Excluir"
                          onClick={() => onDelete(user.id)}
                          disabled={deletingUserId === user.id}
                        >
                          <FaTrash />
                        </button>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsuariosTable;
