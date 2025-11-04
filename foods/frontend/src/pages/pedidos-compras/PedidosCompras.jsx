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
    loadSolicitacoesDisponiveis
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pedidos de Compras</h1>
          <p className="text-sm text-gray-600 mt-1">Gerencie os pedidos de compras do sistema</p>
        </div>
        <div className="flex items-center gap-3">
          {canView && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenAuditModal}
              className="text-xs"
            >
              <FaQuestionCircle className="mr-2" />
              Auditoria
            </Button>
          )}
          {canCreate && (
            <Button
              onClick={handleAddPedidoCompras}
              size="sm"
            >
              <FaPlus className="mr-2" />
              Novo Pedido
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
      <div className="bg-white rounded-lg shadow-sm border">
        <PedidosComprasTable
          pedidosCompras={pedidosCompras}
          onView={handleViewPedidoCompras}
          onEdit={handleEditPedidoCompras}
          onDelete={handleDeletePedidoCompras}
          canView={canView}
          canEdit={canEdit}
          canDelete={canDelete}
          getStatusBadge={getStatusBadge}
        />

        {/* Paginação - sempre mostrar para permitir mudança de itens por página */}
        <div className="p-4 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      </div>

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

