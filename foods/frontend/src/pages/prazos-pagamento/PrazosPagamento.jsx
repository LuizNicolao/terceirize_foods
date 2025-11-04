import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { usePrazosPagamento } from '../../hooks/usePrazosPagamento';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import { useExport } from '../../hooks/common/useExport';
import PrazosPagamentoService from '../../services/prazosPagamentoService';
import { Button, ValidationErrorModal, ConfirmModal } from '../../components/ui';
import { CadastroFilterBar } from '../../components/ui';
import { Pagination } from '../../components/ui';
import PrazosPagamentoModal from '../../components/prazos-pagamento/PrazosPagamentoModal';
import PrazosPagamentoStats from '../../components/prazos-pagamento/PrazosPagamentoStats';
import PrazosPagamentoTable from '../../components/prazos-pagamento/PrazosPagamentoTable';
import { AuditModal, ExportButtons } from '../../components/shared';

const PrazosPagamento = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  // Hooks customizados
  const {
    prazosPagamento,
    loading,
    showModal,
    viewMode,
    editingPrazoPagamento,
    showValidationModal,
    validationErrors,
    showDeleteConfirmModal,
    prazoPagamentoToDelete,
    searchTerm,
    statusFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    handleSubmitPrazoPagamento,
    handleDeletePrazoPagamento,
    handleConfirmDelete,
    handleCloseDeleteModal,
    handleAddPrazoPagamento,
    handleViewPrazoPagamento,
    handleEditPrazoPagamento,
    handleCloseModal,
    handleCloseValidationModal,
    handlePageChange,
    handleItemsPerPageChange,
    handleClearFilters,
    setSearchTerm,
    handleKeyPress,
    setStatusFilter,
    getStatusBadge,
    calcularVencimentos,
    formatarParcelas
  } = usePrazosPagamento();

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
  } = useAuditoria('prazos_pagamento');

  // Hook de exportação
  const { handleExportXLSX: exportXLSX, handleExportPDF: exportPDF } = useExport(PrazosPagamentoService);

  // Funções wrapper para exportação com filtros
  const handleExportXLSX = React.useCallback(() => {
    const params = {
      search: searchTerm || undefined,
      ativo: statusFilter === 'ativo' ? 1 : statusFilter === 'inativo' ? 0 : undefined
    };
    return exportXLSX(params);
  }, [exportXLSX, searchTerm, statusFilter]);

  const handleExportPDF = React.useCallback(() => {
    const params = {
      search: searchTerm || undefined,
      ativo: statusFilter === 'ativo' ? 1 : statusFilter === 'inativo' ? 0 : undefined
    };
    return exportPDF(params);
  }, [exportPDF, searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Carregando prazos de pagamento...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Prazos de Pagamento</h1>
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
          {canCreate('prazos_pagamento') && (
            <Button onClick={handleAddPrazoPagamento} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <PrazosPagamentoStats estatisticas={estatisticas} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onKeyPress={handleKeyPress}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onClear={handleClearFilters}
        placeholder="Buscar por nome ou descrição..."
      />

      {/* Ações de Exportação */}
      <div className="mb-4">
        <ExportButtons
          onExportXLSX={handleExportXLSX}
          onExportPDF={handleExportPDF}
          disabled={!canView('prazos_pagamento')}
        />
      </div>

      {/* Tabela */}
      <PrazosPagamentoTable
        prazosPagamento={prazosPagamento}
        onView={handleViewPrazoPagamento}
        onEdit={handleEditPrazoPagamento}
        onDelete={handleDeletePrazoPagamento}
        canView={canView('prazos_pagamento')}
        canEdit={canEdit('prazos_pagamento')}
        canDelete={canDelete('prazos_pagamento')}
        getStatusBadge={getStatusBadge}
        calcularVencimentos={calcularVencimentos}
        formatarParcelas={formatarParcelas}
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

      {/* Modal de Prazo de Pagamento */}
      <PrazosPagamentoModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmitPrazoPagamento}
        prazoPagamento={editingPrazoPagamento}
        viewMode={viewMode}
        loading={loading}
      />

      {/* Modal de Validação */}
      <ValidationErrorModal
        isOpen={showValidationModal}
        onClose={handleCloseValidationModal}
        errors={validationErrors}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o prazo de pagamento "${prazoPagamentoToDelete?.nome}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
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
        pagination={auditPagination}
        onPageChange={handleAuditPageChange}
        onItemsPerPageChange={handleAuditItemsPerPageChange}
        entityName="prazos_pagamento"
      />
    </div>
  );
};

export default PrazosPagamento;

