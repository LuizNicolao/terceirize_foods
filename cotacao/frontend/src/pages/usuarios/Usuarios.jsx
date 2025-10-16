import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { useUsuarios } from '../../hooks/useUsuarios';
import { usePermissions } from '../../contexts/PermissionsContext';
import UsuariosTable from './components/UsuariosTable';
import UsuariosStats from './components/UsuariosStats';
import UsuariosActions from './components/UsuariosActions';
import { AuditModal } from '../../components/shared';
import { Button, CadastroFilterBar, LoadingSpinner } from '../../components/ui';
import { UsuarioModal } from '../../components/usuarios';

const Usuarios = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  const {
    usuarios,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    showModal,
    viewMode,
    editingUsuario,
    handleView,
    handleEdit,
    handleCreate,
    handleDelete,
    handleCloseModal,
    handleSubmit,
    refetch,
    handleExportXLSX,
    handleExportPDF,
    // Auditoria
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
          <button
            onClick={refetch}
            className="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            Tentar Novamente
          </button>
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
            <Button onClick={handleCreate} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <UsuariosStats usuarios={usuarios} />

      {/* Actions */}
      <UsuariosActions
        onExportXLSX={handleExportXLSX}
        onExportPDF={handleExportPDF}
      />

      {/* Filters */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        placeholder="Buscar usuários..."
      />

      {/* Table */}
      <UsuariosTable
        usuarios={usuarios}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canView={canView('usuarios')}
        canEdit={canEdit('usuarios')}
        canDelete={canDelete('usuarios')}
      />

      {/* Usuario Modal */}
      <UsuarioModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        usuario={editingUsuario}
        isViewMode={viewMode}
      />

      {/* Audit Modal */}
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
