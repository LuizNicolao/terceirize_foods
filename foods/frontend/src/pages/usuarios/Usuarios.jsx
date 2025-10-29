import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useUsuarios } from '../../hooks/useUsuarios';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import { useExport } from '../../hooks/common/useExport';
import UsuariosService from '../../services/usuarios';
import { Button, ConfirmModal } from '../../components/ui';
import { CadastroFilterBar } from '../../components/ui';
import { Pagination } from '../../components/ui';
import { UsuarioModal } from '../../components/usuarios';
import UsuariosStats from '../../components/usuarios/UsuariosStats';
import UsuariosTable from '../../components/usuarios/UsuariosTable';
import { AuditModal, ExportButtons } from '../../components/shared';
import ValidationErrorModal from '../../components/ui/ValidationErrorModal';

const Usuarios = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  // Hooks customizados
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
    handleKeyPress,
    setItemsPerPage,
    formatDate,
    getStatusLabel,
    getNivelAcessoLabel,
    getTipoAcessoLabel,
    sortField,
    sortDirection,
    handleSort,
    isSortingLocally
  } = useUsuarios();

  const {
    showAuditModal,
    auditLogs,
    auditLoading,
    auditFilters,
    auditPagination,
    handleOpenAuditModal,
    handleCloseAuditModal,
    handleApplyAuditFilters,
    handleAuditPageChange,
    handleAuditItemsPerPageChange,
    handleExportAuditXLSX,
    handleExportAuditPDF,
    setAuditFilters
  } = useAuditoria('usuarios');

  const { handleExportXLSX, handleExportPDF } = useExport(UsuariosService);

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
      {/* Header */}
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
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <UsuariosStats estatisticas={estatisticas} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onKeyPress={handleKeyPress}
        onClear={() => setSearchTerm('')}
        placeholder="Buscar por nome ou email..."
      />

      {/* Ações de Exportação */}
      <div className="mb-4">
        <ExportButtons
          onExportXLSX={handleExportXLSX}
          onExportPDF={handleExportPDF}
          disabled={!canView('usuarios')}
        />
      </div>

      {/* Tabela */}
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
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Modal de Usuário */}
      <UsuarioModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={onSubmit}
        usuario={editingUsuario}
        isViewMode={viewMode}
      />

      {/* Modal de Auditoria */}
      <AuditModal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        logs={auditLogs}
        loading={auditLoading}
        filters={auditFilters}
        auditPagination={auditPagination}
        onApplyFilters={handleApplyAuditFilters}
        onPageChange={handleAuditPageChange}
        onItemsPerPageChange={handleAuditItemsPerPageChange}
        onExportXLSX={handleExportAuditXLSX}
        onExportPDF={handleExportAuditPDF}
        onSetFilters={setAuditFilters}
      />

      {/* Modal de Erros de Validação */}
      <ValidationErrorModal
        isOpen={showValidationModal}
        onClose={handleCloseValidationModal}
        errors={validationErrors?.errors}
        errorCategories={validationErrors?.errorCategories}
      />

      {/* Paginação */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
      />

      {/* Modal de Confirmação de Exclusão */}
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