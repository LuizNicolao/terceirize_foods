import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useVeiculos } from '../../hooks/useVeiculos';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import { useExport } from '../../hooks/common/useExport';
import VeiculosService from '../../services/veiculos';
import { Button, ValidationErrorModal, ConfirmModal } from '../../components/ui';
import { CadastroFilterBar } from '../../components/ui';
import { Pagination } from '../../components/ui';
import { VeiculoModal, VeiculosTable, VeiculosStats } from '../../components/veiculos';
import { AuditModal, ExportButtons } from '../../components/shared';

const Veiculos = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  // Hooks customizados
  const {
    veiculos,
    loading,
    showModal,
    viewMode,
    editingVeiculo,
    searchTerm,
    statusFilter,
    tipoFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    validationErrors,
    showValidationModal,
    showDeleteConfirmModal,
    veiculoToDelete,
    onSubmit,
    handleDeleteVeiculo,
    handleConfirmDelete,
    handleCloseDeleteModal,
    handleAddVeiculo,
    handleViewVeiculo,
    handleEditVeiculo,
    handleCloseModal,
    handleCloseValidationModal,
    handlePageChange,
    handleItemsPerPageChange,
    setSearchTerm,
    handleKeyPress,
    setStatusFilter,
    setTipoFilter,
    getStatusLabel,
    getTipoVeiculoLabel,
    getCategoriaLabel,
    formatCurrency
  ,
    sortField,
    sortDirection,
    handleSort
  } = useVeiculos();

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
  } = useAuditoria('veiculos');

  const { handleExportXLSX, handleExportPDF } = useExport(VeiculosService);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando veículos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Veículos</h1>
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
          {canCreate('veiculos') && (
            <Button onClick={handleAddVeiculo} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar Veículo</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <VeiculosStats estatisticas={estatisticas} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onKeyPress={handleKeyPress}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        additionalFilters={[
          {
            label: 'Tipo',
            value: tipoFilter,
            onChange: setTipoFilter,
            options: [
              { value: 'todos', label: 'Todos os tipos' },
              { value: 'caminhao', label: 'Caminhão' },
              { value: 'van', label: 'Van' },
              { value: 'carro', label: 'Carro' },
              { value: 'moto', label: 'Moto' },
              { value: 'onibus', label: 'Ônibus' }
            ]
          }
        ]}
        placeholder="Buscar por placa, marca, modelo ou chassi..."
      />

      {/* Ações de Exportação */}
      <ExportButtons 
        onExportXLSX={handleExportXLSX}
        onExportPDF={handleExportPDF}
      />

      {/* Tabela */}
      <VeiculosTable
        veiculos={veiculos}
        canView={canView}
        canEdit={canEdit}
        canDelete={canDelete}
        onView={handleViewVeiculo}
        onEdit={handleEditVeiculo}
        onDelete={handleDeleteVeiculo}
        getStatusLabel={getStatusLabel}
        getTipoVeiculoLabel={getTipoVeiculoLabel}
        getCategoriaLabel={getCategoriaLabel}
        formatCurrency={formatCurrency}
      
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Modal de Veículo */}
      <VeiculoModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={onSubmit}
        veiculo={editingVeiculo}
        isViewMode={viewMode}
      />

      {/* Modal de Auditoria */}
      <AuditModal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        title="Relatório de Auditoria - Veículos"
        auditLogs={auditLogs}
        auditLoading={auditLoading}
        auditFilters={auditFilters}
        onApplyFilters={handleApplyAuditFilters}
        onExportXLSX={handleExportAuditXLSX}
        onExportPDF={handleExportAuditPDF}
        onFilterChange={(field, value) => setAuditFilters(prev => ({ ...prev, [field]: value }))}
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

      {/* Modal de Erros de Validação */}
      <ValidationErrorModal
        isOpen={showValidationModal}
        onClose={handleCloseValidationModal}
        errors={validationErrors?.errors}
        errorCategories={validationErrors?.errorCategories}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Excluir Veículo"
        message={`Tem certeza que deseja excluir o veículo "${veiculoToDelete?.placa}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default Veiculos;
