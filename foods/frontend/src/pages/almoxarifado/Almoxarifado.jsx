import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useAlmoxarifado } from '../../hooks/useAlmoxarifado';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import { Button, ValidationErrorModal, ConfirmModal } from '../../components/ui';
import { CadastroFilterBarSearchable } from '../../components/ui';
import { Pagination } from '../../components/ui';
import { AlmoxarifadoModal } from '../../components/almoxarifado';
import AlmoxarifadosStats from '../../components/almoxarifado/AlmoxarifadosStats';
import AlmoxarifadosTable from '../../components/almoxarifado/AlmoxarifadosTable';
import { AuditModal } from '../../components/shared';

const Almoxarifado = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  // Hooks customizados
  const {
    almoxarifados,
    loading,
    showModal,
    viewMode,
    editingAlmoxarifado,
    showValidationModal,
    validationErrors,
    searchTerm,
    statusFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    showDeleteConfirmModal,
    almoxarifadoToDelete,
    onSubmit,
    handleDeleteAlmoxarifado,
    handleConfirmDelete,
    handleCloseDeleteModal,
    handleAddAlmoxarifado,
    handleViewAlmoxarifado,
    handleEditAlmoxarifado,
    handleCloseModal,
    handleCloseValidationModal,
    handlePageChange,
    handleItemsPerPageChange,
    setSearchTerm,
    handleKeyPress,
    setStatusFilter,
    handleClearFilters,
    formatDate,
    getStatusLabel,
    sortField,
    sortDirection,
    handleSort,
    carregarAlmoxarifados
  } = useAlmoxarifado();

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
  } = useAuditoria('almoxarifado');

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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Almoxarifados</h1>
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
          {canCreate('almoxarifado') && (
            <Button onClick={handleAddAlmoxarifado} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <AlmoxarifadosStats estatisticas={estatisticas} />

      {/* Filtros */}
      <CadastroFilterBarSearchable
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onKeyPress={handleKeyPress}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onClear={handleClearFilters}
        placeholder="Buscar por nome, código, filial ou centro de custo..."
        useSearchableSelect={false}
      />

      {/* Tabela */}
      <AlmoxarifadosTable
        almoxarifados={almoxarifados}
        canView={canView}
        canEdit={canEdit}
        canDelete={canDelete}
        onView={handleViewAlmoxarifado}
        onEdit={handleEditAlmoxarifado}
        onDelete={handleDeleteAlmoxarifado}
        getStatusLabel={getStatusLabel}
        formatDate={formatDate}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Modal de Almoxarifado */}
      <AlmoxarifadoModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={onSubmit}
        almoxarifado={editingAlmoxarifado}
        isViewMode={viewMode}
        onSuccess={carregarAlmoxarifados}
      />

      {/* Modal de Auditoria */}
      <AuditModal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        title="Relatório de Auditoria - Almoxarifados"
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

      {/* Modal de Erros de Validação */}
      <ValidationErrorModal
        isOpen={showValidationModal}
        onClose={handleCloseValidationModal}
        errors={validationErrors?.errors}
        errorCategories={validationErrors?.errorCategories}
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

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Excluir Almoxarifado"
        message={`Tem certeza que deseja excluir o almoxarifado "${almoxarifadoToDelete?.nome}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default Almoxarifado;

