import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useSolicitacoesCompras } from '../../hooks/useSolicitacoesCompras';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import { useExport } from '../../hooks/common/useExport';
import SolicitacoesComprasService from '../../services/solicitacoesCompras';
import { Button, ValidationErrorModal, ConfirmModal } from '../../components/ui';
import { CadastroFilterBar } from '../../components/ui';
import { Pagination } from '../../components/ui';
import { SolicitacoesComprasModal } from '../../components/solicitacoes-compras';
import SolicitacoesComprasStats from '../../components/solicitacoes-compras/SolicitacoesComprasStats';
import SolicitacoesComprasTable from '../../components/solicitacoes-compras/SolicitacoesComprasTable';
import { AuditModal, ExportButtons } from '../../components/shared';

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

  // Hook de exportação
  const { handleExportXLSX: exportXLSX, handleExportPDF: exportPDF } = useExport(SolicitacoesComprasService);

  // Funções wrapper para exportação com filtros
  const handleExportXLSX = React.useCallback(() => {
    const params = {
      search: searchTerm || undefined,
      status: statusFilter && statusFilter !== 'todos' ? statusFilter : undefined,
      filial_id: filialFilter && filialFilter !== 'todos' ? filialFilter : undefined,
      data_inicio: dataInicioFilter || undefined,
      data_fim: dataFimFilter || undefined
    };
    return exportXLSX(params);
  }, [exportXLSX, searchTerm, statusFilter, filialFilter, dataInicioFilter, dataFimFilter]);

  const handleExportPDF = React.useCallback(() => {
    const params = {
      search: searchTerm || undefined,
      status: statusFilter && statusFilter !== 'todos' ? statusFilter : undefined,
      filial_id: filialFilter && filialFilter !== 'todos' ? filialFilter : undefined,
      data_inicio: dataInicioFilter || undefined,
      data_fim: dataFimFilter || undefined
    };
    return exportPDF(params);
  }, [exportPDF, searchTerm, statusFilter, filialFilter, dataInicioFilter, dataFimFilter]);

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
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Solicitações de Compras</h1>
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
          {canCreate('solicitacoes_compras') && (
            <Button onClick={handleAddSolicitacao} size="sm">
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
        additionalFilters={[
          {
            label: 'Status',
            value: statusFilter || '',
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
            value: filialFilter || '',
            onChange: setFilialFilter,
            options: [
              { value: '', label: 'Todas as filiais' },
              ...filiais.map(filial => ({
                value: filial.id.toString(),
                label: `${filial.filial || filial.nome || 'Filial'} ${filial.codigo_filial ? `(${filial.codigo_filial})` : ''}`
              }))
            ]
          },
          {
            label: 'Data Início',
            value: dataInicioFilter || '',
            onChange: setDataInicioFilter,
            type: 'date'
          },
          {
            label: 'Data Fim',
            value: dataFimFilter || '',
            onChange: setDataFimFilter,
            type: 'date'
          }
        ]}
        placeholder="Buscar por número, descrição, solicitante ou unidade..."
      />

      {/* Ações de Exportação */}
      <div className="mb-4">
        <ExportButtons
          onExportXLSX={handleExportXLSX}
          onExportPDF={handleExportPDF}
          disabled={!canView('solicitacoes_compras')}
        />
      </div>

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

      {/* Paginação - sempre mostrar para permitir mudança de itens por página */}
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
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir a solicitação "${solicitacaoToDelete?.numero_solicitacao}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default SolicitacoesCompras;

