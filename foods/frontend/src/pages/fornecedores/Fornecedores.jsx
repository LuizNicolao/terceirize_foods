import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useFornecedores } from '../../hooks';
import { useAuditoria } from '../../hooks';
import { Button } from '../../components/ui';
import { 
  FornecedorModal, 
  FornecedoresTable, 
  FornecedoresStats, 
  FornecedoresActions 
} from '../../components/fornecedores';
import { AuditModal } from '../../components/shared';
import CadastroFilterBar from '../../components/CadastroFilterBar';
import Pagination from '../../components/Pagination';

const Fornecedores = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  const {
    // Estados
    fornecedores,
    loading,
    showModal,
    viewMode,
    editingFornecedor,
    showAuditModal,
    auditLogs,
    auditLoading,
    auditFilters,
    searching,
    estatisticas,
    searchTerm,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    errors,

    // Funções
    register,
    handleSubmit,
    reset,
    loadFornecedores,
    reloadData,
    handlePageChange,
    handleItemsPerPageChange,
    handleSearch,
    handleOpenModal,
    handleCloseModal,
    onSubmit,
    handleDeleteFornecedor,
    handleViewAudit,
    handleAuditFilterChange,
    handleCloseAuditModal,
    handleExport
  } = useFornecedores();

  const {
    handleApplyAuditFilters,
    handleExportAuditXLSX,
    handleExportAuditPDF
  } = useAuditoria();

  const handleAddNew = () => {
    handleOpenModal(null, false);
  };

  const handleView = (fornecedor) => {
    handleOpenModal(fornecedor, true);
  };

  const handleEdit = (fornecedor) => {
    handleOpenModal(fornecedor, false);
  };

  const handleOpenAuditModal = () => {
    handleViewAudit(null);
  };

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
              <span className="hidden sm:inline">Adicionar</span>
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
        onClear={() => handleSearch('')}
        placeholder="Buscar por razão social, CNPJ ou município..."
      />
      
      {/* Indicador de busca */}
      {searching && (
        <div className="flex items-center justify-center py-2 text-sm text-gray-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          Buscando...
        </div>
      )}

      {/* Ações */}
      <FornecedoresActions 
        onExport={handleExport}
        canCreate={canCreate('fornecedores')}
        onAddNew={handleAddNew}
      />

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
        onFilterChange={handleAuditFilterChange}
        onApplyFilters={handleApplyAuditFilters}
        onExportXLSX={handleExportAuditXLSX}
        onExportPDF={handleExportAuditPDF}
        entityName="fornecedores"
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

export default Fornecedores;
