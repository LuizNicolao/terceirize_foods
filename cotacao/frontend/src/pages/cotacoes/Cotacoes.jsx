import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { useCotacoes } from '../../hooks/useCotacoes';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useAuth } from '../../contexts/AuthContext';
import CotacoesTable from './components/CotacoesTable';
import CotacoesStats from './components/CotacoesStats';
import CotacoesActions from './components/CotacoesActions';
import { AuditModal } from '../../components/shared';
import { Button, CadastroFilterBar, LoadingSpinner, ConfirmModal } from '../../components/ui';
import ModalProdutosZerados from '../../components/modals/ModalProdutosZerados';

const Cotacoes = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  const { user } = useAuth();
  
  const {
    cotacoes,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    compradorFilter,
    setCompradorFilter,
    compradores,
    handleView,
    handleEdit,
    handleCreate,
    handleDelete,
    handleDeleteConfirm,
    handleDeleteCancel,
    showDeleteModal,
    handleSendToSupervisor,
    refetch,
    handleExportXLSX,
    handleExportPDF,
    showModalProdutosZerados,
    setShowModalProdutosZerados,
    produtosZerados,
    // Auditoria
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
  } = useCotacoes();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-red-600 text-lg mb-4">Erro ao carregar cotações</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={refetch}
            className="bg-gray-600 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Cotações</h1>
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
          {canCreate('cotacoes') && (
            <Button onClick={handleCreate} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Nova Cotação</span>
              <span className="sm:hidden">Nova</span>
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <CotacoesStats cotacoes={cotacoes} />

      {/* Actions */}
      <CotacoesActions
        onExportXLSX={handleExportXLSX}
        onExportPDF={handleExportPDF}
      />

      {/* Filters */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Buscar cotações..."
        additionalFilters={[
          {
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'todos', label: 'Todos os status' },
              { value: 'pendente', label: 'Pendente' },
              { value: 'em_analise', label: 'Em Análise' },
              { value: 'aguardando_aprovacao', label: 'Aguardando Aprovação' },
              { value: 'aprovada', label: 'Aprovada' },
              { value: 'rejeitada', label: 'Rejeitada' },
              { value: 'renegociacao', label: 'Em Renegociação' },
              { value: 'liberado_gerencia', label: 'Liberado Gerência' }
            ]
          },
          // Filtro por comprador (apenas para administradores)
          ...(user?.role === 'administrador' ? [{
            value: compradorFilter,
            onChange: setCompradorFilter,
            options: [
              { value: 'todos', label: 'Todos os compradores' },
              ...compradores.map(comprador => ({
                value: comprador.nome,
                label: comprador.nome
              }))
            ]
          }] : [])
        ]}
      />

      {/* Table */}
      <CotacoesTable
        cotacoes={cotacoes}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        compradorFilter={compradorFilter}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSendToSupervisor={handleSendToSupervisor}
        canView={canView('cotacoes')}
        canEdit={canEdit('cotacoes')}
        canDelete={canDelete('cotacoes')}
      />

      {/* Audit Modal */}
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Excluir Cotação"
        message="Tem certeza que deseja excluir esta cotação? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Modal de Produtos Zerados */}
      <ModalProdutosZerados
        isOpen={showModalProdutosZerados}
        onClose={() => setShowModalProdutosZerados(false)}
        produtosZerados={produtosZerados}
      />
    </div>
  );
};

export default Cotacoes;
