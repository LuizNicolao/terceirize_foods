import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useFornecedores } from '../../hooks';
import { useAuditoria } from '../../hooks';
import { Button, ConfirmModal } from '../../components/ui';
import { 
  FornecedorModal, 
  FornecedoresTable, 
  FornecedoresStats
} from '../../components/fornecedores';
import { AuditModal, ExportButtons } from '../../components/shared';
import ValidationErrorModal from '../../components/ui/ValidationErrorModal';
import { CadastroFilterBar } from '../../components/ui';
import { Pagination } from '../../components/ui';

const Fornecedores = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  const {
    // Estados
    fornecedores,
    loading,
    showModal,
    viewMode,
    editingFornecedor,
    searching,
    estatisticas,
    searchTerm,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    validationErrors,
    showValidationModal,
    handleCloseValidationModal,
    showDeleteConfirmModal,
    fornecedorToDelete,

    // Funções
    loadFornecedores,
    reloadData,
    handlePageChange,
    handleItemsPerPageChange,
    handleSearch,
    handleKeyPress,
    handleOpenModal,
    handleCloseModal,
    onSubmit,
    handleDeleteFornecedor,
    handleConfirmDelete,
    handleCloseDeleteModal,
    handleViewAudit,
    handleAuditFilterChange,
    handleExportXLSX,
    handleExportPDF
  ,
    sortField,
    sortDirection,
    handleSort
  } = useFornecedores();

  const {
    showAuditModal,
    auditLogs,
    auditLoading,
    auditFilters,
    auditPagination,
    handleOpenAuditModal,
    handleCloseAuditModal,
    handleApplyAuditFilters,
    handleAuditPageChange,
    handleAuditItemsPerPageChange,
    handleExportAuditXLSX,
    handleExportAuditPDF,
    setAuditFilters
  } = useAuditoria('fornecedores');

  const handleAddNew = () => {
    handleOpenModal(null, false);
  };

  const handleView = (fornecedor) => {
    handleOpenModal(fornecedor, true);
  };

  const handleEdit = (fornecedor) => {
    handleOpenModal(fornecedor, false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando fornecedores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Fornecedores</h1>
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
          {canCreate('fornecedores') && (
            <Button onClick={handleAddNew} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar Fornecedor</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <FornecedoresStats estatisticas={estatisticas} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        onKeyPress={handleKeyPress}
        placeholder="Buscar por razão social, nome fantasia ou CNPJ..."
      />

      {/* Ações de Exportação */}
      <div className="mb-4">
        <ExportButtons
          onExportXLSX={handleExportXLSX}
          onExportPDF={handleExportPDF}
          disabled={!canView('fornecedores')}
        />
      </div>

      {/* Tabela */}
      <FornecedoresTable
        fornecedores={fornecedores}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDeleteFornecedor}
        canView={canView('fornecedores')}
        canEdit={canEdit('fornecedores')}
        canDelete={canDelete('fornecedores')}
      
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Modal de Fornecedor */}
      <FornecedorModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={onSubmit}
        viewMode={viewMode}
        editingFornecedor={editingFornecedor}
      />

      {/* Modal de Auditoria */}
      <AuditModal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        title="Relatório de Auditoria - Fornecedores"
        auditLogs={auditLogs}
        auditLoading={auditLoading}
        auditFilters={auditFilters}
        auditPagination={auditPagination}
        onFilterChange={handleAuditFilterChange}
        onApplyFilters={handleApplyAuditFilters}
        onPageChange={handleAuditPageChange}
        onItemsPerPageChange={handleAuditItemsPerPageChange}
        onExportXLSX={handleExportAuditXLSX}
        onExportPDF={handleExportAuditPDF}
        entityName="fornecedores"
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
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Excluir Fornecedor"
        message={`Tem certeza que deseja excluir o fornecedor "${fornecedorToDelete?.nome}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default Fornecedores;
