import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useIntolerancias } from '../../hooks/useIntolerancias';
import { useAuditoria } from '../../hooks/useAuditoria';
import { useExport } from '../../hooks/useExport';
import IntoleranciasService from '../../services/intolerancias';
import { Button } from '../../components/ui';
import { CadastroFilterBar } from '../../components/ui';
import { Pagination } from '../../components/ui';
import { IntoleranciaModal, IntoleranciasTable, IntoleranciasStats } from '../../components/intolerancias';
import { AuditModal } from '../../components/shared';
import ValidationErrorModal from '../../components/ui/ValidationErrorModal';

const Intolerancias = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  // Hooks customizados
  const {
    intolerancias,
    loading,
    showModal,
    viewMode,
    editingIntolerancia,
    searchTerm,
    statusFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    validationErrors,
    showValidationModal,
    handleCloseValidationModal,
    onSubmit,
    handleDeleteIntolerancia,
    handleAddIntolerancia,
    handleViewIntolerancia,
    handleEditIntolerancia,
    handleCloseModal,
    handlePageChange,
    handleItemsPerPageChange,
    setSearchTerm,
    setStatusFilter,
    formatDate
  } = useIntolerancias();

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
  } = useAuditoria('intolerancias');

  const { handleExportXLSX, handleExportPDF } = useExport(IntoleranciasService);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando intolerâncias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Intolerâncias</h1>
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
          {canCreate('intolerancias') && (
            <Button onClick={handleAddIntolerancia} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar Intolerância</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <IntoleranciasStats estatisticas={estatisticas} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        placeholder="Buscar por nome..."
      />

      {/* Tabela */}
      <IntoleranciasTable
        intolerancias={intolerancias}
        canView={canView}
        canEdit={canEdit}
        canDelete={canDelete}
        onView={handleViewIntolerancia}
        onEdit={handleEditIntolerancia}
        onDelete={handleDeleteIntolerancia}
        formatDate={formatDate}
      />

      {/* Modal de Intolerância */}
      <IntoleranciaModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={onSubmit}
        intolerancia={editingIntolerancia}
        isViewMode={viewMode}
      />

      {/* Modal de Auditoria */}
      <AuditModal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        title="Relatório de Auditoria - Intolerâncias"
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
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}
    </div>
  );
};

export default Intolerancias;
