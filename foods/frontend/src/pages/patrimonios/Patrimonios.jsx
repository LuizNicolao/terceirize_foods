import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { usePermissions } from '../../contexts/PermissionsContext';
import { usePatrimonios } from '../../hooks/usePatrimonios';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import { useExport } from '../../hooks/common/useExport';
import PatrimoniosService from '../../services/patrimonios';
import { Button } from '../../components/ui';
import { CadastroFilterBar } from '../../components/ui';
import { Pagination } from '../../components/ui';
import { PatrimoniosStats } from '../../components/patrimonios';
import PatrimoniosTable from '../../components/patrimonios/PatrimoniosTable';
import PatrimoniosForm from '../../components/patrimonios/PatrimoniosForm';
import PatrimoniosMovimentacaoForm from '../../components/patrimonios/PatrimoniosMovimentacaoForm';
import PatrimoniosMovimentacoesModal from '../../components/patrimonios/PatrimoniosMovimentacoesModal';
import { AuditModal, ExportButtons } from '../../components/shared';
import { ConfirmModal } from '../../components/ui';
import ValidationErrorModal from '../../components/ui/ValidationErrorModal';

const Patrimonios = () => {
  const { canCreate, canEdit, canDelete, canView, canMovimentar } = usePermissions();
  
  // Hook customizado de patrimônios
  const {
    patrimonios,
    loading,
    saving,
    selectedPatrimonio,
    showFormModal,
    showMovimentacaoModal,
    showMovimentacoesModal,
    viewMode,
    searchTerm,
    filters,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    formData,
    movimentacaoData,
    produtosEquipamentos,
    produtosLoading,
    movimentacoes,
    movimentacoesLoading,
    filiais,
    filiaisLoading,
    validationErrors,
    showValidationModal,
    handleCreatePatrimonio,
    handleUpdatePatrimonio,
    handleDeletePatrimonio,
    handleMovimentarPatrimonio,
    handleSearchChange,
    handleKeyPress,
    handleFilterChange,
    handleClearFilters,
    handlePageChange,
    handleLimitChange,
    handleFormDataChange,
    handleMovimentacaoDataChange,
    openCreateModal,
    openEditModal,
    openViewModal,
    openMovimentacaoModal,
    openMovimentacoesModal,
    setShowFormModal,
    setShowMovimentacaoModal,
    setShowMovimentacoesModal,
    setSelectedPatrimonio,
    loadPatrimonios,
    loadProdutosEquipamentos,
    closeValidationModal,
    handleCloseModal,
    showDeleteConfirmModal,
    closeDeleteConfirmModal,
    openDeleteConfirmModal,
    patrimonioToDelete
  } = usePatrimonios();

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
  } = useAuditoria('patrimonios');

  // Hook de exportação
  const { handleExportXLSX, handleExportPDF } = useExport(PatrimoniosService);

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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Patrimônios</h1>
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
          {canCreate('patrimonios') && (
            <Button onClick={openCreateModal} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <PatrimoniosStats estatisticas={estatisticas} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onKeyPress={handleKeyPress}
        onClear={handleClearFilters}
        placeholder="Buscar por produto, número do patrimônio..."
      />

      {/* Ações de Exportação */}
      <div className="mb-4">
        <ExportButtons
          onExportXLSX={handleExportXLSX}
          onExportPDF={handleExportPDF}
          disabled={!canView('patrimonios')}
        />
      </div>

      {/* Tabela de Patrimônios */}
      <PatrimoniosTable
        patrimonios={patrimonios}
        loading={loading}
        selectedPatrimonio={selectedPatrimonio}
        onPatrimonioSelect={(patrimonio) => openViewModal(patrimonio)}
        pagination={{
          currentPage,
          totalPages,
          totalItems,
          itemsPerPage,
        }}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        canView={canView('patrimonios')}
        canEdit={canEdit('patrimonios')}
        canDelete={canDelete('patrimonios')}
        canMovimentar={canMovimentar('patrimonios')}
        onEdit={openEditModal}
        onDelete={openDeleteConfirmModal}
        onMovimentar={(patrimonio) => {
          // Verificar permissão antes de abrir o modal
          if (canMovimentar('patrimonios')) {
            openMovimentacaoModal(patrimonio);
          } else {
            toast.error('Você não tem permissão para movimentar patrimônios');
          }
        }}
        onViewMovimentacoes={openMovimentacoesModal}
      />

      {/* Modal de Formulário */}
      <PatrimoniosForm
        isOpen={showFormModal}
        onClose={handleCloseModal}
        formData={formData}
        onFormDataChange={handleFormDataChange}
        produtosEquipamentos={produtosEquipamentos}
        produtosLoading={produtosLoading}
        onLoadProdutos={loadProdutosEquipamentos}
        saving={saving}
        isEdit={!!selectedPatrimonio && !viewMode}
        isViewMode={viewMode}
        onSubmit={selectedPatrimonio ? handleUpdatePatrimonio : handleCreatePatrimonio}
        filiais={filiais}
        filiaisLoading={filiaisLoading}
        movimentacoes={movimentacoes}
        loadingMovimentacoes={movimentacoesLoading}
      />

      {/* Modal de Movimentação */}
      <PatrimoniosMovimentacaoForm
        isOpen={showMovimentacaoModal}
        onClose={() => setShowMovimentacaoModal(false)}
        movimentacaoData={movimentacaoData}
        onMovimentacaoDataChange={handleMovimentacaoDataChange}
        patrimonio={selectedPatrimonio}
        saving={saving}
        onSubmit={handleMovimentarPatrimonio}
      />

      {/* Modal de Movimentações */}
      <PatrimoniosMovimentacoesModal
        isOpen={showMovimentacoesModal}
        onClose={() => setShowMovimentacoesModal(false)}
        patrimonio={selectedPatrimonio}
        movimentacoes={movimentacoes}
        loading={movimentacoesLoading}
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
        onClose={closeValidationModal}
        errors={validationErrors}
        errorCategories={validationErrors}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={closeDeleteConfirmModal}
        onConfirm={() => patrimonioToDelete && handleDeletePatrimonio(patrimonioToDelete.id)}
        title="Excluir Patrimônio"
        message={`Tem certeza que deseja excluir o patrimônio "${patrimonioToDelete?.numero_patrimonio}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
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

export default Patrimonios;
