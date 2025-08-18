import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useProdutoOrigem } from '../../hooks/useProdutoOrigem';
import { useAuditoria } from '../../hooks/useAuditoria';
import { useExport } from '../../hooks/useExport';
import ProdutoOrigemService from '../../services/produtoOrigem';
import { Button, ValidationErrorModal } from '../../components/ui';
import CadastroFilterBar from '../../components/CadastroFilterBar';
import Pagination from '../../components/Pagination';
import { ProdutoOrigemModal } from '../../components/produto-origem';
import ProdutoOrigemStats from '../../components/produto-origem/ProdutoOrigemStats';
import ProdutoOrigemActions from '../../components/produto-origem/ProdutoOrigemActions';
import ProdutoOrigemTable from '../../components/produto-origem/ProdutoOrigemTable';
import AuditModal from '../../components/shared/AuditModal';

const ProdutoOrigem = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  // Hooks customizados
  const {
    produtosOrigem,
    loading,
    showModal,
    viewMode,
    editingProdutoOrigem,
    showValidationModal,
    validationErrors,
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
    handleSubmitProdutoOrigem,
    handleDeleteProdutoOrigem,
    handleAddProdutoOrigem,
    handleViewProdutoOrigem,
    handleEditProdutoOrigem,
    handleCloseModal,
    handleCloseValidationModal,
    handlePageChange,
    handleClearFilters,
    setSearchTerm,
    setStatusFilter,
    setGrupoFilter,
    setSubgrupoFilter,
    setClasseFilter,
    setItemsPerPage,
    getGrupoName,
    getSubgrupoName,
    getClasseName,
    getUnidadeMedidaName
  } = useProdutoOrigem();

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
  } = useAuditoria('produto_origem');

  const { handleExportXLSX, handleExportPDF } = useExport(ProdutoOrigemService);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Carregando produtos origem...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Produtos Origem</h1>
        
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
          {canCreate('produto_origem') && (
            <Button onClick={handleAddProdutoOrigem} variant="primary" size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar Produto Origem</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <ProdutoOrigemStats estatisticas={estatisticas} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onClear={handleClearFilters}
        additionalFilters={[
          {
            label: 'Grupo',
            value: grupoFilter,
            onChange: setGrupoFilter,
            options: grupos.map(g => ({ value: g.id, label: g.nome }))
          },
          {
            label: 'Subgrupo',
            value: subgrupoFilter,
            onChange: setSubgrupoFilter,
            options: subgrupos
              .filter(sg => !grupoFilter || sg.grupo_id === parseInt(grupoFilter))
              .map(sg => ({ value: sg.id, label: sg.nome }))
          },
          {
            label: 'Classe',
            value: classeFilter,
            onChange: setClasseFilter,
            options: classes
              .filter(c => !subgrupoFilter || c.subgrupo_id === parseInt(subgrupoFilter))
              .map(c => ({ value: c.id, label: c.nome }))
          }
        ]}
      />

      {/* Ações */}
      <ProdutoOrigemActions
        onExportXLSX={handleExportXLSX}
        onExportPDF={handleExportPDF}
        totalItems={totalItems}
      />

      {/* Tabela */}
      <ProdutoOrigemTable
        produtosOrigem={produtosOrigem}
        onView={handleViewProdutoOrigem}
        onEdit={handleEditProdutoOrigem}
        onDelete={handleDeleteProdutoOrigem}
        canView={canView('produto_origem')}
        canEdit={canEdit('produto_origem')}
        canDelete={canDelete('produto_origem')}
        getGrupoName={getGrupoName}
        getSubgrupoName={getSubgrupoName}
        getClasseName={getClasseName}
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
      <ProdutoOrigemModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmitProdutoOrigem}
        produtoOrigem={editingProdutoOrigem}
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
    </div>
  );
};

export default ProdutoOrigem;
