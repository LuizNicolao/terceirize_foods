/**
 * Página de Ficha Homologação
 * Interface principal para gerenciamento de fichas de homologação
 */

import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useFichaHomologacao } from '../../hooks/useFichaHomologacao';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import { useExport } from '../../hooks/common/useExport';
import fichaHomologacaoService from '../../services/fichaHomologacao';
import { Button, ValidationErrorModal, ConfirmModal } from '../../components/ui';
import { CadastroFilterBar } from '../../components/ui';
import { Pagination } from '../../components/ui';
import { FichaHomologacaoModal, FichaHomologacaoTable, FichaHomologacaoStats } from '../../components/ficha-homologacao';
import { AuditModal, ExportButtons } from '../../components/shared';

const FichaHomologacao = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  // Hooks customizados
  const {
    fichasHomologacao,
    loading,
    showModal,
    viewMode,
    editingFichaHomologacao,
    showValidationModal,
    validationErrors,
    showDeleteConfirmModal,
    fichaHomologacaoToDelete,
    nomeGenericos,
    marcas,
    fornecedores,
    unidadesMedida,
    usuarios,
    searchTerm,
    statusFilter,
    tipoFilter,
    nomeGenericoFilter,
    fornecedorFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,
    onSubmit,
    handleDeleteFichaHomologacao,
    handleConfirmDelete,
    handleCloseDeleteModal,
    handleAddFichaHomologacao,
    handleViewFichaHomologacao,
    handleEditFichaHomologacao,
    handleCloseModal,
    handleCloseValidationModal,
    handlePageChange,
    handleClearFilters,
    setSearchTerm,
    handleKeyPress,
    setStatusFilter,
    setTipoFilter,
    setNomeGenericoFilter,
    setFornecedorFilter,
    setItemsPerPage,
    formatDate,
    getStatusLabel,
    getStatusColor,
    getTipoLabel,
    getAvaliacaoLabel,
    getAvaliacaoColor,
    sortField,
    sortDirection,
    handleSort
  } = useFichaHomologacao();

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
  } = useAuditoria('ficha_homologacao');

  const { handleExportXLSX, handleExportPDF } = useExport(fichaHomologacaoService);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Carregando fichas de homologação...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Fichas de Homologação</h1>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            onClick={handleOpenAuditModal}
            variant="ghost"
            size="sm"
          >
            <FaQuestionCircle className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Auditoria</span>
            <span className="sm:hidden">Auditoria</span>
          </Button>
          {canCreate('ficha_homologacao') && (
            <Button onClick={handleAddFichaHomologacao} variant="primary" size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar Ficha</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <FichaHomologacaoStats estatisticas={estatisticas} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onKeyPress={handleKeyPress}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onClear={handleClearFilters}
        placeholder="Buscar por nome genérico, marca, fornecedor..."
        additionalFilters={[
          {
            label: 'Tipo',
            value: tipoFilter,
            onChange: setTipoFilter,
            options: [
              { value: 'todos', label: 'Todos os tipos' },
              { value: 'NOVO_PRODUTO', label: 'Novo Produto' },
              { value: 'REAVALIACAO', label: 'Reavaliação' }
            ]
          },
          {
            label: 'Nome Genérico',
            value: nomeGenericoFilter,
            onChange: setNomeGenericoFilter,
            options: [
              { value: 'todos', label: 'Selecione um nome genérico...' },
              ...(nomeGenericos?.map(ng => ({ value: ng.id.toString(), label: `${ng.codigo} - ${ng.nome}` })) || [])
            ]
          },
          {
            label: 'Fornecedor',
            value: fornecedorFilter,
            onChange: setFornecedorFilter,
            options: [
              { value: 'todos', label: 'Selecione um fornecedor...' },
              ...(fornecedores?.map(f => ({ value: f.id.toString(), label: f.razao_social || f.nome_fantasia || f.nome })) || [])
            ]
          }
        ]}
      />

      {/* Export Buttons */}
      <div className="mb-4 flex justify-start">
        <ExportButtons
          onExportXLSX={() => handleExportXLSX({
            search: searchTerm,
            status: statusFilter !== 'todos' ? statusFilter : undefined,
            tipo: tipoFilter !== 'todos' ? tipoFilter : undefined,
            produto_generico_id: nomeGenericoFilter !== 'todos' ? nomeGenericoFilter : undefined,
            fornecedor_id: fornecedorFilter !== 'todos' ? fornecedorFilter : undefined
          })}
          onExportPDF={() => handleExportPDF({
            search: searchTerm,
            status: statusFilter !== 'todos' ? statusFilter : undefined,
            tipo: tipoFilter !== 'todos' ? tipoFilter : undefined,
            produto_generico_id: nomeGenericoFilter !== 'todos' ? nomeGenericoFilter : undefined,
            fornecedor_id: fornecedorFilter !== 'todos' ? fornecedorFilter : undefined
          })}
        />
      </div>

      {/* Tabela */}
      <FichaHomologacaoTable
        fichasHomologacao={fichasHomologacao}
        canView={canView('ficha_homologacao')}
        canEdit={canEdit('ficha_homologacao')}
        canDelete={canDelete('ficha_homologacao')}
        onView={handleViewFichaHomologacao}
        onEdit={handleEditFichaHomologacao}
        onDelete={handleDeleteFichaHomologacao}
        getStatusLabel={getStatusLabel}
        getStatusColor={getStatusColor}
        getTipoLabel={getTipoLabel}
        getAvaliacaoLabel={getAvaliacaoLabel}
        getAvaliacaoColor={getAvaliacaoColor}
        formatDate={formatDate}
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
        onItemsPerPageChange={setItemsPerPage}
      />

      {/* Modal */}
      <FichaHomologacaoModal
        isOpen={showModal}
        onClose={handleCloseModal}
        fichaHomologacao={editingFichaHomologacao}
        nomeGenericos={nomeGenericos}
        marcas={marcas}
        fornecedores={fornecedores}
        unidadesMedida={unidadesMedida}
        usuarios={usuarios}
        onSubmit={onSubmit}
        viewMode={viewMode}
      />

      {/* Modal de Validação */}
      <ValidationErrorModal
        isOpen={showValidationModal}
        onClose={handleCloseValidationModal}
        errors={validationErrors}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir a ficha de homologação #${fichaHomologacaoToDelete?.id}?`}
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
        setFilters={setAuditFilters}
        entityName="ficha_homologacao"
      />
    </div>
  );
};

export default FichaHomologacao;

