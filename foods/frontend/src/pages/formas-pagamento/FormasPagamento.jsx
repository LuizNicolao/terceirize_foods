import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useFormasPagamento } from '../../hooks/useFormasPagamento';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import { useExport } from '../../hooks/common/useExport';
import FormasPagamentoService from '../../services/formasPagamentoService';
import { Button, ValidationErrorModal, ConfirmModal } from '../../components/ui';
import { CadastroFilterBar } from '../../components/ui';
import { Pagination } from '../../components/ui';
import FormasPagamentoModal from '../../components/formas-pagamento/FormasPagamentoModal';
import FormasPagamentoStats from '../../components/formas-pagamento/FormasPagamentoStats';
import FormasPagamentoTable from '../../components/formas-pagamento/FormasPagamentoTable';
import { AuditModal, ExportButtons } from '../../components/shared';

const FormasPagamento = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  // Hooks customizados
  const {
    formasPagamento,
    loading,
    showModal,
    viewMode,
    editingFormaPagamento,
    showValidationModal,
    validationErrors,
    showDeleteConfirmModal,
    formaPagamentoToDelete,
    searchTerm,
    statusFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    handleSubmitFormaPagamento,
    handleDeleteFormaPagamento,
    handleConfirmDelete,
    handleCloseDeleteModal,
    handleAddFormaPagamento,
    handleViewFormaPagamento,
    handleEditFormaPagamento,
    handleCloseModal,
    handleCloseValidationModal,
    handlePageChange,
    handleItemsPerPageChange,
    handleClearFilters,
    setSearchTerm,
    handleKeyPress,
    setStatusFilter,
    getStatusBadge
  } = useFormasPagamento();

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
  } = useAuditoria('formas_pagamento');

  // Hook de exportação
  const { handleExportXLSX: exportXLSX, handleExportPDF: exportPDF } = useExport(FormasPagamentoService);

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
          <span className="ml-3 text-gray-600">Carregando formas de pagamento...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Formas de Pagamento</h1>
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
          {canCreate('formas_pagamento') && (
            <Button onClick={handleAddFormaPagamento} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <FormasPagamentoStats estatisticas={estatisticas} />

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
          disabled={!canView('formas_pagamento')}
        />
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow-sm border">
        <FormasPagamentoTable
          formasPagamento={formasPagamento}
          onView={handleViewFormaPagamento}
          onEdit={handleEditFormaPagamento}
          onDelete={handleDeleteFormaPagamento}
          canView={canView('formas_pagamento')}
          canEdit={canEdit('formas_pagamento')}
          canDelete={canDelete('formas_pagamento')}
          getStatusBadge={getStatusBadge}
        />

        {/* Paginação - sempre mostrar para permitir mudança de itens por página */}
        <div className="p-4 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      </div>

      {/* Modal de Forma de Pagamento */}
      <FormasPagamentoModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmitFormaPagamento}
        formaPagamento={editingFormaPagamento}
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
        message={`Tem certeza que deseja excluir a forma de pagamento "${formaPagamentoToDelete?.nome}"? Esta ação não pode ser desfeita.`}
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
        entityName="formas_pagamento"
      />
    </div>
  );
};

export default FormasPagamento;

