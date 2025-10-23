import React from 'react';
import { FaQuestionCircle, FaPlus, FaFileUpload } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useReceitas } from '../../hooks/useReceitas';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import { useExport } from '../../hooks/common/useExport';
import ReceitasService from '../../services/receitas';
import { Button, ValidationErrorModal, ConfirmModal } from '../../components/ui';
import { CadastroFilterBar } from '../../components/ui';
import { Pagination } from '../../components/ui';
import { 
  ReceitaModal, 
  ReceitaTable, 
  ReceitaStats,
  ReceitaPreviewModal,
  ReceitaUploadModal
} from '../../components/receitas';
import { AuditModal, ExportButtons } from '../../components/shared';

const Receitas = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  // Hook de receitas
  const {
    receitas,
    loading,
    saving,
    showModal,
    showPreviewModal,
    showUploadModal,
    editingReceita,
    viewMode,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    searchTerm,
    filtros,
    showDeleteConfirmModal,
    setShowDeleteConfirmModal,
    receitaToDelete,
    validationErrors,
    showValidationModal,
    fieldErrors,
    estatisticas,
    loadReceitas,
    onSubmit,
    handleDeleteReceita,
    confirmDeleteReceita,
    handleAddReceita,
    handleDuplicateReceita,
    handleViewReceita,
    handleEditReceita,
    handlePreviewReceita,
    handleCloseModal,
    handleClosePreviewModal,
    handlePageChange,
    handleItemsPerPageChange,
    setSearchTerm,
    handleKeyPress,
    handleFiltroChange,
    clearFiltros,
    formatDate,
    getMonthName,
    getFieldError,
    clearFieldError,
    handleCloseValidationModal,
    handleExportXLSX,
    handleExportPDF,
    handleUploadPDF,
    handleCloseUploadModal,
    handleProcessarPDF
  } = useReceitas();

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
  } = useAuditoria('receitas');

  const { handleExportXLSX: exportXLSX, handleExportPDF: exportPDF } = useExport(ReceitasService);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Carregando receitas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Receitas</h1>
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
          {canCreate('receitas') && (
            <Button onClick={handleUploadPDF} size="sm" variant="outline">
              <FaFileUpload className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Upload PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
          )}
          {canCreate('receitas') && (
            <Button onClick={handleAddReceita} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Nova Receita</span>
              <span className="sm:hidden">Nova</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <ReceitaStats estatisticas={estatisticas} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onKeyPress={handleKeyPress}
        onClear={() => setSearchTerm('')}
        placeholder="Buscar por unidade escolar..."
      />
      
      <div className="bg-white p-4 rounded-lg shadow-sm border">
      </div>

      {/* Ações */}
      <div className="mb-4">
        <ExportButtons
          onExportXLSX={exportXLSX}
          onExportPDF={exportPDF}
          disabled={!canView('receitas')}
        />
      </div>

      {/* Tabela */}
      <ReceitaTable
        receitas={receitas}
        canView={canView('receitas')}
        canEdit={canEdit('receitas')}
        canDelete={canDelete('receitas')}
        onView={handleViewReceita}
        onEdit={handleEditReceita}
        onDelete={handleDeleteReceita}
        onPreview={handlePreviewReceita}
        onDuplicate={handleDuplicateReceita}
        formatDate={formatDate}
        getMonthName={getMonthName}
      />

      {/* Paginação */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {/* Modal de Cardápio */}
      <ReceitaModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={onSubmit}
        receita={editingReceita}
        isViewMode={viewMode}
      />


      {/* Modal de Preview */}
      <ReceitaPreviewModal
        isOpen={showPreviewModal}
        onClose={handleClosePreviewModal}
        receita={editingReceita}
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
        onClose={() => setShowDeleteConfirmModal(false)}
        onConfirm={confirmDeleteReceita}
        title="Excluir Cardápio"
        message={`Tem certeza que deseja excluir o receita de ${receitaToDelete?.unidade_escola_nome} - ${receitaToDelete ? getMonthName(receitaToDelete.mes) : ''}/${receitaToDelete?.ano}?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Modal de Upload de PDF */}
      <ReceitaUploadModal
        isOpen={showUploadModal}
        onClose={handleCloseUploadModal}
        onProcessar={handleProcessarPDF}
      />
    </div>
  );
};

export default Receitas;
