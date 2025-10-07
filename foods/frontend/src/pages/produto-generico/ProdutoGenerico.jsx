/**
 * Página de Produto Genérico
 * Interface principal para gerenciamento de produtos genéricos
 */

import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useProdutoGenerico } from '../../hooks/useProdutoGenerico';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import { useExport } from '../../hooks/common/useExport';
import produtoGenericoService from '../../services/produtoGenerico';
import { Button, ValidationErrorModal, ConfirmModal } from '../../components/ui';
import { CadastroFilterBar } from '../../components/ui';
import { Pagination } from '../../components/ui';
import { ProdutoGenericoModal } from '../../components/produto-generico';
import ProdutosGenericosStats from '../../components/produto-generico/ProdutosGenericosStats';
import ProdutosGenericosActions from '../../components/produto-generico/ProdutosGenericosActions';
import ProdutosGenericosTable from '../../components/produto-generico/ProdutosGenericosTable';
import { AuditModal } from '../../components/shared';

const ProdutoGenerico = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  // Hooks customizados
  const {
    produtosGenericos,
    loading,
    showModal,
    viewMode,
    editingProdutoGenerico,
    showValidationModal,
    validationErrors,
    showDeleteConfirmModal,
    produtoGenericoToDelete,
    grupos,
    subgrupos,
    classes,
    produtosOrigem,
    unidadesMedida,
    searchTerm,
    statusFilter,
    grupoFilter,
    subgrupoFilter,
    classeFilter,
    produtoOrigemFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    onSubmit,
    handleDeleteProdutoGenerico,
    handleConfirmDelete,
    handleCloseDeleteModal,
    handleAddProdutoGenerico,
    handleViewProdutoGenerico,
    handleEditProdutoGenerico,
    handleCloseModal,
    handleCloseValidationModal,
    handlePageChange,
    handleClearFilters,
    setSearchTerm,
    setStatusFilter,
    setGrupoFilter,
    setSubgrupoFilter,
    setClasseFilter,
    setProdutoOrigemFilter,
    setItemsPerPage,
    formatDate,
    getStatusLabel,
    getStatusColor,
    getGrupoName,
    getSubgrupoName,
    getClasseName,
    getProdutoOrigemName,
    getUnidadeMedidaName
  } = useProdutoGenerico();

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
  } = useAuditoria('produto_generico');

  const { handleExportXLSX, handleExportPDF } = useExport(produtoGenericoService);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Carregando produtos genéricos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Produtos Genéricos</h1>
        
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
          {canCreate('produto_generico') && (
            <Button onClick={handleAddProdutoGenerico} variant="primary" size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar Produto Genérico</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <ProdutosGenericosStats estatisticas={estatisticas} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onKeyPress={handleKeyPress}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onClear={handleClearFilters}
        placeholder="Buscar por nome..."
        additionalFilters={[
          {
            label: 'Grupo',
            value: grupoFilter,
            onChange: setGrupoFilter,
            options: [
              { value: '', label: 'Todos os Grupos' },
              ...grupos.map(g => ({ value: g.id.toString(), label: g.nome }))
            ]
          },
          {
            label: 'Subgrupo',
            value: subgrupoFilter,
            onChange: setSubgrupoFilter,
            options: [
              { value: '', label: 'Todos os Subgrupos' },
              ...subgrupos
                .filter(sg => !grupoFilter || sg.grupo_id === parseInt(grupoFilter))
                .map(sg => ({ value: sg.id.toString(), label: sg.nome }))
            ]
          },
          {
            label: 'Classe',
            value: classeFilter,
            onChange: setClasseFilter,
            options: [
              { value: '', label: 'Todas as Classes' },
              ...classes
                .filter(c => !subgrupoFilter || c.subgrupo_id === parseInt(subgrupoFilter))
                .map(c => ({ value: c.id.toString(), label: c.nome }))
            ]
          },
          {
            label: 'Produto Origem',
            value: produtoOrigemFilter,
            onChange: setProdutoOrigemFilter,
            options: [
              { value: '', label: 'Todos os Produtos Origem' },
              ...produtosOrigem.map(po => ({ value: po.id.toString(), label: po.nome }))
            ]
          }
        ]}
      />

      {/* Ações */}
      <ProdutosGenericosActions
        onExportXLSX={handleExportXLSX}
        onExportPDF={handleExportPDF}
        totalItems={totalItems}
      />

      {/* Tabela */}
      <ProdutosGenericosTable
        produtosGenericos={produtosGenericos}
        onView={handleViewProdutoGenerico}
        onEdit={handleEditProdutoGenerico}
        onDelete={handleDeleteProdutoGenerico}
        canView={canView('produto_generico')}
        canEdit={canEdit('produto_generico')}
        canDelete={canDelete('produto_generico')}
        getStatusLabel={getStatusLabel}
        getStatusColor={getStatusColor}
        formatDate={formatDate}
        getGrupoName={getGrupoName}
        getSubgrupoName={getSubgrupoName}
        getClasseName={getClasseName}
        getProdutoOrigemName={getProdutoOrigemName}
        getUnidadeMedidaName={getUnidadeMedidaName}
      />

      {/* Paginação */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        totalItems={totalItems}
      />

      {/* Modal */}
      <ProdutoGenericoModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={onSubmit}
        produtoGenerico={editingProdutoGenerico}
        viewMode={viewMode}
        grupos={grupos}
        subgrupos={subgrupos}
        classes={classes}
        produtosOrigem={produtosOrigem}
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
        title="Excluir Produto Genérico"
        message={`Tem certeza que deseja excluir o produto genérico "${produtoGenericoToDelete?.nome}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default ProdutoGenerico;
