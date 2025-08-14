import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useProdutoOrigem } from '../../hooks/useProdutoOrigem';
import { useAuditoria } from '../../hooks/useAuditoria';
import { useExport } from '../../hooks/useExport';
import ProdutoOrigemService from '../../services/produtoOrigem';
import { Button } from '../../components/ui';
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
    grupos,
    subgrupos,
    classes,
    unidadesMedida,
    produtosGenericosPadrao,
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
    getUnidadeMedidaName,
    getProdutoGenericoPadraoName
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
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Produtos Origem</h1>
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
          {canCreate('produto_origem') && (
            <Button onClick={handleAddProdutoOrigem} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar</span>
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
        onStatusChange={setStatusFilter}
        onClearFilters={handleClearFilters}
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
        getProdutoGenericoPadraoName={getProdutoGenericoPadraoName}
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
        produtosGenericosPadrao={produtosGenericosPadrao}
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
        onFiltersChange={setAuditFilters}
      />
    </div>
  );
};

export default ProdutoOrigem;
