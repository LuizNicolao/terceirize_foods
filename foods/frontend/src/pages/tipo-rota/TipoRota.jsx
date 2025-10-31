import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useTipoRota } from '../../hooks/useTipoRota';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import { useExport } from '../../hooks/common/useExport';
import TipoRotaService from '../../services/tipoRota';
import { Button, ValidationErrorModal, ConfirmModal } from '../../components/ui';
import { CadastroFilterBar } from '../../components/ui';
import { Pagination } from '../../components/ui';
import { TipoRotaModal, TipoRotaTable, TipoRotaStats } from '../../components/tipo-rota';
import { AuditModal, ExportButtons } from '../../components/shared';

const TipoRota = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  // Hooks customizados
  const {
    tipoRotas,
    filiais,
    grupos,
    loading,
    loadingFiliais,
    loadingGrupos,
    gruposDisponiveis,
    loadingGruposDisponiveis,
    loadGruposDisponiveisPorFilial,
    showModal,
    viewMode,
    editingTipoRota,
    searchTerm,
    filialFilter,
    grupoFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    validationErrors,
    showValidationModal,
    showDeleteConfirmModal,
    tipoRotaToDelete,
    onSubmit,
    handleDeleteTipoRota,
    handleConfirmDelete,
    handleCloseDeleteModal,
    handleAddTipoRota,
    handleViewTipoRota,
    handleEditTipoRota,
    handleCloseModal,
    handlePageChange,
    handleItemsPerPageChange,
    setSearchTerm,
    handleKeyPress,
    setFilialFilter,
    setGrupoFilter,
    getFilialName,
    getGrupoName,
    handleCloseValidationModal,
    sortField,
    sortDirection,
    handleSort
  } = useTipoRota();

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
  } = useAuditoria('tipo_rota');

  const { handleExportXLSX, handleExportPDF } = useExport(TipoRotaService);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando tipos de rota...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Tipo de Rota</h1>
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
          {canCreate('tipo_rota') && (
            <Button onClick={handleAddTipoRota} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar Tipo de Rota</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <TipoRotaStats estatisticas={estatisticas} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onKeyPress={handleKeyPress}
        additionalFilters={[
          {
            label: 'Filial',
            value: filialFilter,
            onChange: setFilialFilter,
            options: [
              { value: 'todos', label: loadingFiliais ? 'Carregando...' : 'Todas as filiais' },
              ...filiais.map(filial => ({
                value: filial.id.toString(),
                label: `${filial.filial} (${filial.codigo_filial})`
              }))
            ]
          },
          {
            label: 'Grupo',
            value: grupoFilter,
            onChange: setGrupoFilter,
            options: [
              { value: 'todos', label: loadingGrupos ? 'Carregando...' : 'Todos os grupos' },
              ...grupos.map(grupo => ({
                value: grupo.id.toString(),
                label: grupo.nome
              }))
            ]
          }
        ]}
        placeholder="Buscar por nome..."
      />

      {/* Ações de Exportação */}
      <div className="mb-4">
        <ExportButtons
          onExportXLSX={handleExportXLSX}
          onExportPDF={handleExportPDF}
          disabled={!canView('tipo_rota')}
        />
      </div>

      {/* Tabela */}
      <TipoRotaTable
        tipoRotas={tipoRotas}
        canView={canView}
        canEdit={canEdit}
        canDelete={canDelete}
        onView={handleViewTipoRota}
        onEdit={handleEditTipoRota}
        onDelete={handleDeleteTipoRota}
        getFilialName={getFilialName}
        getGrupoName={getGrupoName}
        loadingFiliais={loadingFiliais}
        loadingGrupos={loadingGrupos}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
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

      {/* Modal de Tipo de Rota */}
      <TipoRotaModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={onSubmit}
        tipoRota={editingTipoRota}
        isViewMode={viewMode}
        filiais={filiais}
        loadingFiliais={loadingFiliais}
        grupos={grupos}
        loadingGrupos={loadingGrupos}
        gruposDisponiveis={gruposDisponiveis}
        loadingGruposDisponiveis={loadingGruposDisponiveis}
        loadGruposDisponiveisPorFilial={loadGruposDisponiveisPorFilial}
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
        title="Excluir Tipo de Rota"
        message={`Tem certeza que deseja excluir o tipo de rota "${tipoRotaToDelete?.nome}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default TipoRota;

