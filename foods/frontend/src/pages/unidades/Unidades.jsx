import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useUnidades } from '../../hooks/useUnidades';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import { useExport } from '../../hooks/common/useExport';
import UnidadesService from '../../services/unidades';
import { Button, ValidationErrorModal, ConfirmModal } from '../../components/ui';
import { CadastroFilterBar } from '../../components/ui';
import { Pagination } from '../../components/ui';
import { UnidadeModal } from '../../components/unidades';
import UnidadesStats from '../../components/unidades/UnidadesStats';
import UnidadesTable from '../../components/unidades/UnidadesTable';
import { AuditModal, ExportButtons } from '../../components/shared';

const Unidades = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  // Hooks customizados
  const {
    unidades,
    loading,
    showModal,
    viewMode,
    editingUnidade,
    searchTerm,
    statusFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    validationErrors,
    showValidationModal,
    showDeleteConfirmModal,
    unidadeToDelete,
    onSubmit,
    handleDeleteUnidade,
    handleConfirmDelete,
    handleCloseDeleteModal,
    handleAddUnidade,
    handleViewUnidade,
    handleEditUnidade,
    handleCloseModal,
    handleCloseValidationModal,
    handlePageChange,
    setSearchTerm,
    handleKeyPress,
    setStatusFilter,
    setItemsPerPage,
    getStatusLabel,
    sortField,
    sortDirection,
    handleSort
  } = useUnidades();

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
  } = useAuditoria('unidades');

  const { handleExportXLSX, handleExportPDF } = useExport(UnidadesService);

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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Unidades</h1>
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
          {canCreate('unidades') && (
            <Button onClick={handleAddUnidade} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <UnidadesStats estatisticas={estatisticas} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onKeyPress={handleKeyPress}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onClear={() => {
          setSearchTerm('');
          setStatusFilter('todos');
        }}
        placeholder="Buscar por nome ou sigla..."
      />

      {/* Ações de Exportação */}
      <div className="mb-4">
        <ExportButtons
          onExportXLSX={handleExportXLSX}
          onExportPDF={handleExportPDF}
          disabled={!canView('unidades')}
        />
      </div>

      {/* Tabela */}
      <UnidadesTable
        unidades={unidades}
        canView={canView}
        canEdit={canEdit}
        canDelete={canDelete}
        onView={handleViewUnidade}
        onEdit={handleEditUnidade}
        onDelete={handleDeleteUnidade}
        getStatusLabel={getStatusLabel}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Modal de Unidade */}
      <UnidadeModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={onSubmit}
        unidade={editingUnidade}
        isViewMode={viewMode}
      />

      {/* Modal de Validação */}
      <ValidationErrorModal
        isOpen={showValidationModal}
        onClose={handleCloseValidationModal}
        errors={validationErrors?.errors}
        errorCategories={validationErrors?.errorCategories}
      />

      {/* Modal de Auditoria */}
      <AuditModal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        title="Relatório de Auditoria - Unidades"
        auditLogs={auditLogs}
        auditLoading={auditLoading}
        auditFilters={auditFilters}
        auditPagination={auditPagination}
        onApplyFilters={handleApplyAuditFilters}
        onPageChange={handleAuditPageChange}
        onItemsPerPageChange={handleAuditItemsPerPageChange}
        onExportXLSX={handleExportAuditXLSX}
        onExportPDF={handleExportAuditPDF}
        onFilterChange={(field, value) => setAuditFilters(prev => ({ ...prev, [field]: value }))}
      />

      {/* Paginação - sempre mostrar para permitir mudança de itens por página */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Excluir Unidade"
        message={`Tem certeza que deseja excluir a unidade "${unidadeToDelete?.nome}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default Unidades;
