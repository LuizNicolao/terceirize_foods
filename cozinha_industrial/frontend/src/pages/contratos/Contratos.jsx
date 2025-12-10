import React, { useState, useEffect } from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { useContratos } from '../../hooks/useContratos';
import { ContratosStats, ContratosTable, ContratoModal } from '../../components/contratos';
import { Button, Pagination, CadastroFilterBar, ConfirmModal, EmptyState } from '../../components/ui';
import { ExportButtons, AuditModal } from '../../components/shared';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import toast from 'react-hot-toast';

/**
 * Página de Cadastro de Contratos
 */
const Contratos = () => {
  const {
    contratos,
    loading,
    pagination,
    filters,
    sortField,
    sortDirection,
    carregarContratos,
    criarContrato,
    atualizarContrato,
    excluirContrato,
    exportarJson,
    handleSort,
    handlePageChange,
    handleSearchChange,
    clearFilters
  } = useContratos();

  const { canView, canCreate, canEdit, canDelete } = usePermissions();
  
  // Permissões específicas para contratos
  const canViewContratos = canView('contratos');
  const canCreateContratos = canCreate('contratos');
  const canEditContratos = canEdit('contratos');
  const canDeleteContratos = canDelete('contratos');

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
  } = useAuditoria('contratos');

  // Estados para modais
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedContrato, setSelectedContrato] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [contratoToDelete, setContratoToDelete] = useState(null);

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
  const handleAddContrato = () => {
    setSelectedContrato(null);
    setIsViewMode(false);
    setShowModal(true);
  };

  const handleViewContrato = (contrato) => {
    setSelectedContrato(contrato);
    setIsViewMode(true);
    setShowModal(true);
  };

  const handleEditContrato = (contrato) => {
    setSelectedContrato(contrato);
    setIsViewMode(false);
    setShowModal(true);
  };

  const handleDeleteContrato = (contrato) => {
    setContratoToDelete(contrato);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedContrato(null);
    setIsViewMode(false);
  };

  const handleSubmitModal = async () => {
    try {
      await carregarContratos();
    } catch (error) {
      toast.error('Erro ao recarregar contratos após salvar.');
    }
    handleCloseModal();
  };

  const handleConfirmDelete = async () => {
    if (!contratoToDelete) return;

    try {
      const result = await excluirContrato(contratoToDelete.id);
      if (result.success) {
        setShowDeleteModal(false);
        setContratoToDelete(null);
      }
    } catch (error) {
      console.error('Erro ao excluir contrato:', error);
      toast.error('Erro ao excluir contrato');
    }
  };

  useEffect(() => {
    if (canViewContratos) {
      carregarContratos();
    }
  }, [canViewContratos, carregarContratos]);

  if (loading && contratos.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Carregando contratos...</span>
        </div>
      </div>
    );
  }

  if (!canViewContratos) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800">
            Você não tem permissão para visualizar contratos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Contratos</h1>
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
          {canCreateContratos && (
            <Button onClick={handleAddContrato} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar Contrato</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      <ContratosStats contratos={contratos} />

      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={handleLocalSearchChange}
        onKeyPress={handleKeyPress}
        onClear={clearFilters}
        placeholder="Buscar por nome, código, cliente, filial..."
      />

      <div className="mb-4">
        <ExportButtons
          onExportJson={exportarJson}
          onExportXLSX={null}
          onExportPDF={null}
          disabled={!canViewContratos}
        />
      </div>

      {contratos.length === 0 && !loading ? (
        <EmptyState
          title="Nenhum contrato encontrado"
          description="Não há contratos cadastrados ou os filtros aplicados não retornaram resultados"
          icon="file-contract"
        />
      ) : (
        <ContratosTable
          contratos={contratos}
          loading={loading}
          canView={canViewContratos}
          canEdit={canEditContratos}
          canDelete={canDeleteContratos}
          onView={handleViewContrato}
          onEdit={handleEditContrato}
          onDelete={handleDeleteContrato}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      )}

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          totalItems={pagination.totalItems}
        />
      )}

      <ContratoModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmitModal}
        contrato={selectedContrato}
        isViewMode={isViewMode}
        loading={loading}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setContratoToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir Contrato"
        message={`Tem certeza que deseja excluir o contrato "${contratoToDelete?.nome}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />

      <AuditModal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        title="Relatório de Auditoria - Contratos"
        auditLogs={auditLogs}
        auditLoading={auditLoading}
        auditFilters={auditFilters}
        onApplyFilters={handleApplyAuditFilters}
        onExportXLSX={handleExportAuditXLSX}
        onExportPDF={handleExportAuditPDF}
        onFilterChange={(field, value) => setAuditFilters(prev => ({ ...prev, [field]: value }))}
      />
    </div>
  );
};

export default Contratos;

