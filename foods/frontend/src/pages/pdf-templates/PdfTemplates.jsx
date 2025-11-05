import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { usePdfTemplates } from '../../hooks/usePdfTemplates';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import { Button, ValidationErrorModal, ConfirmModal } from '../../components/ui';
import { CadastroFilterBar } from '../../components/ui';
import { Pagination } from '../../components/ui';
import { PdfTemplatesModal, PdfTemplatesTable } from '../../components/pdf-templates';
import { AuditModal } from '../../components/shared';

const PdfTemplates = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  // Hooks customizados
  const {
    templates,
    loading,
    showModal,
    viewMode,
    editingTemplate,
    showValidationModal,
    validationErrors,
    showDeleteConfirmModal,
    templateToDelete,
    telasDisponiveis,
    searchTerm,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    handleSubmitTemplate,
    handleDeleteTemplate,
    handleConfirmDelete,
    handleCloseDeleteModal,
    handleAddTemplate,
    handleViewTemplate,
    handleEditTemplate,
    handleCloseModal,
    handleCloseValidationModal,
    handlePageChange,
    handleItemsPerPageChange,
    setSearchTerm,
    handleKeyPress
  } = usePdfTemplates();

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
  } = useAuditoria('pdf_templates');

  // Função auxiliar para obter label da tela
  const getTelaLabel = (telaValue) => {
    const tela = telasDisponiveis.find(t => t.value === telaValue);
    return tela ? tela.label : telaValue || '-';
  };

  if (loading && !templates.length) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Carregando templates de PDF...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Templates de PDF</h1>
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
          {canCreate('pdf_templates') && (
            <Button onClick={handleAddTemplate} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Novo Template</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6">
        <CadastroFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onKeyPress={handleKeyPress}
          placeholder="Buscar por nome ou descrição..."
        />
      </div>

      {/* Tabela */}
      <PdfTemplatesTable
        templates={templates}
        onView={canView('pdf_templates') ? handleViewTemplate : null}
        onEdit={canEdit('pdf_templates') ? handleEditTemplate : null}
        onDelete={canDelete('pdf_templates') ? handleDeleteTemplate : null}
        canView={canView('pdf_templates')}
        canEdit={canEdit('pdf_templates')}
        canDelete={canDelete('pdf_templates')}
        getTelaLabel={getTelaLabel}
      />

      {/* Paginação */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {/* Modal */}
      <PdfTemplatesModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmitTemplate}
        template={editingTemplate}
        viewMode={viewMode}
        telasDisponiveis={telasDisponiveis}
        loading={loading}
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

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o template "${templateToDelete?.nome}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default PdfTemplates;

