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
import AuditModal from '../../components/shared/AuditModal';

const Permissoes = () => {
  const { canView } = usePermissions();
  
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
    estatisticas,
    handleSavePermissions,
    handleResetPermissions,
    handleSelectUser,
    handlePermissionChange,
    handleExpandGroup,
    setSearchTerm,
    setIsSelectOpen,
    getStatusLabel,
    getTelaLabel,
    getPermissionLabel
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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Gerenciamento de Permissões</h1>
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
        onSearchChange={setSearchTerm}
        onClear={() => setSearchTerm('')}
        placeholder="Buscar por nome ou email..."
        hideStatusFilter
      />

      {/* Ações */}
      <PermissoesActions 
        onExportXLSX={handleExportXLSX}
        onExportPDF={handleExportPDF}
      />

      {/* Layout em duas colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Tabela de Usuários */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Usuários</h2>
          <PermissoesTable
            usuarios={usuarios}
            canView={canView}
            onSelectUser={handleSelectUser}
            selectedUserId={selectedUserId}
            getStatusLabel={getStatusLabel}
          />
        </div>

        {/* Formulário de Permissões */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Permissões</h2>
          <PermissoesForm
            selectedUser={selectedUser}
            editingPermissions={editingPermissions}
            saving={saving}
            expandedGroups={expandedGroups}
            onSave={handleSavePermissions}
            onReset={handleResetPermissions}
            onPermissionChange={handlePermissionChange}
            onExpandGroup={handleExpandGroup}
            getTelaLabel={getTelaLabel}
            getPermissionLabel={getPermissionLabel}
          />
        </div>
      </div>

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
