import React from 'react';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useAjudantes } from '../../hooks/useAjudantes';
import { useAuditoria } from '../../hooks/useAuditoria';
import { useExport } from '../../hooks/useExport';
import { 
  AjudantesStats, 
  AjudantesTable, 
  AjudantesActions 
} from '../../components/ajudantes';
import { AjudanteModal } from '../../components/ajudantes/AjudanteModal';
import { AuditModal } from '../../components/shared';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const Ajudantes = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  const {
    ajudantes,
    filiais,
    loading,
    showModal,
    viewMode,
    editingAjudante,
    searchTerm,
    setSearchTerm,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    handleCreate,
    handleEdit,
    handleDelete,
    handleView,
    handleSubmit,
    handleCloseModal,
    handlePageChange,
    handleItemsPerPageChange,
    handleSearch
  } = useAjudantes();

  const {
    showAuditModal,
    auditLogs,
    auditLoading,
    auditFilters,
    setAuditFilters,
    handleAuditView,
    handleAuditClose,
    handleAuditSearch
  } = useAuditoria();

  const {
    handleExportXLSX,
    handleExportPDF,
    exportLoading
  } = useExport();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ajudantes</h1>
              <p className="mt-1 text-sm text-gray-500">
                Gerencie os ajudantes do sistema
              </p>
            </div>
            
            {/* Actions */}
            <AjudantesActions
              canCreate={canCreate}
              onNew={handleCreate}
              onExportXLSX={() => handleExportXLSX(ajudantes, 'ajudantes')}
              onExportPDF={() => handleExportPDF(ajudantes, 'ajudantes')}
              exportLoading={exportLoading}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <AjudantesStats estatisticas={estatisticas} />

        {/* Table */}
        <AjudantesTable
          ajudantes={ajudantes}
          filiais={filiais}
          canEdit={canEdit}
          canDelete={canDelete}
          canView={canView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onAuditView={handleAuditView}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          searchTerm={searchTerm}
          onSearch={handleSearch}
        />
      </div>

      {/* Modal */}
      <AjudanteModal
        show={showModal}
        viewMode={viewMode}
        ajudante={editingAjudante}
        filiais={filiais}
        onSubmit={handleSubmit}
        onClose={handleCloseModal}
      />

      {/* Audit Modal */}
      <AuditModal
        show={showAuditModal}
        logs={auditLogs}
        loading={auditLoading}
        filters={auditFilters}
        onFiltersChange={setAuditFilters}
        onSearch={handleAuditSearch}
        onClose={handleAuditClose}
      />
    </div>
  );
};

export default Ajudantes;
