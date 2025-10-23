import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useSubgrupos } from '../../hooks/useSubgrupos';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import { useExport } from '../../hooks/common/useExport';
import SubgruposService from '../../services/subgrupos';
import { Button, ValidationErrorModal, ConfirmModal } from '../../components/ui';
import { CadastroFilterBar } from '../../components/ui';
import { Pagination } from '../../components/ui';
import { SubgrupoModal } from '../../components/subgrupos';
import SubgruposStats from '../../components/subgrupos/SubgruposStats';
import SubgruposTable from '../../components/subgrupos/SubgruposTable';
import { AuditModal, ExportButtons } from '../../components/shared';

const Subgrupos = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  const {
    // Estados
    subgrupos,
    grupos,
    loading,
    showModal,
    viewMode,
    editingSubgrupo,
    showValidationModal,
    validationErrors,
    searchTerm,
    statusFilter,
    grupoFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    showDeleteConfirmModal,
    subgrupoToDelete,

    // Funções CRUD
    onSubmit,
    handleDeleteSubgrupo,
    handleConfirmDelete,
    handleCloseDeleteModal,

    // Funções de modal
    handleAddSubgrupo,
    handleViewSubgrupo,
    handleEditSubgrupo,
    handleCloseModal,
    handleCloseValidationModal,

    // Funções de paginação
    handlePageChange,

    // Funções de filtros
    setSearchTerm,
    handleKeyPress,
    setStatusFilter,
    setGrupoFilter,
    handleClearFilters,

    // Funções utilitárias
    formatDate,
    getStatusLabel,
    getGrupoNome
  } = useSubgrupos();

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
  } = useAuditoria('subgrupos');

  const { handleExportXLSX, handleExportPDF } = useExport(SubgruposService);

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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Subgrupos</h1>
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
          {canCreate('subgrupos') && (
            <Button onClick={handleAddSubgrupo} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <SubgruposStats estatisticas={estatisticas} />

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
            label: 'Grupo',
            value: grupoFilter,
            onChange: setGrupoFilter,
            options: [
              { value: 'todos', label: 'Todos os Grupos' },
              ...grupos.map(grupo => ({
                value: grupo.id.toString(),
                label: grupo.nome
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
          disabled={!canView('subgrupos')}
        />
      </div>

      {/* Tabela */}
      <SubgruposTable
        subgrupos={subgrupos}
        canView={canView}
        canEdit={canEdit}
        canDelete={canDelete}
        onView={handleViewSubgrupo}
        onEdit={handleEditSubgrupo}
        onDelete={handleDeleteSubgrupo}
        getStatusLabel={getStatusLabel}
        getGrupoNome={getGrupoNome}
        formatDate={formatDate}
      />

      {/* Modal de Subgrupo */}
      <SubgrupoModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={onSubmit}
        subgrupo={editingSubgrupo}
        isViewMode={viewMode}
        grupos={grupos}
      />

      {/* Modal de Auditoria */}
      <AuditModal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        title="Relatório de Auditoria - Subgrupos"
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
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Excluir Subgrupo"
        message={`Tem certeza que deseja excluir o subgrupo "${subgrupoToDelete?.nome}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default Subgrupos;
