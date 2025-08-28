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
import { IntoleranciaModal, IntoleranciasTable } from '../../components/intolerancias';
import { AuditModal } from '../../components/shared';
import ValidationErrorModal from '../../components/ui/ValidationErrorModal';

const Intolerancias = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  // Debug logs
  console.log('Permissões:', {
    canView: canView('intolerancias'),
    canEdit: canEdit('intolerancias'),
    canDelete: canDelete('intolerancias'),
    canCreate: canCreate('intolerancias')
  });
  
  console.log('Estados dos modais:', {
    showModal,
    viewMode,
    editingIntolerancia,
    showAuditModal
  });
  
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
    setStatusFilter
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

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={[
          { value: '', label: 'Todos os status' },
          { value: 'ativo', label: 'Ativo' },
          { value: 'inativo', label: 'Inativo' }
        ]}
        onExportXLSX={() => handleExportXLSX({ search: searchTerm, status: statusFilter })}
        onExportPDF={() => handleExportPDF({ search: searchTerm, status: statusFilter })}
        totalItems={totalItems}
      />

      {/* Tabela */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <IntoleranciasTable
          intolerancias={intolerancias}
          onView={handleViewIntolerancia}
          onEdit={handleEditIntolerancia}
          onDelete={handleDeleteIntolerancia}
          canView={canView}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      </div>

      {/* Paginação */}
      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>

      {/* Modal de Intolerância */}
      <IntoleranciaModal
        show={showModal}
        onClose={handleCloseModal}
        onSubmit={onSubmit}
        intolerancia={editingIntolerancia}
        viewMode={viewMode}
        loading={loading}
      />

      {/* Modal de Auditoria */}
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
        resourceName="intolerâncias"
      />

      {/* Modal de Erros de Validação */}
      <ValidationErrorModal
        isOpen={showValidationModal}
        onClose={handleCloseValidationModal}
        errors={validationErrors}
      />
    </div>
  );
};

export default Intolerancias;
