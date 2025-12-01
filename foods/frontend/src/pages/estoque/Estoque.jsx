import React from 'react';
import { FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useEstoque } from '../../hooks/useEstoque';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import { useExport } from '../../hooks/common/useExport';
import { Button, ValidationErrorModal } from '../../components/ui';
import { CadastroFilterBarSearchable } from '../../components/ui';
import { Pagination } from '../../components/ui';
import { EstoqueModal, EstoqueTable, EstoqueStats } from '../../components/estoque';
import { AuditModal, ExportButtons } from '../../components/shared';
import EstoqueService from '../../services/estoqueService';

const Estoque = () => {
  const { canView } = usePermissions();
  
  // Hooks customizados
  const {
    estoques,
    loading,
    showModal,
    viewMode,
    editingEstoque,
    showValidationModal,
    validationErrors,
    searchTerm,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    onSubmit,
    handleViewEstoque,
    handleCloseModal,
    handleCloseValidationModal,
    handlePageChange,
    handleItemsPerPageChange,
    setSearchTerm,
    handleKeyPress,
    handleApplyFilters,
    filialFilter,
    setFilialFilter,
    filiais,
    centroCustoFilter,
    setCentroCustoFilter,
    centrosCusto,
    almoxarifadoFilter,
    setAlmoxarifadoFilter,
    almoxarifados,
    grupoFilter,
    setGrupoFilter,
    grupos,
    subgrupoFilter,
    setSubgrupoFilter,
    subgrupos,
    classeFilter,
    setClasseFilter,
    classes,
    loadingFiltros,
    handleClearFilters,
    formatDate,
    formatCurrency,
    formatNumber,
    getStatusLabel,
    sortField,
    sortDirection,
    handleSort,
    carregarEstoques
  } = useEstoque();

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
  } = useAuditoria('almoxarifado_estoque');

  // Hook de exportação
  const { handleExportXLSX: exportXLSX, handleExportPDF: exportPDF } = useExport(EstoqueService);

  // Funções wrapper para exportação com filtros
  const handleExportXLSX = React.useCallback(() => {
    const params = {
      search: searchTerm || undefined
    };
    return exportXLSX(params);
  }, [exportXLSX, searchTerm]);

  const handleExportPDF = React.useCallback(() => {
    const params = {
      search: searchTerm || undefined
    };
    return exportPDF(params);
  }, [exportPDF, searchTerm]);

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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Estoque</h1>
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
        </div>
      </div>

      {/* Estatísticas */}
      <EstoqueStats estatisticas={estatisticas} />

      {/* Filtros */}
      <CadastroFilterBarSearchable
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onKeyPress={handleKeyPress}
        onClear={handleClearFilters}
        onApplyFilters={handleApplyFilters}
        showApplyButton={true}
        placeholder="Buscar por produto, almoxarifado ou lote..."
        useSearchableSelect={true}
        additionalFilters={[
          {
            label: 'Filial *',
            value: filialFilter || '',
            onChange: setFilialFilter,
            required: true,
            options: [
              { value: '', label: 'Selecione uma filial' },
              ...(filiais || []).map(filial => ({
                value: filial.id.toString(),
                label: filial.nome || `Filial ${filial.id}`
              }))
            ]
          },
          {
            label: 'Centro de Custo *',
            value: centroCustoFilter || '',
            onChange: setCentroCustoFilter,
            required: true,
            disabled: !filialFilter || filialFilter === '',
            options: [
              { value: '', label: 'Selecione um centro de custo' },
              ...(Array.isArray(centrosCusto) ? centrosCusto.map(centroCusto => ({
                value: centroCusto?.id?.toString() || '',
                label: centroCusto?.nome || `Centro de Custo ${centroCusto?.id || ''}`
              })).filter(opt => opt.value) : [])
            ]
          },
          {
            label: 'Almoxarifado',
            value: almoxarifadoFilter || 'todos',
            onChange: setAlmoxarifadoFilter,
            disabled: !centroCustoFilter || centroCustoFilter === '',
            options: [
              { value: 'todos', label: 'Todos os almoxarifados' },
              ...(Array.isArray(almoxarifados) ? almoxarifados.map(almoxarifado => ({
                value: almoxarifado?.id?.toString() || '',
                label: almoxarifado?.nome || `Almoxarifado ${almoxarifado?.id || ''}`
              })).filter(opt => opt.value) : [])
            ]
          },
          {
            label: 'Grupo',
            value: Array.isArray(grupoFilter) ? grupoFilter : (grupoFilter && grupoFilter !== 'todos' ? [grupoFilter] : []),
            onChange: setGrupoFilter,
            multiple: true, // Habilitar seleção múltipla
            disabled: almoxarifadoFilter === 'todos' || !almoxarifadoFilter,
            options: [
              ...(Array.isArray(grupos) ? grupos.map(grupo => ({
                value: grupo?.id?.toString() || '',
                label: grupo?.nome || `Grupo ${grupo?.id || ''}`
              })).filter(opt => opt.value) : [])
            ]
          },
          {
            label: 'Subgrupo',
            value: subgrupoFilter || 'todos',
            onChange: setSubgrupoFilter,
            disabled: !Array.isArray(grupoFilter) || grupoFilter.length === 0,
            options: [
              { value: 'todos', label: 'Todos os subgrupos' },
              ...(subgrupos || []).map(subgrupo => ({
                value: subgrupo.id.toString(),
                label: subgrupo.nome || `Subgrupo ${subgrupo.id}`
              }))
            ]
          },
          {
            label: 'Classes',
            value: classeFilter || 'todos',
            onChange: setClasseFilter,
            disabled: subgrupoFilter === 'todos' || !subgrupoFilter,
            options: [
              { value: 'todos', label: 'Todas as classes' },
              ...(Array.isArray(classes) ? classes.map(classe => ({
                value: classe?.id?.toString() || '',
                label: classe?.nome || `Classe ${classe?.id || ''}`
              })).filter(opt => opt.value) : [])
            ]
          }
        ]}
      />

      {/* Ações de Exportação */}
      <div className="mb-4">
        <ExportButtons
          onExportXLSX={handleExportXLSX}
          onExportPDF={handleExportPDF}
          disabled={!canView('almoxarifado_estoque')}
        />
      </div>

      {/* Tabela */}
      <EstoqueTable
        estoques={estoques}
        canView={canView}
        onView={handleViewEstoque}
        getStatusLabel={getStatusLabel}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
        formatNumber={formatNumber}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Modal de Estoque */}
      <EstoqueModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={onSubmit}
        estoque={editingEstoque}
        isViewMode={viewMode}
        onSuccess={carregarEstoques}
      />

      {/* Modal de Auditoria */}
      <AuditModal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        title="Relatório de Auditoria - Estoque"
        auditLogs={auditLogs}
        auditLoading={auditLoading}
        auditFilters={auditFilters}
        auditPagination={auditPagination}
        onApplyFilters={handleApplyAuditFilters}
        onPageChange={handleAuditPageChange}
        onItemsPerPageChange={handleAuditItemsPerPageChange}
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

      {/* Paginação */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
};

export default Estoque;



