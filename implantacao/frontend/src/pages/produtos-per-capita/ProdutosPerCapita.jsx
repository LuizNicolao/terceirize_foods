import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useProdutosPerCapita } from '../../hooks/useProdutosPerCapita';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import { useExport } from '../../hooks/common/useExport';
import ProdutosPerCapitaService from '../../services/produtosPerCapita';
import { Button, ValidationErrorModal, ConfirmModal, Pagination } from '../../components/ui';
import { 
  ProdutosPerCapitaStats,
  ProdutosPerCapitaActions,
  ProdutosPerCapitaTable
} from './components';
import { ProdutoPerCapitaModal } from '../../components/produtos-per-capita';
import { AuditModal } from '../../components/shared';
import { CadastroFilterBar } from '../../components/ui';

/**
 * Página principal de Produtos Per Capita
 * Segue padrão de excelência do sistema
 */
const ProdutosPerCapita = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  // Hook principal para produtos per capita
  const {
    produtos,
    loading,
    showModal,
    viewMode,
    editingItem: editingProduto,
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
    showDeleteConfirmModal,
    itemToDelete: produtoToDelete,
    onSubmit,
    handleDelete,
    handleConfirmDelete,
    handleCloseDeleteModal,
    handleAdd,
    handleView,
    handleEdit,
    handleCloseModal,
    handlePageChange,
    handleItemsPerPageChange,
    setSearchTerm,
    setStatusFilter,
    applySearch,
    formatarPerCapita,
    formatarPeriodo,
    obterPeriodosComPerCapita,
    produtosDisponiveis,
    carregarProdutosDisponiveis
  } = useProdutosPerCapita();

  const { handleExportXLSX, handleExportPDF } = useExport(ProdutosPerCapitaService);

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
  } = useAuditoria('produtos_per_capita');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando produtos per capita...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Produtos Per Capita</h1>
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
          {canCreate('produtos_per_capita') && (
            <Button onClick={handleAdd} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar Produto</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <ProdutosPerCapitaStats estatisticas={estatisticas} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onClear={() => setSearchTerm('')}
        onSearchSubmit={applySearch}
        placeholder="Buscar por nome do produto..."
      />

      {/* Ações */}
      <ProdutosPerCapitaActions 
        onExportXLSX={handleExportXLSX}
        onExportPDF={handleExportPDF}
        totalItems={totalItems}
        loading={loading}
      />

      {/* Tabela */}
      <ProdutosPerCapitaTable
        produtos={produtos}
        canView={canView}
        canEdit={canEdit}
        canDelete={canDelete}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        formatarPerCapita={formatarPerCapita}
        formatarPeriodo={formatarPeriodo}
        obterPeriodosComPerCapita={obterPeriodosComPerCapita}
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

      {/* Modal de Produto Per Capita */}
      <ProdutoPerCapitaModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={onSubmit}
        produto={editingProduto}
        isViewMode={viewMode}
        loading={loading}
        produtosDisponiveis={produtosDisponiveis}
        onCarregarProdutosDisponiveis={carregarProdutosDisponiveis}
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

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Excluir Produto Per Capita"
        message={`Tem certeza que deseja excluir o produto "${produtoToDelete?.produto_nome}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default ProdutosPerCapita;
