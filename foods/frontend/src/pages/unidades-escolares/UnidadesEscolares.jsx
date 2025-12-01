import React, { useState } from 'react';
import { FaPlus, FaQuestionCircle, FaList, FaMap } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useUnidadesEscolares } from '../../hooks/useUnidadesEscolares';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import { useExport } from '../../hooks/common/useExport';
import UnidadesEscolaresService from '../../services/unidadesEscolares';
import { Button, ValidationErrorModal, ConfirmModal } from '../../components/ui';
import { CadastroFilterBarSearchable } from '../../components/ui';
import { Pagination } from '../../components/ui';
import { UnidadeEscolarModal, UnidadesEscolaresTable, UnidadesEscolaresStats, ImportarUnidadesEscolares, MapaContent } from '../../components/unidades-escolares';
import { AuditModal, ExportButtons } from '../../components/shared';

const UnidadesEscolares = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  // Estado para modal de importação
  const [showImportModal, setShowImportModal] = useState(false);
  
  // Estado para controlar a aba ativa (lista ou mapa)
  const [activeTab, setActiveTab] = useState('lista'); // 'lista' ou 'mapa'
  
  // Hooks customizados
  const {
    unidades,
    rotas,
    filiais,
    loading,
    loadingRotas,
    loadingFiliais,
    showModal,
    viewMode,
    editingUnidade,
    searchTerm,
    statusFilter,
    rotaFilter,
    filialFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    validationErrors,
    showValidationModal,
    showDeleteConfirmModal,
    unidadeToDelete,
    onSubmit,
    handleDeleteUnidade,
    handleConfirmDelete,
    handleCloseDeleteModal,
    handleAddUnidade,
    handleViewUnidade,
    handleEditUnidade,
    handleCloseModal,
    handleCloseValidationModal,
    handlePageChange,
    handleItemsPerPageChange,
    setSearchTerm,
    handleKeyPress,
    setStatusFilter,
    setRotaFilter,
    setFilialFilter,
    getRotaName,
    formatCurrency
  ,
    sortField,
    sortDirection,
    handleSort
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
            <>
              <Button 
                onClick={() => setShowImportModal(true)} 
                variant="outline" 
                size="sm"
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                📊 Importar
              </Button>
              <Button onClick={handleAddUnidade} size="sm">
                <FaPlus className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Adicionar Unidade</span>
                <span className="sm:hidden">Adicionar</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <UnidadesEscolaresStats estatisticas={estatisticas} />

      {/* Abas */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('lista')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'lista'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaList />
            Lista
          </button>
          <button
            onClick={() => setActiveTab('mapa')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === 'mapa'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaMap />
            Mapa
          </button>
        </nav>
      </div>

      {/* Filtros */}
      <CadastroFilterBarSearchable
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onKeyPress={handleKeyPress}
        additionalFilters={[
          {
            label: 'Rota',
            value: rotaFilter,
            onChange: setRotaFilter,
            options: rotas.map(rota => ({
                value: rota.id.toString(),
              label: rota.codigo ? `${rota.codigo} - ${rota.nome}` : rota.nome
            })),
            useSearchable: true // Forçar uso de SearchableSelect para rota
          },
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
        placeholder="Buscar por código, nome, cidade ou estado..."
        useSearchableSelect={true}
      />

      {/* Ações de Exportação */}
      {activeTab === 'lista' && (
      <div className="mb-4">
        <ExportButtons
          onExportXLSX={handleExportXLSX}
          onExportPDF={handleExportPDF}
          disabled={!canView('unidades_escolares')}
        />
      </div>
      )}

      {/* Conteúdo das Abas */}
      {activeTab === 'lista' && (
        <>
          {/* Tabela */}
          <UnidadesEscolaresTable
            unidades={unidades}
            canView={canView}
            canEdit={canEdit}
            canDelete={canDelete}
            onView={handleViewUnidade}
            onEdit={handleEditUnidade}
            onDelete={handleDeleteUnidade}
            getRotaName={getRotaName}
            loadingRotas={loadingRotas}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
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
        </>
      )}

      {/* Mapa só é renderizado quando a aba está ativa - economiza recursos */}
      {activeTab === 'mapa' && (
        <MapaContent
          filialId={filialFilter && filialFilter !== 'todos' ? parseInt(filialFilter) : null}
          rotaId={rotaFilter && rotaFilter !== 'todos' && rotaFilter !== '' ? parseInt(rotaFilter) : null}
          searchTerm={searchTerm}
        />
      )}

      {/* Modal de Unidade Escolar */}
      <UnidadeEscolarModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={onSubmit}
        unidade={editingUnidade}
        isViewMode={viewMode}
        rotas={rotas}
        filiais={filiais}
        loadingRotas={loadingRotas}
        loadingFiliais={loadingFiliais}
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

      {/* Modal de Erros de Validação */}
      <ValidationErrorModal
        isOpen={showValidationModal}
        onClose={handleCloseValidationModal}
        errors={validationErrors?.errors}
        errorCategories={validationErrors?.errorCategories}
      />

      {/* Modal de Importação */}
      <ImportarUnidadesEscolares
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={(data) => {
          setShowImportModal(false);
          // Recarregar a lista de unidades escolares
          window.location.reload();
        }}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Excluir Unidade Escolar"
        message={`Tem certeza que deseja excluir a unidade escolar "${unidadeToDelete?.nome}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default UnidadesEscolares;
