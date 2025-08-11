import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaUser, FaEnvelope, FaShieldAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Layout from '../../components/Layout';
import { useUsuarios } from '../../hooks';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const VisualizarUsuario = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { selectedUsuario, loading, error, fetchUsuario } = useUsuarios();

  React.useEffect(() => {
    if (id) {
      fetchUsuario(id);
    }
  }, [id, fetchUsuario]);

  const handleBack = () => {
    navigate('/usuarios');
  };

  const handleEdit = () => {
    navigate(`/usuarios/${id}/editar`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800">
              <strong>Erro:</strong> {error}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!selectedUsuario) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-yellow-800">
              Usuário não encontrado
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Visualizar Usuário
          </h1>
          <div className="flex gap-3">
            <button
              onClick={handleBack}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <FaArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </button>
            <button
              onClick={handleEdit}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <FaEdit className="mr-2 h-4 w-4" />
              Editar
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaUser />
                Informações Básicas
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <p className="text-gray-900">{selectedUsuario.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900">{selectedUsuario.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Usuário
                  </label>
                  <p className="text-gray-900 capitalize">{selectedUsuario.role}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <div className="flex items-center gap-2">
                    {selectedUsuario.status === 'ativo' ? (
                      <FaCheckCircle className="text-green-500" />
                    ) : (
                      <FaTimesCircle className="text-red-500" />
                    )}
                    <span className={`capitalize ${
                      selectedUsuario.status === 'ativo' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {selectedUsuario.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaShieldAlt />
                Permissões
              </h2>
              {selectedUsuario.permissions ? (
                <div className="space-y-3">
                  {Object.entries(selectedUsuario.permissions).map(([screen, permissions]) => (
                    <div key={screen} className="border border-gray-200 rounded-lg p-3">
                      <h3 className="font-medium text-gray-900 mb-2 capitalize">
                        {screen}
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(permissions).map(([permission, hasPermission]) => (
                          <div key={permission} className="flex items-center gap-2">
                            {hasPermission ? (
                              <FaCheckCircle className="text-green-500 text-sm" />
                            ) : (
                              <FaTimesCircle className="text-red-500 text-sm" />
                            )}
                            <span className="text-sm text-gray-700">
                              {permission.replace('can_', '').replace(/_/g, ' ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nenhuma permissão configurada</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VisualizarUsuario;
