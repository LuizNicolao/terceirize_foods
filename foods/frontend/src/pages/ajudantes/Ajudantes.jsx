import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useAjudantes } from '../../hooks/useAjudantes';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import { useExport } from '../../hooks/common/useExport';
import AjudantesService from '../../services/ajudantes';
import { Button, ConfirmModal } from '../../components/ui';
import { CadastroFilterBar } from '../../components/ui';
import { Pagination } from '../../components/ui';
import { AjudanteModal } from '../../components/ajudantes';
import AjudantesStats from '../../components/ajudantes/AjudantesStats';
import AjudantesTable from '../../components/ajudantes/AjudantesTable';
import { AuditModal, ExportButtons } from '../../components/shared';
import ValidationErrorModal from '../../components/ui/ValidationErrorModal';

const Ajudantes = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  // Hooks customizados
  const {
    ajudantes,
    filiais,
    loading,
    showModal,
    viewMode,
    editingAjudante,
    searchTerm,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    onSubmit,
    handleDeleteAjudante,
    handleAddAjudante,
    handleViewAjudante,
    handleEditAjudante,
    handleCloseModal,
    handlePageChange,
    setSearchTerm,
    handleKeyPress,
    setItemsPerPage,
    formatDate,
    getStatusLabel,
    sortField,
    sortDirection,
    handleSort,

    // Estados de validação
    validationErrors,
    showValidationModal,
    handleCloseValidationModal,
    showDeleteConfirmModal,
    ajudanteToDelete,
    handleConfirmDelete,
    handleCloseDeleteModal
  } = useAjudantes();

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
  } = useAuditoria('ajudantes');

  const { handleExportXLSX, handleExportPDF } = useExport(AjudantesService);

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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Ajudantes</h1>
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
          {canCreate('ajudantes') && (
            <Button onClick={handleAddAjudante} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <AjudantesStats estatisticas={estatisticas} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onKeyPress={handleKeyPress}
        onClear={() => setSearchTerm('')}
        placeholder="Buscar por nome, CPF, telefone ou email..."
      />

      {/* Ações de Exportação */}
      <div className="mb-4">
        <ExportButtons
          onExportXLSX={handleExportXLSX}
          onExportPDF={handleExportPDF}
          disabled={!canView('ajudantes')}
        />
      </div>

      {/* Tabela */}
      <AjudantesTable
        ajudantes={ajudantes}
        canView={canView}
        canEdit={canEdit}
        canDelete={canDelete}
        onView={handleViewAjudante}
        onEdit={handleEditAjudante}
        onDelete={handleDeleteAjudante}
        getStatusLabel={getStatusLabel}
        formatDate={formatDate}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Modal de Ajudante */}
      <AjudanteModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={onSubmit}
        ajudante={editingAjudante}
        isViewMode={viewMode}
        filiais={filiais}
      />

      {/* Modal de Auditoria */}
      <AuditModal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        title="Relatório de Auditoria - Ajudantes"
        auditLogs={auditLogs}
        auditLoading={auditLoading}
        auditFilters={auditFilters}
        onApplyFilters={handleApplyAuditFilters}
        onExportXLSX={handleExportAuditXLSX}
        onExportPDF={handleExportAuditPDF}
        onFilterChange={(field, value) => setAuditFilters(prev => ({ ...prev, [field]: value }))}
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
        title="Excluir Ajudante"
        message={`Tem certeza que deseja excluir o ajudante "${ajudanteToDelete?.nome}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default Ajudantes;
