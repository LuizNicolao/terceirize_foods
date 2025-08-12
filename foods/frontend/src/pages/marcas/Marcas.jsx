import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useMarcas } from '../../hooks/useMarcas';
import { useAuditoria } from '../../hooks/useAuditoria';
import { useExport } from '../../hooks/useExport';
import MarcasService from '../../services/marcas';
import { Button } from '../../components/ui';
import CadastroFilterBar from '../../components/CadastroFilterBar';
import Pagination from '../../components/Pagination';
import { MarcaModal } from '../../components/marcas';
import MarcasStats from '../../components/marcas/MarcasStats';
import MarcasActions from '../../components/marcas/MarcasActions';
import MarcasTable from '../../components/marcas/MarcasTable';
import AuditModal from '../../components/shared/AuditModal';

const Marcas = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  // Hooks customizados
  const {
    marcas,
    loading,
    showModal,
    viewMode,
    editingMarca,
    searchTerm,
    statusFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    onSubmit,
    handleDeleteMarca,
    handleAddMarca,
    handleViewMarca,
    handleEditMarca,
    handleCloseModal,
    handlePageChange,
    setSearchTerm,
    setStatusFilter,
    setItemsPerPage,
    getStatusLabel
  } = useMarcas();

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
  } = useAuditoria('marcas');

  const { handleExportXLSX, handleExportPDF } = useExport(MarcasService);

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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Marcas</h1>
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
          {canCreate('marcas') && (
            <Button onClick={handleAddMarca} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <MarcasStats estatisticas={estatisticas} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onClear={() => {
          setSearchTerm('');
          setStatusFilter('todos');
        }}
        placeholder="Buscar por marca ou fabricante..."
      />

      {/* Ações */}
      <MarcasActions 
        onExportXLSX={handleExportXLSX}
        onExportPDF={handleExportPDF}
      />

      {/* Tabela */}
      <MarcasTable
        marcas={marcas}
        canView={canView}
        canEdit={canEdit}
        canDelete={canDelete}
        onView={handleViewMarca}
        onEdit={handleEditMarca}
        onDelete={handleDeleteMarca}
        getStatusLabel={getStatusLabel}
      />

      {/* Modal de Marca */}
      <MarcaModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={onSubmit}
        marca={editingMarca}
        isViewMode={viewMode}
      />

      {/* Modal de Auditoria */}
      <AuditModal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        title="Relatório de Auditoria - Marcas"
        auditLogs={auditLogs}
        auditLoading={auditLoading}
        auditFilters={auditFilters}
        onApplyFilters={handleApplyAuditFilters}
        onExportXLSX={handleExportAuditXLSX}
        onExportPDF={handleExportAuditPDF}
        onFilterChange={(field, value) => setAuditFilters(prev => ({ ...prev, [field]: value }))}
      />

      {/* Paginação */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />
      )}
    </div>
  );
};

export default Marcas;
