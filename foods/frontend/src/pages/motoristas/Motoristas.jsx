import React from 'react';
import { FaPlus, FaHistory, FaDownload, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useMotoristas } from '../../hooks/useMotoristas';
import { useAuditoria } from '../../hooks/useAuditoria';
import { useExport } from '../../hooks/useExport';
import { Button } from '../../components/ui';
import { 
  MotoristaModal, 
  MotoristasTable, 
  MotoristasStats 
} from '../../components/motoristas';
import CadastroFilterBar from '../../components/CadastroFilterBar';
import Pagination from '../../components/Pagination';
import AuditModal from '../../components/AuditModal';

const Motoristas = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  const {
    // Estados
    motoristas,
    filiais,
    loading,
    showModal,
    viewMode,
    editingMotorista,
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
    handleAddMotorista,
    handleViewMotorista,
    handleEditMotorista,
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
  } = useMotoristas();

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
          <h1 className="text-2xl font-bold text-gray-900">Motoristas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie os motoristas da frota
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2">
          {canCreate('motoristas') && (
            <Button onClick={handleAddMotorista} className="flex items-center gap-2">
              <FaPlus className="w-4 h-4" />
              Adicionar Motorista
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
              title="Exportar XLSX"
            >
              <FaFileExcel className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={handleExportPDF}
              className="flex items-center gap-2"
              title="Exportar PDF"
            >
              <FaFilePdf className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <MotoristasStats estatisticas={estatisticas} />

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
        <MotoristasTable
          motoristas={motoristas}
          loading={loading}
          canView={canView}
          canEdit={canEdit}
          canDelete={canDelete}
          onView={handleViewMotorista}
          onEdit={handleEditMotorista}
          onDelete={handleDelete}
        />
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

      {/* Modal de Motorista */}
      <MotoristaModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        motorista={editingMotorista}
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
        title="Auditoria de Motoristas"
      />
    </div>
  );
};

export default Motoristas;
