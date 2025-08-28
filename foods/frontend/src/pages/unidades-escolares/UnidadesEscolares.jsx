import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useUnidadesEscolares } from '../../hooks/useUnidadesEscolares';
import { useAuditoria } from '../../hooks/useAuditoria';
import { useExport } from '../../hooks/useExport';
import UnidadesEscolaresService from '../../services/unidadesEscolares';
import { Button, ValidationErrorModal } from '../../components/ui';
import { CadastroFilterBar } from '../../components/ui';
import { Pagination } from '../../components/ui';
import { UnidadeEscolarModal, UnidadesEscolaresTable, UnidadesEscolaresStats, AlmoxarifadoUnidadeEscolarModal } from '../../components/unidades-escolares';
import { AuditModal } from '../../components/shared';

const UnidadesEscolares = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  // Estado para modal de almoxarifados
  const [showAlmoxarifadosModal, setShowAlmoxarifadosModal] = React.useState(false);
  const [selectedUnidadeEscolar, setSelectedUnidadeEscolar] = React.useState(null);
  
  // Hooks customizados
  const {
    unidades,
    rotas,
    loading,
    loadingRotas,
    showModal,
    viewMode,
    editingUnidade,
    searchTerm,
    statusFilter,
    rotaFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    validationErrors,
    showValidationModal,
    onSubmit,
    handleDeleteUnidade,
    handleAddUnidade,
    handleViewUnidade,
    handleEditUnidade,
    handleCloseModal,
    handleCloseValidationModal,
    handlePageChange,
    handleItemsPerPageChange,
    setSearchTerm,
    setStatusFilter,
    setRotaFilter,
    getRotaName,
    formatCurrency
  } = useUnidadesEscolares();

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
  } = useAuditoria('unidades_escolares');

  const { handleExportXLSX, handleExportPDF } = useExport(UnidadesEscolaresService);

  // Funções para gerenciar modal de almoxarifados
  const handleOpenAlmoxarifados = (unidade) => {
    setSelectedUnidadeEscolar(unidade);
    setShowAlmoxarifadosModal(true);
  };

  const handleCloseAlmoxarifados = () => {
    setShowAlmoxarifadosModal(false);
    setSelectedUnidadeEscolar(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando unidades escolares...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Unidades Escolares</h1>
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
          {canCreate('unidades_escolares') && (
            <Button onClick={handleAddUnidade} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar Unidade</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <UnidadesEscolaresStats estatisticas={estatisticas} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        additionalFilters={[
          {
            label: 'Rota',
            value: rotaFilter,
            onChange: setRotaFilter,
            options: [
              { value: 'todos', label: loadingRotas ? 'Carregando...' : 'Todas as rotas' },
              ...rotas.map(rota => ({
                value: rota.id.toString(),
                label: rota.nome
              }))
            ]
          }
        ]}
        placeholder="Buscar por código, nome, cidade ou estado..."
      />

      {/* Tabela */}
      <UnidadesEscolaresTable
        unidades={unidades}
        canView={canView}
        canEdit={canEdit}
        canDelete={canDelete}
        onView={handleViewUnidade}
        onEdit={handleEditUnidade}
        onDelete={handleDeleteUnidade}
        onAlmoxarifados={handleOpenAlmoxarifados}
        getRotaName={getRotaName}
        loadingRotas={loadingRotas}
      />

      {/* Modal de Unidade Escolar */}
      <UnidadeEscolarModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={onSubmit}
        unidade={editingUnidade}
        isViewMode={viewMode}
        rotas={rotas}
        loadingRotas={loadingRotas}
      />

      {/* Modal de Almoxarifados */}
      <AlmoxarifadoUnidadeEscolarModal
        isOpen={showAlmoxarifadosModal}
        onClose={handleCloseAlmoxarifados}
        unidadeEscolarId={selectedUnidadeEscolar?.id}
        viewMode={false}
      />

      {/* Modal de Auditoria */}
      <AuditModal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        title="Relatório de Auditoria - Unidades Escolares"
        auditLogs={auditLogs}
        auditLoading={auditLoading}
        auditFilters={auditFilters}
        onApplyFilters={handleApplyAuditFilters}
        onExportXLSX={handleExportAuditXLSX}
        onExportPDF={handleExportAuditPDF}
        onFilterChange={(field, value) => setAuditFilters(prev => ({ ...prev, [field]: value }))}
      />

      {/* Paginação */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}

      {/* Modal de Erros de Validação */}
      <ValidationErrorModal
        isOpen={showValidationModal}
        onClose={handleCloseValidationModal}
        errors={validationErrors?.errors}
        errorCategories={validationErrors?.errorCategories}
      />
    </div>
  );
};

export default UnidadesEscolares;
