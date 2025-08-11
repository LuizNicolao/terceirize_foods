import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useUsuarioForm } from '../../hooks/useUsuarioForm';
import { UsuarioForm, UsuarioPermissions, UsuarioActions } from '../../components/usuarios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const EditarUsuario = () => {
  const { id } = useParams();
  const {
    formData,
    permissions,
    formErrors,
    isSubmitting,
    loading,
    error,
    isNewUser,
    handleInputChange,
    handlePermissionChange,
    handleSubmit,
    handleCancel
  } = useUsuarioForm(id);

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner />
          </div>
        </div>
      </Layout>
    );
  }

  if (error && !isNewUser) {
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

  return (
    <Layout>
      <div className="p-6">
        {/* Header e Ações */}
        <UsuarioActions 
          isSubmitting={isSubmitting}
          handleSubmit={handleSubmit}
          handleCancel={handleCancel}
        />

        {/* Formulário de Usuário */}
        <UsuarioForm
          formData={formData}
          formErrors={formErrors}
          isNewUser={isNewUser}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
        />

        {/* Permissões */}
        <UsuarioPermissions
          permissions={permissions}
          handlePermissionChange={handlePermissionChange}
        />
      </div>
    </Layout>
  );
};

export default EditarUsuario;
