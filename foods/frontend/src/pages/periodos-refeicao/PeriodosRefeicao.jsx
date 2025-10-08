import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { usePeriodosRefeicao } from '../../hooks/usePeriodosRefeicao';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import { useExport } from '../../hooks/common/useExport';
import PeriodosRefeicaoService from '../../services/periodosRefeicao';
import { Button } from '../../components/ui';
import { CadastroFilterBar } from '../../components/ui';
import { Pagination } from '../../components/ui';
import { ConfirmModal } from '../../components/ui';
import PeriodoRefeicaoModal from '../../components/periodos-refeicao/PeriodoRefeicaoModal';
import PeriodosRefeicaoStats from '../../components/periodos-refeicao/PeriodosRefeicaoStats';
import PeriodosRefeicaoTable from '../../components/periodos-refeicao/PeriodosRefeicaoTable';
import { AuditModal, ExportButtons } from '../../components/shared';
import ValidationErrorModal from '../../components/ui/ValidationErrorModal';

const PeriodosRefeicao = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  // Hooks customizados
  const {
    periodos,
    loading,
    showModal,
    viewMode,
    editingPeriodo,
    showDeleteConfirmModal,
    periodoToDelete,
    showValidationErrorModal,
    validationErrors,
    errorCategories,
    searchTerm,
    statusFilter,
    filialFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    handleAddPeriodo,
    handleEditPeriodo,
    handleViewPeriodo,
    handleDeletePeriodo,
    confirmDeletePeriodo,
    closeDeleteConfirmModal,
    handleCloseModal,
    onSubmit,
    handleSearch,
    handleKeyPress,
    handleStatusFilter,
    handleFilialFilter,
    handlePageChange,
    handleItemsPerPageChange,
    handleAuditClose,
    handleValidationErrorClose,
    formatDate,
    getStatusLabel
  } = usePeriodosRefeicao();

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
  } = useAuditoria('periodos_refeicao');

  const { handleExportXLSX, handleExportPDF } = useExport(PeriodosRefeicaoService);

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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Períodos de Refeição</h1>
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
          {canCreate('periodos_refeicao') && (
            <Button onClick={handleAddPeriodo} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="mb-4 sm:mb-6">
        <PeriodosRefeicaoStats stats={estatisticas} />
      </div>


      {/* Filtros */}
      <div className="mb-4 sm:mb-6">
        <CadastroFilterBar
          searchTerm={searchTerm}
          onSearchChange={handleSearch}
          onKeyPress={handleKeyPress}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilter}
          additionalFilters={[
            {
              label: 'Filial',
              value: filialFilter,
              onChange: handleFilialFilter,
              options: [
                { value: '', label: 'Todas as Filiais' },
                { value: '1', label: 'Filial 1' },
                { value: '2', label: 'Filial 2' }
              ]
            }
          ]}
          placeholder="Buscar por nome..."
        />
      </div>

      {/* Ações de Exportação */}
      <div className="mb-4">
        <ExportButtons
          onExportXLSX={handleExportXLSX}
          onExportPDF={handleExportPDF}
          disabled={!canView('periodos_refeicao')}
        />
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <PeriodosRefeicaoTable
          periodos={periodos}
          canView={canView}
          canEdit={canEdit}
          canDelete={canDelete}
          onView={handleViewPeriodo}
          onEdit={handleEditPeriodo}
          onDelete={handleDeletePeriodo}
          getStatusLabel={getStatusLabel}
          formatDate={formatDate}
        />
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="mt-4 sm:mt-6">
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

      {/* Modal de Cadastro/Edição */}
      {showModal && (
        <PeriodoRefeicaoModal
          isOpen={showModal}
          onClose={handleCloseModal}
          onSubmit={onSubmit}
          periodo={editingPeriodo}
          isViewMode={viewMode}
        />
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirmModal && (
        <ConfirmModal
          isOpen={showDeleteConfirmModal}
          onClose={closeDeleteConfirmModal}
          onConfirm={confirmDeletePeriodo}
          title="Confirmar Exclusão"
          message={`Tem certeza que deseja excluir o período "${periodoToDelete?.nome}"?`}
          confirmText="Excluir"
          cancelText="Cancelar"
          type="danger"
        />
      )}

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
        title="Histórico de Alterações - Períodos de Refeição"
      />

      {/* Modal de Erros de Validação */}
      {showValidationErrorModal && (
        <ValidationErrorModal
          isOpen={showValidationErrorModal}
          onClose={handleValidationErrorClose}
          errors={validationErrors}
          errorCategories={errorCategories}
          title="Erros de Validação"
        />
      )}
    </div>
  );
};

export default PeriodosRefeicao;
