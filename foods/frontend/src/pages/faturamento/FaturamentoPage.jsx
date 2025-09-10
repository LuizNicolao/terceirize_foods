import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useFaturamento } from '../../hooks/useFaturamento';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import { useExport } from '../../hooks/common/useExport';
import FaturamentoService from '../../services/faturamento';
import { Button, ValidationErrorModal, ConfirmModal } from '../../components/ui';
import { CadastroFilterBar } from '../../components/ui';
import { Pagination } from '../../components/ui';
import { FaturamentoTable, FaturamentoModal, FaturamentoStats, FaturamentoActions } from '../../components/faturamento';
import { AuditModal } from '../../components/shared';

const FaturamentoPage = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  // Hook de faturamento
  const {
    faturamentos,
    loading,
    saving,
    showModal,
    editingFaturamento,
    viewMode,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    searchTerm,
    filtros,
    showDeleteConfirmModal,
    setShowDeleteConfirmModal,
    faturamentoToDelete,
    validationErrors,
    showValidationModal,
    fieldErrors,
    estatisticas,
    loadFaturamentos,
    onSubmit,
    handleDeleteFaturamento,
    confirmDeleteFaturamento,
    handleAddFaturamento,
    handleViewFaturamento,
    handleEditFaturamento,
    handleCloseModal,
    handlePageChange,
    handleItemsPerPageChange,
    setSearchTerm,
    handleFiltroChange,
    clearFiltros,
    formatDate,
    getMonthName,
    getFieldError,
    clearFieldError,
    handleCloseValidationModal,
    handleExportXLSX,
    handleExportPDF
  } = useFaturamento();

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
  } = useAuditoria('faturamento');

  const { handleExportXLSX: exportXLSX, handleExportPDF: exportPDF } = useExport(FaturamentoService);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Carregando faturamentos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Faturamento</h1>
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
          {canCreate('faturamento') && (
            <Button onClick={handleAddFaturamento} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <FaturamentoStats estatisticas={estatisticas} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClear={() => setSearchTerm('')}
        placeholder="Buscar por unidade escolar..."
      />
      
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mês
            </label>
            <select
              value={filtros.mes}
              onChange={(e) => handleFiltroChange('mes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Todos os meses</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {getMonthName(i + 1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ano
            </label>
            <select
              value={filtros.ano}
              onChange={(e) => handleFiltroChange('ano', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {Array.from({ length: 11 }, (_, i) => {
                const year = 2020 + i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={clearFiltros}
              className="w-full"
            >
              Limpar Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Ações */}
      <FaturamentoActions 
        onExportXLSX={exportXLSX}
        onExportPDF={exportPDF}
        totalItems={totalItems}
        selectedItems={[]}
      />

      {/* Tabela */}
      <FaturamentoTable
        faturamentos={faturamentos}
        canView={canView('faturamento')}
        canEdit={canEdit('faturamento')}
        canDelete={canDelete('faturamento')}
        onView={handleViewFaturamento}
        onEdit={handleEditFaturamento}
        onDelete={handleDeleteFaturamento}
        formatDate={formatDate}
        getMonthName={getMonthName}
      />

      {/* Paginação */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {/* Modal de Faturamento */}
      <FaturamentoModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={onSubmit}
        faturamento={editingFaturamento}
        isViewMode={viewMode}
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

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        onConfirm={confirmDeleteFaturamento}
        title="Excluir Faturamento"
        message={`Tem certeza que deseja excluir o faturamento de ${faturamentoToDelete?.nome_escola} - ${faturamentoToDelete ? getMonthName(faturamentoToDelete.mes) : ''}/${faturamentoToDelete?.ano}?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default FaturamentoPage;
