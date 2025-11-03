import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useSolicitacoesCompras } from '../../hooks/useSolicitacoesCompras';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import { Button, ValidationErrorModal, ConfirmModal } from '../../components/ui';
import { CadastroFilterBar } from '../../components/ui';
import { Pagination } from '../../components/ui';
import { SolicitacoesComprasModal } from '../../components/solicitacoes-compras';
import SolicitacoesComprasStats from '../../components/solicitacoes-compras/SolicitacoesComprasStats';
import SolicitacoesComprasTable from '../../components/solicitacoes-compras/SolicitacoesComprasTable';
import { AuditModal } from '../../components/shared';

const SolicitacoesCompras = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  // Hooks customizados
  const {
    solicitacoes,
    loading,
    showModal,
    viewMode,
    editingSolicitacao,
    showValidationModal,
    validationErrors,
    showDeleteConfirmModal,
    solicitacaoToDelete,
    filiais,
    produtosGenericos,
    unidadesMedida,
    searchTerm,
    statusFilter,
    filialFilter,
    dataInicioFilter,
    dataFimFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    handleSubmitSolicitacao,
    handleDeleteSolicitacao,
    handleConfirmDelete,
    handleCloseDeleteModal,
    handleAddSolicitacao,
    handleViewSolicitacao,
    handleEditSolicitacao,
    handleCloseModal,
    handleCloseValidationModal,
    handlePageChange,
    handleItemsPerPageChange,
    handleClearFilters,
    setSearchTerm,
    handleKeyPress,
    setStatusFilter,
    setFilialFilter,
    setDataInicioFilter,
    setDataFimFilter,
    getFilialName,
    getStatusLabel
  } = useSolicitacoesCompras();

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
  } = useAuditoria('solicitacoes_compras');

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Carregando solicitações de compras...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Solicitações de Compras</h1>
        
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
          {canCreate('solicitacoes_compras') && (
            <Button onClick={handleAddSolicitacao} variant="primary" size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Nova Solicitação</span>
              <span className="sm:hidden">Nova</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <SolicitacoesComprasStats estatisticas={estatisticas} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onKeyPress={handleKeyPress}
        onClear={handleClearFilters}
        additionalFilters={[
          {
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: '', label: 'Todos os status' },
              { value: 'aberto', label: 'Aberto' },
              { value: 'parcial', label: 'Parcial' },
              { value: 'finalizado', label: 'Finalizado' },
              { value: 'cancelada', label: 'Cancelada' }
            ]
          },
          {
            label: 'Filial',
            value: filialFilter,
            onChange: setFilialFilter,
            options: [
              { value: 'todos', label: 'Todas as filiais' },
              ...filiais.map(filial => ({
                value: filial.id.toString(),
                label: `${filial.filial || filial.nome || 'Filial'} ${filial.codigo_filial ? `(${filial.codigo_filial})` : ''}`
              }))
            ]
          },
          {
            label: 'Data Início',
            value: dataInicioFilter,
            onChange: setDataInicioFilter,
            type: 'date'
          },
          {
            label: 'Data Fim',
            value: dataFimFilter,
            onChange: setDataFimFilter,
            type: 'date'
          }
        ]}
        placeholder="Buscar por número, descrição, solicitante ou unidade..."
      />

      {/* Tabela */}
      <SolicitacoesComprasTable
        solicitacoes={solicitacoes}
        onView={canView('solicitacoes_compras') ? handleViewSolicitacao : null}
        onEdit={canEdit('solicitacoes_compras') ? handleEditSolicitacao : null}
        onDelete={canDelete('solicitacoes_compras') ? handleDeleteSolicitacao : null}
        canView={canView('solicitacoes_compras')}
        canEdit={canEdit('solicitacoes_compras')}
        canDelete={canDelete('solicitacoes_compras')}
        getFilialName={getFilialName}
        getStatusLabel={getStatusLabel}
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
      <SolicitacoesComprasModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmitSolicitacao}
        solicitacao={editingSolicitacao}
        viewMode={viewMode}
        filiais={filiais}
        produtosGenericos={produtosGenericos}
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
        title="Excluir Solicitação de Compras"
        message={`Tem certeza que deseja excluir a solicitação "${solicitacaoToDelete?.numero_solicitacao}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default SolicitacoesCompras;

