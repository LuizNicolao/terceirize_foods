import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { useUsuarios } from '../../hooks/useUsuarios';
import { usePermissions } from '../../contexts/PermissionsContext';
import { AuditModal } from '../../components/shared';
import {
  Button,
  CadastroFilterBar,
  ConfirmModal,
  LoadingSpinner
} from '../../components/ui';
import {
  UsuarioModal,
  UsuariosActions,
  UsuariosStats,
  UsuariosTable
} from '../../components/usuarios';

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
    <div className="p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Usuários</h1>
        <div className="flex gap-2 sm:gap-3">
          <Button
            onClick={handleOpenAuditModal}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            <FaQuestionCircle className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Auditoria</span>
          </Button>
          {canCreate('usuarios') && (
            <Button onClick={handleAddUser} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          )}
        </div>
      </div>

      <UsuariosStats usuarios={usuarios} />

      <UsuariosActions
        onExportXLSX={handleExportXLSX}
        onExportPDF={handleExportPDF}
        disabled={!canView('usuarios') || usuarios.length === 0}
      />

      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onClear={handleClearFilters}
        placeholder="Buscar por nome ou e-mail..."
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
