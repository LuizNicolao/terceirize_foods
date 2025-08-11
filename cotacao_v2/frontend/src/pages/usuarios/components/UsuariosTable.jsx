import React from 'react';
import { FaEdit, FaTrash, FaEye, FaUser, FaEnvelope, FaShieldAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

const UsuariosTable = ({ usuarios, loading, onEdit, onDelete, onView }) => {
  const getRoleLabel = (role) => {
    const roles = {
      'administrador': 'Administrador',
      'gestor': 'Gestor',
      'supervisor': 'Supervisor',
      'comprador': 'Comprador'
    };
    return roles[role] || role;
  };

  const getStatusLabel = (status) => {
    return status === 'ativo' ? 'Ativo' : 'Inativo';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="flex items-center">
                <FaUser className="mr-2 h-4 w-4" />
                Nome
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="flex items-center">
                <FaEnvelope className="mr-2 h-4 w-4" />
                Email
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="flex items-center">
                <FaShieldAlt className="mr-2 h-4 w-4" />
                Tipo
              </div>
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
          {usuarios.length === 0 ? (
            <tr>
              <td colSpan="5" className="px-6 py-12 text-center">
                <div className="text-gray-500">
                  <FaUser className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-lg font-medium">Nenhum usuário encontrado</p>
                  <p className="text-sm">Não há usuários para exibir no momento.</p>
                </div>
              </td>
            </tr>
          ) : (
            usuarios.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <FaUser className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {usuario.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {usuario.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{usuario.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <FaShieldAlt className="mr-1 h-3 w-3" />
                    {getRoleLabel(usuario.role)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    usuario.status === 'ativo'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {usuario.status === 'ativo' ? (
                      <FaCheckCircle className="mr-1 h-3 w-3" />
                    ) : (
                      <FaTimesCircle className="mr-1 h-3 w-3" />
                    )}
                    {getStatusLabel(usuario.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onView(usuario)}
                      className="text-green-600 hover:text-green-900 transition-colors"
                      title="Visualizar"
                    >
                      <FaEye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(usuario)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                      title="Editar"
                    >
                      <FaEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(usuario)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Excluir"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UsuariosTable;
