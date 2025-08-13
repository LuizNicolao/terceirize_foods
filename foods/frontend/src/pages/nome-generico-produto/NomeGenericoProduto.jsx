import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useNomeGenericoProduto } from '../../hooks/useNomeGenericoProduto';
import { useAuditoria } from '../../hooks/useAuditoria';
import { useExport } from '../../hooks/useExport';
import { useGrupos } from '../../hooks/useGrupos';
import { useSubgrupos } from '../../hooks/useSubgrupos';
import { useClasses } from '../../hooks/useClasses';
import NomeGenericoProdutoService from '../../services/nomeGenericoProduto';
import { Button } from '../../components/ui';
import CadastroFilterBar from '../../components/CadastroFilterBar';
import Pagination from '../../components/Pagination';
import { 
  NomeGenericoModal,
  NomesGenericosStats,
  NomesGenericosActions,
  NomesGenericosTable 
} from '../../components/nome-generico-produto';
import AuditModal from '../../components/shared/AuditModal';

const NomeGenericoProduto = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  // Hooks customizados
  const {
    nomesGenericos,
    loading,
    showModal,
    viewMode,
    editingNomeGenerico,
    searchTerm,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    onSubmit,
    handleDeleteNomeGenerico,
    handleAddNomeGenerico,
    handleViewNomeGenerico,
    handleEditNomeGenerico,
    handleCloseModal,
    handlePageChange,
    setSearchTerm,
    setItemsPerPage,
    formatDate,
    getStatusLabel,
    getStatusColor
  } = useNomeGenericoProduto();

  // Hooks para dropdowns
  const { grupos } = useGrupos();
  const { subgrupos } = useSubgrupos();
  const { classes } = useClasses();

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
  } = useAuditoria('nome-generico-produto');

  const { handleExportXLSX, handleExportPDF } = useExport(NomeGenericoProdutoService);

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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Nomes Genéricos de Produtos</h1>
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
          {canCreate('nome_generico_produto') && (
            <Button onClick={handleAddNomeGenerico} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <NomesGenericosStats estatisticas={estatisticas} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClear={() => setSearchTerm('')}
        placeholder="Buscar por nome, grupo, subgrupo ou classe..."
      />

      {/* Ações */}
      <NomesGenericosActions 
        onExportXLSX={handleExportXLSX}
        onExportPDF={handleExportPDF}
      />

      {/* Tabela */}
      <NomesGenericosTable
        nomesGenericos={nomesGenericos}
        canView={canView}
        canEdit={canEdit}
        canDelete={canDelete}
        onView={handleViewNomeGenerico}
        onEdit={handleEditNomeGenerico}
        onDelete={handleDeleteNomeGenerico}
        getStatusLabel={getStatusLabel}
        getStatusColor={getStatusColor}
        formatDate={formatDate}
      />

      {/* Modal de Nome Genérico */}
      <NomeGenericoModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={onSubmit}
        nomeGenerico={editingNomeGenerico}
        isViewMode={viewMode}
        grupos={grupos}
        subgrupos={subgrupos}
        classes={classes}
      />

      {/* Modal de Auditoria */}
      <AuditModal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        title="Relatório de Auditoria - Nomes Genéricos"
        auditLogs={auditLogs}
        auditLoading={auditLoading}
        auditFilters={auditFilters}
        onApplyFilters={handleApplyAuditFilters}
        onExportXLSX={handleExportAuditXLSX}
        onExportPDF={handleExportAuditPDF}
        onFilterChange={(field, value) => setAuditFilters(prev => ({ ...prev, [field]: value }))}
      />

      {/* Paginação */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />
      )}
    </div>
  );
};

export default NomeGenericoProduto;
