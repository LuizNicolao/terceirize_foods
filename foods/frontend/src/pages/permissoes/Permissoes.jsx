import React from 'react';
import { FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { usePermissoes } from '../../hooks/usePermissoes';
import { useAuditoria } from '../../hooks/useAuditoria';
import { useExport } from '../../hooks/useExport';
import PermissoesService from '../../services/permissoes';
import { Button } from '../../components/ui';
import CadastroFilterBar from '../../components/CadastroFilterBar';
import { PermissoesStats } from '../../components/permissoes';
import PermissoesActions from '../../components/permissoes/PermissoesActions';
import PermissoesTable from '../../components/permissoes/PermissoesTable';
import PermissoesForm from '../../components/permissoes/PermissoesForm';
import UserSelector from '../../components/permissoes/UserSelector';
import AuditModal from '../../components/shared/AuditModal';

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

  const { handleExportXLSX, handleExportPDF } = useExport(PermissoesService);

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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Gerenciar Permissões</h1>
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
        </div>
      </div>

      {/* Estatísticas */}
      <PermissoesStats estatisticas={estatisticas} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onClear={() => handleSearchChange('')}
        placeholder="Buscar por nome ou email..."
      />

      {/* Ações */}
      <PermissoesActions 
        onExportXLSX={handleExportXLSX}
        onExportPDF={handleExportPDF}
      />

      {/* Seletor de Usuário */}
      <UserSelector
        usuarios={usuarios}
        selectedUserId={selectedUserId}
        selectedUser={selectedUser}
        isSelectOpen={isSelectOpen}
        searchTerm={searchTerm}
        onUserSelect={handleUserSelect}
        onSearchChange={handleSearchChange}
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
