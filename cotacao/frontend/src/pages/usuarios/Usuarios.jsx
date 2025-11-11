import React from 'react';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useUsuarios } from '../../hooks/useUsuarios';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import { useExport } from '../../hooks/common/useExport';
import UsuariosService from '../../services/usuarios';
import { ConfirmModal, Pagination, ValidationErrorModal } from '../../components/ui';
import { UsuarioModal } from '../../components/usuarios';
import UsuariosStats from '../../components/usuarios/UsuariosStats';
import UsuariosActions from '../../components/usuarios/UsuariosActions';
import UsuariosTable from '../../components/usuarios/UsuariosTable';
import { AuditModal } from '../../components/shared';
import { UsuariosHeader, UsuariosFilters } from './components';

const Usuarios = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();

  const {
    usuarios,
    loading,
    showModal,
    viewMode,
    editingUsuario,
    searchTerm,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    validationErrors,
    showValidationModal,
    handleCloseValidationModal,
    showDeleteConfirmModal,
    usuarioToDelete,
    onSubmit,
    handleDeleteUser,
    handleConfirmDelete,
    handleCloseDeleteModal,
    handleAddUser,
    handleViewUser,
    handleEditUser,
    handleCloseModal,
    handlePageChange,
    setSearchTerm,
    setItemsPerPage,
    formatDate,
    getStatusLabel,
    getNivelAcessoLabel,
    getTipoAcessoLabel
  } = useUsuarios();

  const { handleExportXLSX, handleExportPDF } = useExport(UsuariosService);

  const {
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
  } = useAuditoria('usuarios');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      <UsuariosHeader
        canCreate={canCreate('usuarios')}
        canView={canView('usuarios')}
        onAddUser={handleAddUser}
        onShowHelp={handleOpenAuditModal}
        loading={loading}
      />

      <UsuariosStats estatisticas={estatisticas} />

      <UsuariosFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        loading={loading}
      />

      <UsuariosActions
        onExportXLSX={handleExportXLSX}
        onExportPDF={handleExportPDF}
      />

      <UsuariosTable
        usuarios={usuarios}
        canView={canView}
        canEdit={canEdit}
        canDelete={canDelete}
        onView={handleViewUser}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        getTipoAcessoLabel={getTipoAcessoLabel}
        getNivelAcessoLabel={getNivelAcessoLabel}
        getStatusLabel={getStatusLabel}
        formatDate={formatDate}
      />

      <UsuarioModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={onSubmit}
        usuario={editingUsuario}
        isViewMode={viewMode}
      />

      <ValidationErrorModal
        isOpen={showValidationModal}
        onClose={handleCloseValidationModal}
        errors={validationErrors?.errors}
        errorCategories={validationErrors?.errorCategories}
      />

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />
      )}

      <AuditModal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        title="Relatório de Auditoria - Usuários"
        auditLogs={auditLogs}
        auditLoading={auditLoading}
        auditFilters={auditFilters}
        onApplyFilters={handleApplyAuditFilters}
        onExportXLSX={handleExportAuditXLSX}
        onExportPDF={handleExportAuditPDF}
        onFilterChange={(field, value) => setAuditFilters(prev => ({ ...prev, [field]: value }))}
      />

      <ConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Excluir Usuário"
        message={`Tem certeza que deseja excluir o usuário "${usuarioToDelete?.nome}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default Usuarios; 
