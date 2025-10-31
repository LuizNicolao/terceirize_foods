import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useRotas } from '../../hooks/useRotas';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import { useExport } from '../../hooks/common/useExport';
import RotasService from '../../services/rotas';
import { Button, ValidationErrorModal, ConfirmModal } from '../../components/ui';
import { CadastroFilterBar } from '../../components/ui';
import { Pagination } from '../../components/ui';
import { RotaModal, RotasTable, RotasStats } from '../../components/rotas';
import { AuditModal, ExportButtons } from '../../components/shared';

const Rotas = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  // Hooks customizados
  const {
    rotas,
    filiais,
    loading,
    loadingFiliais,
    showModal,
    viewMode,
    editingRota,
    searchTerm,
    filialFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    unidadesEscolares,
    loadingUnidades,
    showUnidades,
    totalUnidades,
    validationErrors,
    tiposRota,
    loadingTiposRota,
    loadTiposRota,
    unidadesDisponiveis,
    loadingUnidadesDisponiveis,
    loadUnidadesDisponiveisPorFilial,
    loadTodasUnidadesPorFilial,
    showValidationModal,
    showDeleteConfirmModal,
    rotaToDelete,
    onSubmit,
    handleDeleteRota,
    handleConfirmDelete,
    handleCloseDeleteModal,
    handleAddRota,
    handleViewRota,
    handleEditRota,
    handleCloseModal,
    handlePageChange,
    handleItemsPerPageChange,
    setSearchTerm,
    handleKeyPress,
    setFilialFilter,
    toggleUnidades,
    getFilialName,
    formatCurrency,
    formatTipoRota,
    handleCloseValidationModal
  ,
    sortField,
    sortDirection,
    handleSort
  } = useRotas();

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
  } = useAuditoria('rotas');

  const { handleExportXLSX, handleExportPDF } = useExport(RotasService);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando rotas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Rotas</h1>
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
          {canCreate('rotas') && (
            <Button onClick={handleAddRota} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar Rota</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <RotasStats estatisticas={estatisticas} />

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
          }
        ]}
        placeholder="Buscar por nome ou código..."
      />

      {/* Ações de Exportação */}
      <div className="mb-4">
        <ExportButtons
          onExportXLSX={handleExportXLSX}
          onExportPDF={handleExportPDF}
          disabled={!canView('rotas')}
        />
      </div>

      {/* Tabela */}
      <RotasTable
        rotas={rotas}
        canView={canView}
        canEdit={canEdit}
        canDelete={canDelete}
        onView={handleViewRota}
        onEdit={handleEditRota}
        onDelete={handleDeleteRota}
        getFilialName={getFilialName}
        formatCurrency={formatCurrency}
        formatTipoRota={formatTipoRota}
        loadingFiliais={loadingFiliais}
      
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

      {/* Modal de Rota */}
      <RotaModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={onSubmit}
        rota={editingRota}
        isViewMode={viewMode}
        filiais={filiais}
        loadingFiliais={loadingFiliais}
        tiposRota={tiposRota}
        loadingTiposRota={loadingTiposRota}
        unidadesEscolares={unidadesEscolares}
        loadingUnidades={loadingUnidades}
        showUnidades={showUnidades}
        totalUnidades={totalUnidades}
        onToggleUnidades={toggleUnidades}
        unidadesDisponiveis={unidadesDisponiveis}
        loadingUnidadesDisponiveis={loadingUnidadesDisponiveis}
        onFilialChange={(filialId, grupoId = null, rotaId = null) => {
          // Carregar tipos de rota quando filial mudar
          loadTiposRota(filialId);
          // Carregar unidades disponíveis considerando o grupo da rota
          // Regra: Escola só não aparece se já está em uma rota do mesmo grupo
          if (editingRota) {
            // Em edição, usar rotaId para permitir escolas já vinculadas a esta rota
            loadUnidadesDisponiveisPorFilial(filialId, grupoId, editingRota.id);
          } else {
            // Em criação, usar grupoId do tipo de rota selecionado (se houver)
            loadUnidadesDisponiveisPorFilial(filialId, grupoId);
          }
        }}
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
        title="Excluir Rota"
        message={`Tem certeza que deseja excluir a rota "${rotaToDelete?.nome}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default Rotas;
