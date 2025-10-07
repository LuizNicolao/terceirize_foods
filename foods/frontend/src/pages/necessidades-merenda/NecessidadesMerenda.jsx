import React from 'react';
import { FaQuestionCircle, FaFileUpload, FaShoppingCart } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useNecessidadesMerenda } from '../../hooks/useNecessidadesMerenda';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import { useExport } from '../../hooks/common/useExport';
import NecessidadesMerendaService from '../../services/necessidadesMerenda';
import { Button, ValidationErrorModal, ConfirmModal } from '../../components/ui';
import { CadastroFilterBar } from '../../components/ui';
import { Pagination } from '../../components/ui';
import { 
  NecessidadeModal, 
  NecessidadeTable, 
  NecessidadeStats, 
  NecessidadeActions,
  NecessidadeUploadModal,
  NecessidadePreviewModal
} from '../../components/necessidades-merenda';
import { AuditModal } from '../../components/shared';

const NecessidadesMerenda = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  // Hook de necessidades da merenda
  const {
    necessidades,
    loading,
    saving,
    showModal,
    showUploadModal,
    showPreviewModal,
    editingNecessidade,
    viewMode,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    searchTerm,
    filtros,
    showDeleteConfirmModal,
    setShowDeleteConfirmModal,
    necessidadeToDelete,
    validationErrors,
    showValidationModal,
    fieldErrors,
    estatisticas,
    loadNecessidades,
    onSubmit,
    handleDeleteNecessidade,
    confirmDeleteNecessidade,
    handleAddNecessidade,
    handleUploadPDF,
    handleViewNecessidade,
    handleEditNecessidade,
    handlePreviewNecessidade,
    handleCloseModal,
    handleCloseUploadModal,
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
    handleExportListaCompras,
    handleAprovarNecessidade,
    handleRejeitarNecessidade
  } = useNecessidadesMerenda();

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
  } = useAuditoria('necessidades_merenda');

  const { handleExportXLSX: exportXLSX, handleExportPDF: exportPDF } = useExport(NecessidadesMerendaService);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Carregando necessidades...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Necessidades da Merenda</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gerencie as necessidades de produtos para a merenda escolar
          </p>
        </div>
        
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <Button
            onClick={handleOpenAuditModal}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            <FaQuestionCircle className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Auditoria</span>
          </Button>
          {canCreate('necessidades_merenda') && (
            <Button onClick={handleUploadPDF} size="sm" variant="outline">
              <FaFileUpload className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Gerar de PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
          )}
          {canCreate('necessidades_merenda') && (
            <Button onClick={handleAddNecessidade} size="sm">
              <FaShoppingCart className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Nova Necessidade</span>
              <span className="sm:hidden">Nova</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <NecessidadeStats estatisticas={estatisticas} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onKeyPress={handleKeyPress}
        filtros={filtros}
        onFiltroChange={handleFiltroChange}
        onClearFiltros={clearFiltros}
        filtrosDisponiveis={[
          {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: [
              { value: '', label: 'Todos os status' },
              { value: 'pendente', label: 'Pendente' },
              { value: 'aprovado', label: 'Aprovado' },
              { value: 'rejeitado', label: 'Rejeitado' },
              { value: 'ativo', label: 'Ativo' }
            ]
          },
          {
            key: 'unidade_escolar_id',
            label: 'Unidade Escolar',
            type: 'select',
            options: [] // Será preenchido dinamicamente
          }
        ]}
      />

      {/* Ações de Exportação */}
      <NecessidadeActions
        onExportXLSX={handleExportXLSX}
        onExportPDF={handleExportPDF}
        onExportListaCompras={handleExportListaCompras}
        totalItems={totalItems}
        selectedItems={[]}
      />

      {/* Tabela */}
      <NecessidadeTable
        necessidades={necessidades}
        canView={canView('necessidades_merenda')}
        canEdit={canEdit('necessidades_merenda')}
        canDelete={canDelete('necessidades_merenda')}
        onView={handleViewNecessidade}
        onEdit={handleEditNecessidade}
        onDelete={handleDeleteNecessidade}
        onPreview={handlePreviewNecessidade}
        loading={loading}
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

      {/* Modais */}
      <NecessidadeModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={onSubmit}
        necessidade={editingNecessidade}
        isViewMode={viewMode}
        saving={saving}
      />

      {/* Modal de Upload PDF */}
      <NecessidadeUploadModal
        isOpen={showUploadModal}
        onClose={handleCloseUploadModal}
        onProcessar={handleUploadPDF}
        onPreview={handlePreviewNecessidade}
      />

      {/* Modal de Preview */}
      <NecessidadePreviewModal
        isOpen={showPreviewModal}
        onClose={handleClosePreviewModal}
        necessidade={editingNecessidade}
        onAprovar={handleAprovarNecessidade}
        onRejeitar={handleRejeitarNecessidade}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        onConfirm={confirmDeleteNecessidade}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir esta necessidade?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Modal de Validação */}
      <ValidationErrorModal
        isOpen={showValidationModal}
        onClose={handleCloseValidationModal}
        errors={validationErrors}
        fieldErrors={fieldErrors}
        onClearFieldError={clearFieldError}
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
        onFiltersChange={setAuditFilters}
      />
    </div>
  );
};

export default NecessidadesMerenda;
