import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useProdutoComercial } from '../../hooks/useProdutoComercial';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import { useExport } from '../../hooks/common/useExport';
import ProdutoComercialService from '../../services/produtoComercial';
import { Button, ValidationErrorModal, ConfirmModal } from '../../components/ui';
import { CadastroFilterBar } from '../../components/ui';
import { Pagination } from '../../components/ui';
import { ProdutoComercialModal } from '../../components/produto-comercial';
import ProdutoComercialStats from '../../components/produto-comercial/ProdutoComercialStats';
import ProdutoComercialTable from '../../components/produto-comercial/ProdutoComercialTable';
import { AuditModal, ExportButtons } from '../../components/shared';

const ProdutoComercial = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  // Hooks customizados
  const {
    produtosComerciais,
    loading,
    showModal,
    viewMode,
    editingProdutoComercial,
    showValidationModal,
    validationErrors,
    showDeleteConfirmModal,
    produtoComercialToDelete,
    grupos,
    subgrupos,
    classes,
    unidadesMedida,
    searchTerm,
    statusFilter,
    grupoFilter,
    subgrupoFilter,
    classeFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    handleSubmitProdutoComercial,
    handleDeleteProdutoComercial,
    handleConfirmDelete,
    handleCloseDeleteModal,
    handleAddProdutoComercial,
    handleViewProdutoComercial,
    handleEditProdutoComercial,
    handleCloseModal,
    handleCloseValidationModal,
    handlePageChange,
    handleItemsPerPageChange,
    handleClearFilters,
    setSearchTerm,
    handleKeyPress,
    setStatusFilter,
    setGrupoFilter,
    setSubgrupoFilter,
    setClasseFilter,
    setItemsPerPage,
    getGrupoName,
    getSubgrupoName,
    getClasseName,
    getUnidadeMedidaName,
    getUnidadeMedidaSigla,
    sortField,
    sortDirection,
    handleSort
  } = useProdutoComercial();

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
  } = useAuditoria('produto_comercial');

  const { handleExportXLSX, handleExportPDF } = useExport(ProdutoComercialService);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Carregando produtos comerciais...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Produtos Comerciais</h1>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            onClick={handleOpenAuditModal}
            variant="ghost"
            size="sm"
          >
            <FaQuestionCircle className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Auditoria</span>
            <span className="sm:hidden">Auditoria</span>
          </Button>
          {canCreate('produto_comercial') && (
            <Button onClick={handleAddProdutoComercial} variant="primary" size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar Produto Comercial</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <ProdutoComercialStats estatisticas={estatisticas} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onKeyPress={handleKeyPress}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onClear={handleClearFilters}
        additionalFilters={[
          {
            label: 'Grupo',
            value: grupoFilter,
            onChange: setGrupoFilter,
            options: [
              { value: '', label: 'Todos os grupos' },
              ...grupos.map(g => ({ value: g.id, label: g.nome }))
            ]
          },
          {
            label: 'Subgrupo',
            value: subgrupoFilter,
            onChange: setSubgrupoFilter,
            options: [
              { value: '', label: 'Todos os subgrupos' },
              ...subgrupos
                .filter(sg => !grupoFilter || sg.grupo_id === parseInt(grupoFilter))
                .map(sg => ({ value: sg.id, label: sg.nome }))
            ]
          },
          {
            label: 'Classe',
            value: classeFilter,
            onChange: setClasseFilter,
            options: [
              { value: '', label: 'Todas as classes' },
              ...classes
                .filter(c => !subgrupoFilter || c.subgrupo_id === parseInt(subgrupoFilter))
                .map(c => ({ value: c.id, label: c.nome }))
            ]
          }
        ]}
        placeholder="Buscar por código ou nome comercial..."
      />

      {/* Ações de Exportação */}
      <div className="mb-4">
        <ExportButtons
          onExportXLSX={handleExportXLSX}
          onExportPDF={handleExportPDF}
          disabled={!canView('produto_comercial')}
        />
      </div>

      {/* Tabela */}
      <ProdutoComercialTable
        produtosComerciais={produtosComerciais}
        onView={handleViewProdutoComercial}
        onEdit={handleEditProdutoComercial}
        onDelete={handleDeleteProdutoComercial}
        canView={canView('produto_comercial')}
        canEdit={canEdit('produto_comercial')}
        canDelete={canDelete('produto_comercial')}
        getGrupoName={getGrupoName}
        getSubgrupoName={getSubgrupoName}
        getClasseName={getClasseName}
        getUnidadeMedidaName={getUnidadeMedidaName}
        getUnidadeMedidaSigla={getUnidadeMedidaSigla}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
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

      {/* Modal */}
      <ProdutoComercialModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmitProdutoComercial}
        produtoComercial={editingProdutoComercial}
        viewMode={viewMode}
        grupos={grupos}
        subgrupos={subgrupos}
        classes={classes}
        unidadesMedida={unidadesMedida}
        loading={loading}
      />

      {/* Modal de Auditoria */}
      <AuditModal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        logs={auditLogs}
        loading={auditLoading}
        filters={auditFilters}
        auditPagination={auditPagination}
        onApplyFilters={handleApplyAuditFilters}
        onPageChange={handleAuditPageChange}
        onItemsPerPageChange={handleAuditItemsPerPageChange}
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
        title="Excluir Produto Comercial"
        message={`Tem certeza que deseja excluir o produto comercial "${produtoComercialToDelete?.nome_comercial}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default ProdutoComercial;

