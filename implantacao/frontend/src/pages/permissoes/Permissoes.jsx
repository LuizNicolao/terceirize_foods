import React from 'react';
import { usePermissions } from '../../contexts/PermissionsContext';
import { usePermissoes } from '../../hooks/usePermissoes';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import { useExport } from '../../hooks/common/useExport';
import PermissoesService from '../../services/permissoes';
import { PermissoesStats } from '../../components/permissoes';
import { ExportButtons } from '../../components/shared';
import PermissoesTable from '../../components/permissoes/PermissoesTable';
import PermissoesForm from '../../components/permissoes/PermissoesForm';
import UserSelector from '../../components/permissoes/UserSelector';
import { AuditModal } from '../../components/shared';
import { PermissoesHeader, PermissoesFilters } from './components';

const Permissoes = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  // Hooks customizados
  const {
    usuarios,
    loading,
    selectedUserId,
    selectedUser,
    userPermissions,
    editingPermissions,
    saving,
    searchTerm,
    isSelectOpen,
    expandedGroups,
    showPermissionsModal,
    estatisticas,
    handleSavePermissions,
    handleUserSelect,
    handlePermissionChange,
    handleExpandGroup,
    handleSearchChange,
    setIsSelectOpen,
    setShowPermissionsModal,
    getStatusLabel
  } = usePermissoes();


  const { handleExportXLSX, handleExportPDF } = useExport(PermissoesService);

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
    <div className="p-3 sm:p-6">
      {/* Header */}
      <PermissoesHeader
        canView={canView('permissoes')}
        onShowHelp={handleOpenAuditModal}
        loading={loading}
      />

      {/* Estatísticas */}
      <PermissoesStats estatisticas={estatisticas} />

      {/* Filtros */}
      <PermissoesFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        loading={loading}
      />

      {/* Ações */}
      {/* Botões de Exportação */}
      <div className="mb-4">
        <ExportButtons
          onExportXLSX={handleExportXLSX}
          onExportPDF={handleExportPDF}
        />
      </div>

      {/* Seletor de Usuário */}
      <UserSelector
        usuarios={usuarios}
        selectedUserId={selectedUserId}
        selectedUser={selectedUser}
        isSelectOpen={isSelectOpen}
        onUserSelect={handleUserSelect}
        setIsSelectOpen={setIsSelectOpen}
      />

      {/* Tabela de Usuários */}
      <PermissoesTable
        usuarios={usuarios}
        canView={canView}
        canEdit={canEdit}
        canDelete={canDelete}
        onUserSelect={handleUserSelect}
        getStatusLabel={getStatusLabel}
      />

      {/* Modal de Permissões */}
      <PermissoesForm
        isOpen={showPermissionsModal}
        onClose={() => setShowPermissionsModal(false)}
        editingPermissions={editingPermissions}
        expandedGroups={expandedGroups}
        saving={saving}
        onPermissionChange={handlePermissionChange}
        onExpandGroup={handleExpandGroup}
        onSavePermissions={handleSavePermissions}
      />

      {/* Modal de Auditoria */}
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
        onFilterChange={(field, value) => setAuditFilters(prev => ({ ...prev, [field]: value }))}
      />
    </div>
  );
};

export default Permissoes;
