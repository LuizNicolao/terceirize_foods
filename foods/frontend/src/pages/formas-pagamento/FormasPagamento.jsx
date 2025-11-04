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
    ativoFilter,
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
    setAtivoFilter,
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
  const { handleExportXLSX, handleExportPDF } = useExport(FormasPagamentoService);

  if (loading && formasPagamento.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando formas de pagamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Formas de Pagamento</h1>
              <p className="text-gray-600 mt-1">
                Gerencie as formas de pagamento disponíveis no sistema
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="primary"
                onClick={handleAddFormaPagamento}
                disabled={!canCreate}
              >
                <FaPlus className="mr-2" />
                Nova Forma de Pagamento
              </Button>
            </div>
          </div>

          {/* Estatísticas */}
          <FormasPagamentoStats estatisticas={estatisticas} />
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <CadastroFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onKeyPress={handleKeyPress}
            filters={[
              {
                name: 'ativo',
                label: 'Status',
                value: ativoFilter,
                onChange: setAtivoFilter,
                options: [
                  { value: 'todos', label: 'Todos' },
                  { value: '1', label: 'Ativos' },
                  { value: '0', label: 'Inativos' }
                ]
              }
            ]}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <FormasPagamentoTable
            formasPagamento={formasPagamento}
            onView={handleViewFormaPagamento}
            onEdit={handleEditFormaPagamento}
            onDelete={handleDeleteFormaPagamento}
            canView={canView}
            canEdit={canEdit}
            canDelete={canDelete}
            getStatusBadge={getStatusBadge}
          />

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </div>
          )}
        </div>

        {/* Botões de Exportação e Auditoria */}
        <div className="mt-6 flex justify-end space-x-3">
          <ExportButtons
            onExportXLSX={handleExportXLSX}
            onExportPDF={handleExportPDF}
            entityName="formas-pagamento"
          />
          <Button
            variant="secondary"
            onClick={handleOpenAuditModal}
          >
            <FaQuestionCircle className="mr-2" />
            Auditoria
          </Button>
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
    </div>
  );
};

export default FormasPagamento;

