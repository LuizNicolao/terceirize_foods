import React from 'react';
import { usePermissions } from '../../contexts/PermissionsContext';
import { usePermissoes } from '../../hooks/usePermissoes';
import { useAuditoria } from '../../hooks/useAuditoria';
import { useExport } from '../../hooks/useExport';
import PermissoesService from '../../services/permissoes';
import { PermissoesStats, PermissoesActions, PermissoesTable, PermissoesForm, UserSelector } from '../../components/permissoes';
import { AuditModal } from '../../components/shared';
import { PermissoesHeader, PermissoesFilters } from './components';

const Permissoes = () => {
  const { canEdit, canView } = usePermissions();

  const {
    usuarios,
    loading,
    selectedUserId,
    selectedUser,
    editingPermissions,
    saving,
    searchTerm,
    isSelectOpen,
    showPermissionsModal,
    estatisticas,
    handleSavePermissions,
    handleUserSelect,
    handlePermissionChange,
    handleSearchChange,
    handleStatusFilterChange,
    handleRoleFilterChange,
    handleClearFilters,
    setIsSelectOpen,
    setShowPermissionsModal,
    statusFilter,
    roleFilter,
    getStatusLabel
  } = usePermissoes();

  const { handleExportXLSX, handleExportPDF } = useExport({
    entityName: 'permissoes',
    exportXLSXEndpoint: '/permissoes/export/xlsx',
    exportPDFEndpoint: '/permissoes/export/pdf'
  });

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
  } = useAuditoria('permissoes');

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
    <div className="p-3 sm:p-6 space-y-6">
      <PermissoesHeader
        canView={canView('permissoes')}
        onShowHelp={handleOpenAuditModal}
        loading={loading}
      />

      <PermissoesStats estatisticas={estatisticas} />

      <PermissoesFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        roleFilter={roleFilter}
        onRoleFilterChange={handleRoleFilterChange}
        onClearFilters={handleClearFilters}
        loading={loading}
      />

      <PermissoesActions
        onExportXLSX={handleExportXLSX}
        onExportPDF={handleExportPDF}
      />

      <UserSelector
        usuarios={usuarios}
        selectedUserId={selectedUserId}
        selectedUser={selectedUser}
        isSelectOpen={isSelectOpen}
        onUserSelect={handleUserSelect}
        setIsSelectOpen={setIsSelectOpen}
      />

      <PermissoesTable
        usuarios={usuarios}
        canEdit={canEdit}
        onUserSelect={handleUserSelect}
        getStatusLabel={getStatusLabel}
      />

      <PermissoesForm
        isOpen={showPermissionsModal}
        onClose={() => setShowPermissionsModal(false)}
        editingPermissions={editingPermissions}
        saving={saving}
        onPermissionChange={handlePermissionChange}
        onSavePermissions={handleSavePermissions}
      />

      <AuditModal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        title="Relatório de Auditoria - Permissões"
        auditLogs={auditLogs}
        auditLoading={auditLoading}
        auditFilters={auditFilters}
        onApplyFilters={handleApplyAuditFilters}
        onExportXLSX={handleExportAuditXLSX}
        onExportPDF={handleExportAuditPDF}
        onFilterChange={(field, value) => setAuditFilters((prev) => ({ ...prev, [field]: value }))}
      />
    </div>
  );
};

export default Permissoes;
