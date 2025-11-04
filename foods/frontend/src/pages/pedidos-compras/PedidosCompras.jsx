import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { usePedidosCompras } from '../../hooks/usePedidosCompras';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import { useExport } from '../../hooks/common/useExport';
import PedidosComprasService from '../../services/pedidosComprasService';
import { Button, ValidationErrorModal, ConfirmModal } from '../../components/ui';
import { CadastroFilterBar } from '../../components/ui';
import { Pagination } from '../../components/ui';
import PedidosComprasModal from '../../components/pedidos-compras/PedidosComprasModal';
import PedidosComprasStats from '../../components/pedidos-compras/PedidosComprasStats';
import PedidosComprasTable from '../../components/pedidos-compras/PedidosComprasTable';
import { AuditModal, ExportButtons } from '../../components/shared';

const PedidosCompras = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  // Hooks customizados
  const {
    pedidosCompras,
    loading,
    showModal,
    viewMode,
    editingPedidoCompras,
    showValidationModal,
    validationErrors,
    showDeleteConfirmModal,
    pedidoComprasToDelete,
    searchTerm,
    statusFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    solicitacoesDisponiveis,
    handleSubmitPedidoCompras,
    handleDeletePedidoCompras,
    handleConfirmDelete,
    handleCloseDeleteModal,
    handleAddPedidoCompras,
    handleViewPedidoCompras,
    handleEditPedidoCompras,
    handleCloseModal,
    handleCloseValidationModal,
    handlePageChange,
    handleItemsPerPageChange,
    handleClearFilters,
    setSearchTerm,
    handleKeyPress,
    setStatusFilter,
    getStatusBadge,
    loadSolicitacoesDisponiveis,
    selectedIds,
    handleSelectAll,
    handleSelectItem,
    handleAprovarLote,
    handleReabrirLote,
    loadingBatch
  } = usePedidosCompras();

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
  } = useAuditoria('pedidos_compras');

  // Hook de exportação
  const { handleExportXLSX: exportXLSX, handleExportPDF: exportPDF } = useExport(PedidosComprasService);

  // Funções wrapper para exportação com filtros
  const handleExportXLSX = React.useCallback(() => {
    const params = {
      search: searchTerm || undefined,
      status: statusFilter || undefined
    };
    return exportXLSX(params);
  }, [exportXLSX, searchTerm, statusFilter]);

  const handleExportPDF = React.useCallback(() => {
    const params = {
      search: searchTerm || undefined,
      status: statusFilter || undefined
    };
    return exportPDF(params);
  }, [exportPDF, searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Carregando pedidos de compras...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Pedidos de Compras</h1>
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
          {canCreate('pedidos_compras') && (
            <Button
              onClick={handleAddPedidoCompras}
              size="sm"
            >
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Novo Pedido</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <PedidosComprasStats estatisticas={estatisticas} />

      {/* Filtros */}
      <div className="mb-6">
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
                { value: 'em_digitacao', label: 'Em Digitação' },
                { value: 'aprovado', label: 'Aprovado' },
                { value: 'enviado', label: 'Enviado' },
                { value: 'confirmado', label: 'Confirmado' },
                { value: 'em_transito', label: 'Em Trânsito' },
                { value: 'entregue', label: 'Entregue' },
                { value: 'cancelado', label: 'Cancelado' }
              ]
            }
          ]}
          placeholder="Buscar por número, fornecedor, filial ou solicitação..."
        />
      </div>

      {/* Export Buttons */}
      <div className="mb-6 flex justify-end">
        <ExportButtons
          onExportXLSX={handleExportXLSX}
          onExportPDF={handleExportPDF}
        />
      </div>

      {/* Tabela */}
      <PedidosComprasTable
        pedidosCompras={pedidosCompras}
        onView={handleViewPedidoCompras}
        onEdit={handleEditPedidoCompras}
        onDelete={handleDeletePedidoCompras}
        canView={canView('pedidos_compras')}
        canEdit={canEdit('pedidos_compras')}
        canDelete={canDelete('pedidos_compras')}
        getStatusBadge={getStatusBadge}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelectItem={handleSelectItem}
        onAprovarLote={handleAprovarLote}
        onReabrirLote={handleReabrirLote}
        loadingBatch={loadingBatch}
        canEditByStatus={(item) => {
          // Apenas pedidos em digitação ou cancelados podem ser editados
          return ['em_digitacao', 'cancelado'].includes(item.status);
        }}
        canDeleteByStatus={(item) => {
          // Apenas pedidos em digitação ou cancelados podem ser excluídos
          return ['em_digitacao', 'cancelado'].includes(item.status);
        }}
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
      <PedidosComprasModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmitPedidoCompras}
        pedidoCompras={editingPedidoCompras}
        viewMode={viewMode}
        loading={loading}
        solicitacoesDisponiveis={solicitacoesDisponiveis}
      />

      {/* Modais de Validação e Confirmação */}
      <ValidationErrorModal
        isOpen={showValidationModal}
        onClose={handleCloseValidationModal}
        errors={validationErrors}
      />

      <ConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Excluir Pedido de Compras"
        message={`Tem certeza que deseja excluir o pedido "${pedidoComprasToDelete?.numero_pedido || ''}"? Esta ação não pode ser desfeita.`}
        variant="danger"
      />

      {/* Modal de Auditoria */}
      <AuditModal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        logs={auditLogs}
        loading={auditLoading}
        filters={auditFilters}
        pagination={auditPagination}
        onApplyFilters={handleApplyAuditFilters}
        onPageChange={handleAuditPageChange}
        onItemsPerPageChange={handleAuditItemsPerPageChange}
        onExportXLSX={handleExportAuditXLSX}
        onExportPDF={handleExportAuditPDF}
        onFiltersChange={setAuditFilters}
      />
    </div>
  );
};

export default PedidosCompras;

