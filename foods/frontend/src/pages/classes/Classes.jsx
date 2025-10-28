import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useClasses } from '../../hooks/useClasses';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import { useExport } from '../../hooks/common/useExport';
import ClassesService from '../../services/classes';
import { Button, ValidationErrorModal, ConfirmModal } from '../../components/ui';
import { CadastroFilterBar } from '../../components/ui';
import { Pagination } from '../../components/ui';
import { ClasseModal } from '../../components/classes';
import ClassesStats from '../../components/classes/ClassesStats';
import ClassesTable from '../../components/classes/ClassesTable';
import { AuditModal, ExportButtons } from '../../components/shared';

const Classes = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  const {
    // Estados
    classes,
    subgrupos,
    loading,
    showModal,
    viewMode,
    editingClasse,
    showValidationModal,
    validationErrors,
    searchTerm,
    statusFilter,
    subgrupoFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    showDeleteConfirmModal,
    classeToDelete,
    sortField,
    sortDirection,

    // Funções CRUD
    onSubmit,
    handleDeleteClasse,
    handleConfirmDelete,
    handleCloseDeleteModal,

    // Funções de modal
    handleAddClasse,
    handleViewClasse,
    handleEditClasse,
    handleCloseModal,
    handleCloseValidationModal,

    // Funções de paginação
    handlePageChange,
    handleItemsPerPageChange,

    // Funções de filtros
    setSearchTerm,
    handleKeyPress,
    setStatusFilter,
    setSubgrupoFilter,
    handleSort,
    handleClearFilters,

    // Funções utilitárias
    formatDate,
    getStatusLabel,
    getSubgrupoNome
  } = useClasses();

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
  } = useAuditoria('classes');

  const { handleExportXLSX, handleExportPDF } = useExport(ClassesService);

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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Classes</h1>
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
          {canCreate('classes') && (
            <Button onClick={handleAddClasse} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <ClassesStats estatisticas={estatisticas} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onKeyPress={handleKeyPress}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onClear={handleClearFilters}
        placeholder="Buscar por nome..."
        additionalFilters={[
          {
            label: 'Subgrupo',
            value: subgrupoFilter,
            onChange: setSubgrupoFilter,
            options: [
              { value: 'todos', label: 'Todos os Subgrupos' },
              ...subgrupos.map(subgrupo => ({
                value: subgrupo.id.toString(),
                label: subgrupo.nome
              }))
            ]
          }
        ]}
      />

      {/* Ações de Exportação */}
      <div className="mb-4">
        <ExportButtons
          onExportXLSX={handleExportXLSX}
          onExportPDF={handleExportPDF}
          disabled={!canView('classes')}
        />
      </div>

      {/* Tabela */}
      <ClassesTable
        classes={classes}
        canView={canView}
        canEdit={canEdit}
        canDelete={canDelete}
        onView={handleViewClasse}
        onEdit={handleEditClasse}
        onDelete={handleDeleteClasse}
        getStatusLabel={getStatusLabel}
        getSubgrupoNome={getSubgrupoNome}
        formatDate={formatDate}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Modal de Classe */}
      <ClasseModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={onSubmit}
        classe={editingClasse}
        isViewMode={viewMode}
        subgrupos={subgrupos}
      />

      {/* Modal de Auditoria */}
      <AuditModal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        title="Relatório de Auditoria - Classes"
        auditLogs={auditLogs}
        auditLoading={auditLoading}
        auditFilters={auditFilters}
        onApplyFilters={handleApplyAuditFilters}
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
        title="Excluir Classe"
        message={`Tem certeza que deseja excluir a classe "${classeToDelete?.nome}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default Classes;
