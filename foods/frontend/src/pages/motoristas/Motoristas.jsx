import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useMotoristas } from '../../hooks/useMotoristas';
import { useAuditoria } from '../../hooks/useAuditoria';
import { useExport } from '../../hooks/useExport';
import MotoristasService from '../../services/motoristas';
import { Button } from '../../components/ui';
import { 
  MotoristaModal, 
  MotoristasTable, 
  MotoristasStats,
  MotoristasActions
} from '../../components/motoristas';
import CadastroFilterBar from '../../components/CadastroFilterBar';
import Pagination from '../../components/Pagination';
import AuditModal from '../../components/shared/AuditModal';

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
    searchTerm,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    setSearchTerm,

    // Handlers
    handleAddMotorista,
    handleViewMotorista,
    handleEditMotorista,
    handleCloseModal,
    handleSubmit,
    handleDelete,
    handlePageChange,
    handleItemsPerPageChange,
    handleExportXLSX,
    handleExportPDF
  } = useMotoristas();

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
  } = useAuditoria('motoristas');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando motoristas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Motoristas</h1>
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
          {canCreate('motoristas') && (
            <Button onClick={handleAddMotorista} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar Motorista</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <MotoristasStats estatisticas={estatisticas} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClear={() => setSearchTerm('')}
        placeholder="Buscar por nome, CPF ou CNH..."
      />

      {/* Ações */}
      <MotoristasActions 
        onExportXLSX={handleExportXLSX}
        onExportPDF={handleExportPDF}
      />

      {/* Tabela */}
      <MotoristasTable
        motoristas={motoristas}
        canView={canView}
        canEdit={canEdit}
        canDelete={canDelete}
        onView={handleViewMotorista}
        onEdit={handleEditMotorista}
        onDelete={handleDelete}
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
        title="Relatório de Auditoria - Motoristas"
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

export default Motoristas;
