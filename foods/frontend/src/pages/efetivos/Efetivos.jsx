import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useEfetivosPage } from '../../hooks/useEfetivosPage';
import { useAuditoria } from '../../hooks/useAuditoria';
import { useExport } from '../../hooks/useExport';
import EfetivosService from '../../services/efetivos';
import { Button, ValidationErrorModal } from '../../components/ui';
import { CadastroFilterBar } from '../../components/ui';
import { Pagination } from '../../components/ui';
import { EfetivoModal, EfetivosTable, EfetivosStats, EfetivosActions } from '../../components/efetivos';
import { AuditModal } from '../../components/shared';

const Efetivos = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  // Hooks customizados
  const {
    efetivos,
    loading,
    showModal,
    viewMode,
    editingEfetivo,
    searchTerm,
    statusFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    validationErrors,
    showValidationModal,
    handleCloseValidationModal,
    onSubmit,
    handleDeleteEfetivo,
    handleAddEfetivo,
    handleViewEfetivo,
    handleEditEfetivo,
    handleCloseModal,
    handlePageChange,
    handleItemsPerPageChange,
    setSearchTerm,
    setStatusFilter,
    formatDate
  } = useEfetivosPage();

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
  } = useAuditoria('efetivos');

  const { handleExportXLSX, handleExportPDF } = useExport(EfetivosService);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Carregando efetivos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Efetivos</h1>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button onClick={handleOpenAuditModal} variant="ghost" size="sm">
            <FaQuestionCircle className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Auditoria</span>
            <span className="sm:hidden">Auditoria</span>
          </Button>
          
          {canCreate('efetivos') && (
            <Button onClick={handleAddEfetivo} variant="primary" size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar Efetivo</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <EfetivosStats estatisticas={estatisticas} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        placeholder="Buscar por tipo ou intolerância..."
        statusOptions={[
          { value: 'todos', label: 'Todos' },
          { value: 'PADRAO', label: 'Padrão' },
          { value: 'NAE', label: 'NAE' }
        ]}
      />

      {/* Ações */}
      <EfetivosActions 
        onExportXLSX={handleExportXLSX}
        onExportPDF={handleExportPDF}
        totalItems={totalItems}
      />

      {/* Tabela */}
      <EfetivosTable
        efetivos={efetivos}
        onView={canView('efetivos') ? handleViewEfetivo : null}
        onEdit={canEdit('efetivos') ? handleEditEfetivo : null}
        onDelete={canDelete('efetivos') ? handleDeleteEfetivo : null}
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

      {/* Modal */}
      <EfetivoModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={onSubmit}
        efetivo={editingEfetivo}
        isViewMode={viewMode}
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
        onSetFilters={setAuditFilters}
      />

      {/* Modal de Erros de Validação */}
      <ValidationErrorModal
        isOpen={showValidationModal}
        onClose={handleCloseValidationModal}
        errors={validationErrors?.errors}
        errorCategories={validationErrors?.errorCategories}
      />
    </div>
  );
};

export default Efetivos;
