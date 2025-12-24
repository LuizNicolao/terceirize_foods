import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useChamados } from '../../hooks/useChamados';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import { useExport } from '../../hooks/common/useExport';
import ChamadosService from '../../services/chamados';
import { Button } from '../../components/ui';
import { CadastroFilterBar } from '../../components/ui';
import { Pagination } from '../../components/ui';
import { ChamadoModal } from '../../components/chamados';
import ChamadosStats from '../../components/chamados/ChamadosStats';
import ChamadosTable from '../../components/chamados/ChamadosTable';
import ChamadosFiltersAdvanced from '../../components/chamados/filters/ChamadosFiltersAdvanced';
import ChamadosViews from '../../components/chamados/ChamadosViews';
import { useAuth } from '../../contexts/AuthContext';
import { AuditModal, ExportButtons } from '../../components/shared';
import ValidationErrorModal from '../../components/ui/ValidationErrorModal';
import ConfirmModal from '../../components/ui/ConfirmModal';

const Chamados = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  const { user } = useAuth();
  
  // Hooks customizados
  const {
    chamados,
    loading,
    showModal,
    viewMode,
    editingChamado,
    searchTerm,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    validationErrors,
    showValidationModal,
    handleCloseValidationModal,
    showDeleteConfirmModal,
    chamadoToDelete,
    currentView,
    sistemaFilter,
    tipoFilter,
    statusFilter,
    prioridadeFilter,
    responsavelFilter,
    criadorFilter,
    dataInicioFilter,
    dataFimFilter,
    onSubmit,
    handleDeleteChamado,
    handleConfirmDelete,
    handleCloseDeleteModal,
    handleAddChamado,
    handleViewChamado,
    handleEditChamado,
    handleCloseModal,
    handlePageChange,
    handleItemsPerPageChange,
    setSearchTerm,
    setCurrentView,
    setSistemaFilter,
    setTipoFilter,
    setStatusFilter,
    setPrioridadeFilter,
    setResponsavelFilter,
    setCriadorFilter,
    setDataInicioFilter,
    setDataFimFilter,
    clearFilters,
    handleKeyPress,
    setItemsPerPage,
    formatDate,
    getStatusLabel,
    getTipoLabel,
    getPrioridadeLabel,
    getPrioridadeColor,
    getStatusColor,
    sortField,
    sortDirection,
    handleSort,
    isSortingLocally,
    loadChamadosData
  } = useChamados();

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
  } = useAuditoria('chamados');

  const { handleExportXLSX, handleExportPDF } = useExport(ChamadosService);

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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Chamados</h1>
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
          {canCreate('chamados') && (
            <Button onClick={handleAddChamado} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Novo Chamado</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <ChamadosStats estatisticas={estatisticas} />

      {/* Views (Meus, Atribuídos, etc) */}
      <ChamadosViews
        currentView={currentView}
        onViewChange={setCurrentView}
        userType={user?.tipo_de_acesso || 'usuario'}
        canViewAll={user?.tipo_de_acesso === 'administrador'}
      />

      {/* Filtros */}
      <div className="mb-4 space-y-3">
        <CadastroFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onKeyPress={handleKeyPress}
          onClear={() => setSearchTerm('')}
          placeholder="Buscar por título, descrição, sistema ou tela..."
        />
        
        <ChamadosFiltersAdvanced
          sistemaFilter={sistemaFilter}
          tipoFilter={tipoFilter}
          statusFilter={statusFilter}
          prioridadeFilter={prioridadeFilter}
          responsavelFilter={responsavelFilter}
          criadorFilter={criadorFilter}
          dataInicioFilter={dataInicioFilter}
          dataFimFilter={dataFimFilter}
          onSistemaChange={setSistemaFilter}
          onTipoChange={setTipoFilter}
          onStatusChange={setStatusFilter}
          onPrioridadeChange={setPrioridadeFilter}
          onResponsavelChange={setResponsavelFilter}
          onCriadorChange={setCriadorFilter}
          onDataInicioChange={setDataInicioFilter}
          onDataFimChange={setDataFimFilter}
          onClearFilters={clearFilters}
        />
      </div>

      {/* Ações de Exportação */}
      <div className="mb-4">
        <ExportButtons
          onExportXLSX={handleExportXLSX}
          onExportPDF={handleExportPDF}
          disabled={!canView('chamados')}
        />
      </div>

      {/* Tabela */}
      <ChamadosTable
        onRefresh={loadChamadosData}
        chamados={chamados}
        canView={canView}
        canEdit={canEdit}
        canDelete={canDelete}
        onView={handleViewChamado}
        onEdit={handleEditChamado}
        onDelete={handleDeleteChamado}
        getTipoLabel={getTipoLabel}
        getStatusLabel={getStatusLabel}
        getPrioridadeLabel={getPrioridadeLabel}
        getPrioridadeColor={getPrioridadeColor}
        getStatusColor={getStatusColor}
        formatDate={formatDate}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Modal de Chamado */}
      <ChamadoModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={onSubmit}
        chamado={editingChamado}
        isViewMode={viewMode}
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

      {/* Paginação */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Excluir Chamado"
        message={`Tem certeza que deseja excluir o chamado "${chamadoToDelete?.titulo}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default Chamados;
