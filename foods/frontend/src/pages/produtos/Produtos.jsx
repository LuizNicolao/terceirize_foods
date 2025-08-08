import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useProdutos } from '../../hooks/useProdutos';
import { useAuditoria } from '../../hooks/useAuditoria';
import { useExport } from '../../hooks/useExport';
import ProdutosService from '../../services/produtos';
import { Button } from '../../components/ui';
import CadastroFilterBar from '../../components/CadastroFilterBar';
import Pagination from '../../components/Pagination';
import { ProdutoModal } from '../../components/produtos';
import ProdutosStats from '../../components/produtos/ProdutosStats';
import ProdutosActions from '../../components/produtos/ProdutosActions';
import ProdutosTable from '../../components/produtos/ProdutosTable';
import AuditModal from '../../components/shared/AuditModal';
  
const Produtos = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  // Hooks customizados
  const {
    produtos,
    loading,
    showModal,
    viewMode,
    editingProduto,
    grupos,
    subgrupos,
    classes,
    unidades,
    marcas,
    fornecedores,
    searchTerm,
    statusFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    handleSubmitProduto,
    handleDeleteProduto,
    handleAddProduto,
    handleViewProduto,
    handleEditProduto,
    handleCloseModal,
    handlePageChange,
    handleClearFilters,
    setSearchTerm,
    setStatusFilter,
    setItemsPerPage,
    getGrupoName,
    getUnidadeName
  } = useProdutos();

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
  } = useAuditoria('produtos');

  const { handleExportXLSX, handleExportPDF, handlePrintPDF } = useExport(ProdutosService);

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Carregando produtos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Produtos</h1>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button onClick={handleOpenAuditModal} variant="ghost" size="sm">
            <FaQuestionCircle className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Auditoria</span>
            <span className="sm:hidden">Auditoria</span>
          </Button>
          
          {canCreate('produtos') && (
            <Button onClick={handleAddProduto} variant="primary" size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar Produto</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <ProdutosStats estatisticas={estatisticas} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onClear={handleClearFilters}
        placeholder="Buscar por nome, código ou grupo..."
      />

      {/* Ações */}
      <ProdutosActions 
        onExportXLSX={handleExportXLSX}
        onExportPDF={handleExportPDF}
      />

      {/* Tabela */}
      <ProdutosTable
        produtos={produtos}
        canView={canView}
        canEdit={canEdit}
        canDelete={canDelete}
        onView={handleViewProduto}
        onEdit={handleEditProduto}
        onDelete={handleDeleteProduto}
        getGrupoName={getGrupoName}
      />

      {/* Paginação */}
      {totalItems > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={setItemsPerPage}
          />
          </div>
      )}

      {/* Modal de Produto */}
      <ProdutoModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmitProduto}
        produto={editingProduto}
        isViewMode={viewMode}
        grupos={grupos}
        subgrupos={subgrupos}
        classes={classes}
        unidades={unidades}
        marcas={marcas}
        fornecedores={fornecedores}
        onPrint={() => editingProduto && handlePrintPDF(editingProduto.id, editingProduto.nome)}
      />

      {/* Modal de Auditoria */}
      <AuditModal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        title="Relatório de Auditoria - Produtos"
        auditLogs={auditLogs}
        auditLoading={auditLoading}
        auditFilters={auditFilters}
        onApplyFilters={handleApplyAuditFilters}
        onExportXLSX={handleExportAuditXLSX}
        onExportPDF={handleExportAuditPDF}
        onFilterChange={(field, value) => setAuditFilters(prev => ({ ...prev, [field]: value }))}
      />
    </div>
  );
};

export default Produtos; 