import React from 'react';
import { useUsuarios } from '../../hooks/useUsuarios';
import { usePermissions } from '../../contexts/PermissionsContext';
import { AuditModal } from '../../components/shared';
import {
  ConfirmModal,
  LoadingSpinner
} from '../../components/ui';
import {
  UsuarioModal,
  UsuariosActions,
  UsuariosStats,
  UsuariosTable
} from '../../components/usuarios';
import { UsuariosHeader, UsuariosFilters } from './components';

const Usuarios = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();

  const {
    usuarios,
    filteredUsuarios,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    handleClearFilters,
    showModal,
    viewMode,
    editingUsuario,
    modalLoading,
    saving,
    handleAddUser,
    handleViewUser,
    handleEditUser,
    handleCloseModal,
    onSubmit,
    showDeleteConfirmModal,
    usuarioToDelete,
    handleDeleteUser,
    handleConfirmDelete,
    handleCloseDeleteModal,
    handleExportXLSX,
    handleExportPDF,
    showAuditModal,
    auditLogs,
    auditLoading,
    auditFilters,
    handleOpenAuditModal,
    handleCloseAuditModal,
    handleApplyAuditFilters,
    handleExportAuditXLSX,
    handleExportAuditPDF,
    setAuditFilters
  } = useUsuarios();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-red-600 text-lg mb-4">Erro ao carregar usuários</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <Button onClick={() => window.location.reload()} size="sm">
            Recarregar página
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-6">
      <UsuariosHeader
        canCreate={canCreate('usuarios')}
        canView={canView('usuarios')}
        onAddUser={handleAddUser}
        onShowHelp={handleOpenAuditModal}
        loading={loading}
      />

      <UsuariosStats usuarios={usuarios} />

      <UsuariosActions
        onExportXLSX={handleExportXLSX}
        onExportPDF={handleExportPDF}
        disabled={!canView('usuarios') || usuarios.length === 0}
      />

      <UsuariosFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onClear={handleClearFilters}
      />

      <UsuariosTable
        usuarios={filteredUsuarios}
        canView={canView('usuarios')}
        canEdit={canEdit('usuarios')}
        canDelete={canDelete('usuarios')}
        onView={handleViewUser}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />

      <UsuarioModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={onSubmit}
        usuario={editingUsuario}
        isViewMode={viewMode}
        isSaving={saving || modalLoading}
      />

      <ConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Excluir Usuário"
        message={
          usuarioToDelete
            ? `Tem certeza que deseja excluir o usuário "${usuarioToDelete.name}"?`
            : 'Tem certeza que deseja excluir este usuário?'
        }
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />

      <AuditModal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        logs={auditLogs}
        loading={auditLoading}
        filters={auditFilters}
        onApplyFilters={handleApplyAuditFilters}
        onExportXLSX={handleExportAuditXLSX}
        onExportPDF={handleExportAuditPDF}
        onSetFilters={setAuditFilters}
      />
    </div>
  );
};

export default Usuarios;
