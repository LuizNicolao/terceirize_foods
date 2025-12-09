import React, { useState, useEffect } from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePeriodosAtendimento } from '../../hooks/usePeriodosAtendimento';
import { PeriodosAtendimentoStats, PeriodosAtendimentoTable, PeriodoAtendimentoModal } from '../../components/periodos-atendimento';
import { Button, Pagination, CadastroFilterBar } from '../../components/ui';
import { ExportButtons, AuditModal } from '../../components/shared';
import { ConfirmModal } from '../../components/ui';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import periodosAtendimentoService from '../../services/periodosAtendimento';
import toast from 'react-hot-toast';

/**
 * Página de Cadastro de Períodos de Atendimento
 */
const PeriodosAtendimento = () => {
  const {
    periodosAtendimento,
    loading,
    pagination,
    filters,
    sortField,
    sortDirection,
    carregarPeriodosAtendimento,
    criarPeriodoAtendimento,
    atualizarPeriodoAtendimento,
    excluirPeriodoAtendimento,
    exportarJson,
    handleSort,
    handlePageChange,
    handleSearchChange,
    clearFilters
  } = usePeriodosAtendimento();

  const { canView, canCreate, canEdit, canDelete } = usePermissions();
  
  // Permissões específicas para periodos_atendimento
  const canViewPeriodos = canView('periodos_atendimento');
  const canCreatePeriodos = canCreate('periodos_atendimento');
  const canEditPeriodos = canEdit('periodos_atendimento');
  const canDeletePeriodos = canDelete('periodos_atendimento');

  // Hook de auditoria
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
  } = useAuditoria('periodos_atendimento');

  // Estados para modais
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPeriodo, setSelectedPeriodo] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [periodoToDelete, setPeriodoToDelete] = useState(null);

  // Estado local para o termo de busca
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  // Atualizar estado local quando filtros mudarem externamente
  useEffect(() => {
    setSearchTerm(filters.search || '');
  }, [filters.search]);

  const handleLocalSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchChange(searchTerm);
      handlePageChange(1);
    }
  };

  const handleItemsPerPageChange = (itemsPerPage) => {
    handlePageChange(1);
    // TODO: Implementar mudança de itemsPerPage no hook
  };

  // Handlers de modal
  const handleAddPeriodo = () => {
    setSelectedPeriodo(null);
    setIsViewMode(false);
    setShowModal(true);
  };

  const handleViewPeriodo = (periodo) => {
    setSelectedPeriodo(periodo);
    setIsViewMode(true);
    setShowModal(true);
  };

  const handleEditPeriodo = (periodo) => {
    setSelectedPeriodo(periodo);
    setIsViewMode(false);
    setShowModal(true);
  };

  const handleDeletePeriodo = (periodo) => {
    setPeriodoToDelete(periodo);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPeriodo(null);
    setIsViewMode(false);
  };

  const handleSubmitModal = async () => {
    // O modal já cria os períodos e vínculos internamente
    // Recarregar a lista após salvar (seguindo padrão de receitas e pratos)
    await carregarPeriodosAtendimento();
  };

  const handleConfirmDelete = async () => {
    if (!periodoToDelete) return;

    try {
      const result = await excluirPeriodoAtendimento(periodoToDelete.id);
      if (result.success) {
        setShowDeleteModal(false);
        setPeriodoToDelete(null);
      }
      // O hook já mostra os toasts de sucesso/erro
    } catch (error) {
      console.error('Erro ao excluir período de atendimento:', error);
      toast.error('Erro ao excluir período de atendimento');
    }
  };

  // Carregar dados quando componente montar
  useEffect(() => {
    if (canViewPeriodos) {
      carregarPeriodosAtendimento();
    }
  }, [canViewPeriodos, carregarPeriodosAtendimento]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Carregando períodos de atendimento...</span>
        </div>
      </div>
    );
  }

  if (!canViewPeriodos) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800">
            Você não tem permissão para visualizar períodos de atendimento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Períodos de Atendimento</h1>
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
          {canCreatePeriodos && (
            <Button onClick={handleAddPeriodo} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar Período</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <PeriodosAtendimentoStats periodosAtendimento={periodosAtendimento} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={handleLocalSearchChange}
        onKeyPress={handleKeyPress}
        onClear={clearFilters}
        placeholder="Buscar por nome ou código..."
      />

      {/* Ações de Exportação */}
      <div className="mb-4">
        <ExportButtons
          onExportJson={exportarJson}
          onExportXLSX={null}
          onExportPDF={null}
          disabled={!canViewPeriodos}
        />
      </div>

      {/* Tabela */}
      <PeriodosAtendimentoTable
        periodosAtendimento={periodosAtendimento}
        loading={loading}
        canView={canViewPeriodos}
        canEdit={canEditPeriodos}
        canDelete={canDeletePeriodos}
        onView={handleViewPeriodo}
        onEdit={handleEditPeriodo}
        onDelete={handleDeletePeriodo}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Paginação */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}

      {/* Modal de Período */}
      <PeriodoAtendimentoModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmitModal}
        periodoAtendimento={selectedPeriodo}
        isViewMode={isViewMode}
        loading={loading}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setPeriodoToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message={
          periodoToDelete
            ? `Tem certeza que deseja excluir o período "${periodoToDelete.nome}"? Esta ação não pode ser desfeita.`
            : 'Tem certeza que deseja excluir este período?'
        }
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
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
        resource="periodos_atendimento"
      />
    </div>
  );
};

export default PeriodosAtendimento;

