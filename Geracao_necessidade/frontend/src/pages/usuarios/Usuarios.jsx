import React, { useState, useEffect } from 'react';
import { FaUsers } from 'react-icons/fa';
import { useUsuarios } from '../../hooks/useUsuarios';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useUsuariosFilters } from '../../hooks/useUsuariosFilters';
import {
  UsuarioModal,
  UsuariosLayout,
  UsuariosStats,
  UsuariosFilters,
  UsuariosTable,
  UsuariosActions,
  UsuariosLoading
} from '../../components/usuarios';
import { PermissoesModal } from '../../components/permissoes';
import toast from 'react-hot-toast';

const Usuarios = () => {
  const { canView, canCreate, canEdit, canDelete, loading: permissionsLoading } = usePermissions();
  const {
    usuarios,
    loading,
    error,
    pagination,
    carregarUsuarios,
    criarUsuario,
    atualizarUsuario,
    deletarUsuario
  } = useUsuarios();

  const {
    filtros,
    updateFiltros,
    clearFiltros,
    setPage,
    setLimit
  } = useUsuariosFilters();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPermissoesModalOpen, setIsPermissoesModalOpen] = useState(false);
  
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [viewMode, setViewMode] = useState(false);

  // Verificar permissões específicas
  const canViewUsuarios = canView('usuarios');
  const canCreateUsuarios = canCreate('usuarios');
  const canEditUsuarios = canEdit('usuarios');
  const canDeleteUsuarios = canDelete('usuarios');

  // Carregar usuários quando as permissões carregarem e os filtros mudarem
  useEffect(() => {
    if (!permissionsLoading && canViewUsuarios) {
      carregarUsuarios(filtros);
    }
  }, [permissionsLoading, canViewUsuarios, carregarUsuarios, filtros]);

  // Funções para modal de usuário
  const handleAddUsuario = () => {
    if (!canCreateUsuarios) {
      toast.error('Você não tem permissão para criar usuários');
      return;
    }
    setSelectedUsuario(null);
    setViewMode(false);
    setIsModalOpen(true);
  };

  const handleEditUsuario = (usuario) => {
    if (!canEditUsuarios) {
      toast.error('Você não tem permissão para editar usuários');
      return;
    }
    setSelectedUsuario(usuario);
    setViewMode(false);
    setIsModalOpen(true);
  };

  const handleViewUsuario = (usuario) => {
    setSelectedUsuario(usuario);
    setViewMode(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUsuario(null);
    setViewMode(false);
  };

  const handleSaveUsuario = async (usuarioData) => {
    setModalLoading(true);
    
    try {
      let result;
      if (selectedUsuario) {
        result = await atualizarUsuario(selectedUsuario.id, usuarioData);
      } else {
        result = await criarUsuario(usuarioData);
      }

      if (result.success) {
        toast.success(selectedUsuario ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!');
        handleCloseModal();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao salvar usuário');
    } finally {
      setModalLoading(false);
    }
  };

  // Funções para modal de permissões
  const handleOpenPermissoes = (usuario) => {
    if (!canEditUsuarios) {
      toast.error('Você não tem permissão para gerenciar permissões');
      return;
    }
    setSelectedUsuario(usuario);
    setIsPermissoesModalOpen(true);
  };

  const handleClosePermissoes = () => {
    setIsPermissoesModalOpen(false);
    setSelectedUsuario(null);
  };

  const handleSavePermissoes = () => {
    toast.success('Permissões atualizadas com sucesso!');
    carregarUsuarios(filtros);
  };

  // Função para deletar usuário
  const handleDeleteUsuario = async (usuario) => {
    if (!canDeleteUsuarios) {
      toast.error('Você não tem permissão para excluir usuários');
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir o usuário "${usuario.nome}"?`)) {
      const result = await deletarUsuario(usuario.id);
      
      if (result.success) {
        toast.success('Usuário excluído com sucesso!');
      } else {
        toast.error(result.error);
      }
    }
  };

  // Verificar se o usuário tem permissão para visualizar
  if (!canViewUsuarios) {
    return (
      <UsuariosLayout>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <FaUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acesso Restrito
          </h2>
          <p className="text-gray-600">
            Você não tem permissão para visualizar usuários.
          </p>
        </div>
      </UsuariosLayout>
    );
  }

  // Loading state
  if (loading && usuarios.length === 0) {
    return (
      <UsuariosLayout>
        <UsuariosLoading />
      </UsuariosLayout>
    );
  }

  return (
    <UsuariosLayout
      actions={
        <UsuariosActions
          canCreate={canCreateUsuarios}
          onAdd={handleAddUsuario}
          loading={loading}
        />
      }
    >
      {/* Estatísticas */}
      <UsuariosStats usuarios={usuarios} />

      {/* Filtros */}
      <UsuariosFilters
        filtros={filtros}
        onFilterChange={updateFiltros}
        onClearFilters={clearFiltros}
        loading={loading}
      />

      {/* Tabela */}
      <UsuariosTable
        usuarios={usuarios}
        loading={loading}
        pagination={pagination}
        canView={canViewUsuarios}
        canEdit={canEditUsuarios}
        canDelete={canDeleteUsuarios}
        onView={handleViewUsuario}
        onEdit={handleEditUsuario}
        onDelete={handleDeleteUsuario}
        onPermissoes={handleOpenPermissoes}
        onAdd={handleAddUsuario}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />

      {/* Error Message */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Modal de Usuário */}
      <UsuarioModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveUsuario}
        usuario={selectedUsuario}
        loading={modalLoading}
        viewMode={viewMode}
      />

      {/* Modal de Permissões */}
      <PermissoesModal
        isOpen={isPermissoesModalOpen}
        onClose={handleClosePermissoes}
        usuario={selectedUsuario}
        onSave={handleSavePermissoes}
      />
    </UsuariosLayout>
  );
};

export default Usuarios;