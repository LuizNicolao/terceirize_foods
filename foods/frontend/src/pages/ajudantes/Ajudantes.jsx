import React from 'react';
import { FaPlus, FaHistory, FaDownload, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useAjudantes } from '../../hooks/useAjudantes';
import { useAuditoria } from '../../hooks/useAuditoria';
import { useExport } from '../../hooks/useExport';
import { Button } from '../../components/ui';
import { 
  AjudanteModal, 
  AjudantesTable, 
  AjudantesStats 
} from '../../components/ajudantes';
import CadastroFilterBar from '../../components/CadastroFilterBar';
import Pagination from '../../components/Pagination';
import AuditModal from '../../components/AuditModal';

const Ajudantes = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  const {
    // Estados
    ajudantes,
    filiais,
    loading,
    showModal,
    viewMode,
    editingAjudante,
    showAuditModal,
    auditLogs,
    auditLoading,
    auditFilters,
    estatisticas,
    searchTerm,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,

    // Setters
    setAuditFilters,
    setSearchTerm,

    // Handlers
    handleAddAjudante,
    handleViewAjudante,
    handleEditAjudante,
    handleCloseModal,
    handleOpenAuditModal,
    handleCloseAuditModal,
    handleApplyAuditFilters,
    handleSearch,
    handleFilter,
    handleSubmit,
    handleDelete,
    handlePageChange,
    handleItemsPerPageChange,
    handleExportXLSX,
    handleExportPDF,
    handleExportAuditXLSX,
    handleExportAuditPDF
  } = useAjudantes();

  const {
    formatDate,
    getActionLabel,
    getFieldLabel,
    formatFieldValue
  } = useAuditoria();

  const {
    handleExportXLSX: handleExportXLSXAudit,
    handleExportPDF: handleExportPDFAudit
  } = useExport();

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ajudantes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie os ajudantes da equipe
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2">
          {canCreate('ajudantes') && (
            <Button onClick={handleAddAjudante} className="flex items-center gap-2">
              <FaPlus className="w-4 h-4" />
              Adicionar Ajudante
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={handleOpenAuditModal}
            className="flex items-center gap-2"
          >
            <FaHistory className="w-4 h-4" />
            Auditoria
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportXLSX}
              className="flex items-center gap-2"
            >
              <FaFileExcel className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={handleExportPDF}
              className="flex items-center gap-2"
            >
              <FaFilePdf className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <AjudantesStats estatisticas={estatisticas} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearch={handleSearch}
        onFilter={handleFilter}
        filters={[
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: [
              { value: '', label: 'Todos' },
              { value: 'ativo', label: 'Ativo' },
              { value: 'inativo', label: 'Inativo' },
              { value: 'ferias', label: 'Em Férias' },
              { value: 'licenca', label: 'Em Licença' }
            ]
          },
          {
            name: 'filial_id',
            label: 'Filial',
            type: 'select',
            options: [
              { value: '', label: 'Todas' },
              ...filiais.map(filial => ({
                value: filial.id.toString(),
                label: filial.filial
              }))
            ]
          }
        ]}
      />

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <AjudantesTable
            ajudantes={ajudantes}
            canView={canView}
            canEdit={canEdit}
            canDelete={canDelete}
            onView={handleViewAjudante}
            onEdit={handleEditAjudante}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Paginação */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {/* Modal de Ajudante */}
      <AjudanteModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        ajudante={editingAjudante}
        isViewMode={viewMode}
        filiais={filiais}
        loadingFiliais={false}
      />

      {/* Modal de Auditoria */}
      <AuditModal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        logs={auditLogs}
        loading={auditLoading}
        filters={auditFilters}
        onFilterChange={setAuditFilters}
        onApplyFilters={handleApplyAuditFilters}
        onExportXLSX={handleExportAuditXLSX}
        onExportPDF={handleExportAuditPDF}
        formatDate={formatDate}
        getActionLabel={getActionLabel}
        getFieldLabel={getFieldLabel}
        formatFieldValue={formatFieldValue}
        title="Auditoria de Ajudantes"
      />
    </div>
  );
};

export default Ajudantes;
