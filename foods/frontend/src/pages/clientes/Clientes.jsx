import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useClientes } from '../../hooks/useClientes';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import { useExport } from '../../hooks/common/useExport';
import ClientesService from '../../services/clientes';
import { Button, ConfirmModal } from '../../components/ui';
import { CadastroFilterBar } from '../../components/ui';
import { Pagination } from '../../components/ui';
import { ClienteModal, ClientesTable, ClientesStats } from '../../components/clientes';
import { AuditModal, ExportButtons } from '../../components/shared';
import ValidationErrorModal from '../../components/ui/ValidationErrorModal';

const Clientes = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  // Hooks customizados
  const {
    clientes,
    loading,
    showModal,
    viewMode,
    editingCliente,
    searchTerm,
    statusFilter,
    ufFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    validationErrors,
    showValidationModal,
    handleCloseValidationModal,
    showDeleteConfirmModal,
    clienteToDelete,
    onSubmit,
    handleDeleteCliente,
    handleConfirmDelete,
    handleCloseDeleteModal,
    handleAddCliente,
    handleViewCliente,
    handleEditCliente,
    handleCloseModal,
    handlePageChange,
    handleItemsPerPageChange,
    setSearchTerm,
    handleKeyPress,
    setStatusFilter,
    setUfFilter,
    formatDate
  ,
    sortField,
    sortDirection,
    handleSort
  } = useClientes();

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
  } = useAuditoria('clientes');

  const { handleExportXLSX, handleExportPDF } = useExport(ClientesService);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Clientes</h1>
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
          {canCreate('clientes') && (
            <Button onClick={handleAddCliente} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar Cliente</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <ClientesStats estatisticas={estatisticas} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onKeyPress={handleKeyPress}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        additionalFilters={[
          {
            label: 'UF',
            value: ufFilter,
            onChange: setUfFilter,
            options: [
              { value: 'todos', label: 'Todas as UFs' },
              { value: 'SP', label: 'São Paulo' },
              { value: 'RJ', label: 'Rio de Janeiro' },
              { value: 'MG', label: 'Minas Gerais' },
              { value: 'RS', label: 'Rio Grande do Sul' },
              { value: 'PR', label: 'Paraná' },
              { value: 'SC', label: 'Santa Catarina' },
              { value: 'BA', label: 'Bahia' },
              { value: 'GO', label: 'Goiás' },
              { value: 'PE', label: 'Pernambuco' },
              { value: 'CE', label: 'Ceará' },
              { value: 'PA', label: 'Pará' },
              { value: 'MA', label: 'Maranhão' },
              { value: 'AM', label: 'Amazonas' },
              { value: 'MT', label: 'Mato Grosso' },
              { value: 'MS', label: 'Mato Grosso do Sul' },
              { value: 'ES', label: 'Espírito Santo' },
              { value: 'PB', label: 'Paraíba' },
              { value: 'RN', label: 'Rio Grande do Norte' },
              { value: 'AL', label: 'Alagoas' },
              { value: 'PI', label: 'Piauí' },
              { value: 'TO', label: 'Tocantins' },
              { value: 'SE', label: 'Sergipe' },
              { value: 'RO', label: 'Rondônia' },
              { value: 'AC', label: 'Acre' },
              { value: 'AP', label: 'Amapá' },
              { value: 'RR', label: 'Roraima' },
              { value: 'DF', label: 'Distrito Federal' }
            ]
          }
        ]}
        placeholder="Buscar por razão social, nome fantasia ou CNPJ..."
      />

      {/* Ações de Exportação */}
      <div className="mb-4">
        <ExportButtons
          onExportXLSX={handleExportXLSX}
          onExportPDF={handleExportPDF}
          disabled={!canView('clientes')}
        />
      </div>

      {/* Tabela */}
      <ClientesTable
        clientes={clientes}
        canView={canView}
        canEdit={canEdit}
        canDelete={canDelete}
        onView={handleViewCliente}
        onEdit={handleEditCliente}
        onDelete={handleDeleteCliente}
        formatDate={formatDate}
      
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Modal de Cliente */}
      <ClienteModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={onSubmit}
        cliente={editingCliente}
        isViewMode={viewMode}
      />

      {/* Modal de Auditoria */}
      <AuditModal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        title="Relatório de Auditoria - Clientes"
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
      {
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Excluir Cliente"
        message={`Tem certeza que deseja excluir o cliente "${clienteToDelete?.nome}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default Clientes;
