import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useRotas } from '../../hooks/useRotas';
import { useAuditoria } from '../../hooks/useAuditoria';
import { useExport } from '../../hooks/useExport';
import RotasService from '../../services/rotas';
import { Button, ValidationErrorModal } from '../../components/ui';
import CadastroFilterBar from '../../components/CadastroFilterBar';
import Pagination from '../../components/Pagination';
import { RotaModal, RotasTable, RotasStats } from '../../components/rotas';
import AuditModal from '../../components/shared/AuditModal';

const Rotas = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  // Hooks customizados
  const {
    rotas,
    filiais,
    loading,
    loadingFiliais,
    showModal,
    viewMode,
    editingRota,
    searchTerm,
    statusFilter,
    filialFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    unidadesEscolares,
    loadingUnidades,
    showUnidades,
    totalUnidades,
    validationErrors,
    showValidationModal,
    onSubmit,
    handleDeleteRota,
    handleAddRota,
    handleViewRota,
    handleEditRota,
    handleCloseModal,
    closeValidationModal,
    handlePageChange,
    handleItemsPerPageChange,
    setSearchTerm,
    setStatusFilter,
    setFilialFilter,
    toggleUnidades,
    getFilialName,
    formatCurrency,
    formatTipoRota
  } = useRotas();

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
  } = useAuditoria('rotas');

  const { handleExportXLSX, handleExportPDF } = useExport(RotasService);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando rotas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Rotas</h1>
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
          {canCreate('rotas') && (
            <Button onClick={handleAddRota} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar Rota</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <RotasStats estatisticas={estatisticas} formatCurrency={formatCurrency} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        additionalFilters={[
          {
            label: 'Filial',
            value: filialFilter,
            onChange: setFilialFilter,
            options: [
              { value: 'todos', label: loadingFiliais ? 'Carregando...' : 'Todas as filiais' },
              ...filiais.map(filial => ({
                value: filial.id.toString(),
                label: filial.filial
              }))
            ]
          }
        ]}
        placeholder="Buscar por código, nome ou ID..."
      />

      {/* Tabela */}
      <RotasTable
        rotas={rotas}
        canView={canView}
        canEdit={canEdit}
        canDelete={canDelete}
        onView={handleViewRota}
        onEdit={handleEditRota}
        onDelete={handleDeleteRota}
        getFilialName={getFilialName}
        formatCurrency={formatCurrency}
        formatTipoRota={formatTipoRota}
        loadingFiliais={loadingFiliais}
      />

      {/* Modal de Rota */}
      <RotaModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={onSubmit}
        rota={editingRota}
        isViewMode={viewMode}
        filiais={filiais}
        loadingFiliais={loadingFiliais}
        unidadesEscolares={unidadesEscolares}
        loadingUnidades={loadingUnidades}
        showUnidades={showUnidades}
        totalUnidades={totalUnidades}
        onToggleUnidades={toggleUnidades}
      />

      {/* Modal de Auditoria */}
      <AuditModal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        title="Relatório de Auditoria - Rotas"
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
        onClose={closeValidationModal}
        errors={validationErrors?.errors}
        errorCategories={validationErrors?.errorCategories}
      />

      {/* Paginação */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}
    </div>
  );
};

export default Rotas;
