import React, { useState } from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useRelatorioInspecao } from '../../hooks/useRelatorioInspecao';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import { Button, ValidationErrorModal, ConfirmModal, CadastroFilterBar, Pagination } from '../../components/ui';
import { AuditModal, ExportButtons } from '../../components/shared';
import RelatorioInspecaoModal from '../../components/relatorio-inspecao/RelatorioInspecaoModal';
import RIRStats from '../../components/relatorio-inspecao/RIRStats';
import RelatorioInspecaoTable from '../../components/relatorio-inspecao/RelatorioInspecaoTable';

const RelatorioInspecao = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  // Hooks customizados
  const {
    rirs,
    loading,
    showModal,
    viewMode,
    editingRir,
    showValidationModal,
    validationErrors,
    showDeleteConfirmModal,
    rirToDelete,
    grupos,
    searchTerm,
    statusFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    handleSubmitRIR,
    handleDeleteRIR,
    handleConfirmDelete,
    handleCloseDeleteModal,
    handleAddRIR,
    handleViewRIR,
    handleEditRIR,
    handlePrintRIR,
    handleCloseModal,
    handleCloseValidationModal,
    handlePageChange,
    handleItemsPerPageChange,
    handleClearFilters,
    setSearchTerm,
    handleKeyPress,
    setStatusFilter,
    getStatusBadge,
    carregarRIRs
  } = useRelatorioInspecao();

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
  } = useAuditoria('relatorio_inspecao');

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Carregando relatórios de inspeção...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Relatórios de Inspeção de Recebimento</h1>
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
          {canCreate('relatorio_inspecao') && (
            <Button onClick={handleAddRIR} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Novo Relatório</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <RIRStats estatisticas={estatisticas} />

      {/* Filtros */}
      <div className="mb-6">
        <CadastroFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onKeyPress={handleKeyPress}
          onClear={handleClearFilters}
          additionalFilters={[
            {
              label: 'Status',
              value: statusFilter || '',
              onChange: setStatusFilter,
              options: [
                { value: '', label: 'Todos os status' },
                { value: 'APROVADO', label: 'Aprovado' },
                { value: 'REPROVADO', label: 'Reprovado' },
                { value: 'PARCIAL', label: 'Parcial' }
              ]
            }
          ]}
          placeholder="Buscar por NF ou Fornecedor..."
        />
      </div>

      {/* Ações de Exportação */}
      <div className="mb-4">
        <ExportButtons
          onExportXLSX={() => {}}
          onExportPDF={() => {}}
          disabled={!canView('relatorio_inspecao')}
        />
      </div>

      {/* Tabela */}
      <RelatorioInspecaoTable
        rirs={rirs}
        onView={canView('relatorio_inspecao') ? handleViewRIR : null}
        onEdit={canEdit('relatorio_inspecao') ? handleEditRIR : null}
        onDelete={canDelete('relatorio_inspecao') ? handleDeleteRIR : null}
        onPrint={canView('relatorio_inspecao') ? handlePrintRIR : null}
        canView={canView('relatorio_inspecao')}
        canEdit={canEdit('relatorio_inspecao')}
        canDelete={canDelete('relatorio_inspecao')}
        canPrint={canView('relatorio_inspecao')}
        getStatusBadge={getStatusBadge}
      />

      {/* Paginação - sempre mostrar para permitir mudança de itens por página */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {/* Modal */}
      <RelatorioInspecaoModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmitRIR}
        onSuccess={carregarRIRs}
        rir={editingRir}
        viewMode={viewMode}
        grupos={grupos}
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
        message={`Tem certeza que deseja excluir o relatório de inspeção #${rirToDelete?.id?.toString().padStart(4, '0') || ''}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default RelatorioInspecao;
