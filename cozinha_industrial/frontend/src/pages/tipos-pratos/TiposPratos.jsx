import React, { useState, useEffect } from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { useTiposPratos } from '../../hooks/useTiposPratos';
import { TiposPratosStats, TiposPratosTable, TipoPratoModal } from '../../components/tipos-pratos';
import { Button, Pagination, CadastroFilterBar } from '../../components/ui';
import { ExportButtons, AuditModal } from '../../components/shared';
import { ConfirmModal } from '../../components/ui';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import toast from 'react-hot-toast';

/**
 * Página de Cadastro de Tipos de Pratos
 */
const TiposPratos = () => {
  const {
    tiposPratos,
    loading,
    pagination,
    filters,
    sortField,
    sortDirection,
    carregarTiposPratos,
    criarTipoPrato,
    atualizarTipoPrato,
    excluirTipoPrato,
    exportarJson,
    handleSort,
    handlePageChange,
    handleSearchChange,
    clearFilters
  } = useTiposPratos();

  const { canView, canCreate, canEdit, canDelete } = usePermissions();
  
  // Permissões específicas para tipos_pratos
  const canViewTiposPratos = canView('tipos_pratos');
  const canCreateTiposPratos = canCreate('tipos_pratos');
  const canEditTiposPratos = canEdit('tipos_pratos');
  const canDeleteTiposPratos = canDelete('tipos_pratos');

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
  } = useAuditoria('tipos_pratos');

  // Estados para modais
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTipoPrato, setSelectedTipoPrato] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [tipoPratoToDelete, setTipoPratoToDelete] = useState(null);

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
  const handleAddTipoPrato = () => {
    setSelectedTipoPrato(null);
    setIsViewMode(false);
    setShowModal(true);
  };

  const handleViewTipoPrato = (tipoPrato) => {
    setSelectedTipoPrato(tipoPrato);
    setIsViewMode(true);
    setShowModal(true);
  };

  const handleEditTipoPrato = (tipoPrato) => {
    setSelectedTipoPrato(tipoPrato);
    setIsViewMode(false);
    setShowModal(true);
  };

  const handleDeleteTipoPrato = (tipoPrato) => {
    setTipoPratoToDelete(tipoPrato);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTipoPrato(null);
    setIsViewMode(false);
  };

  const handleSubmitModal = async (formData) => {
    try {
      let result;
      if (selectedTipoPrato) {
        result = await atualizarTipoPrato(selectedTipoPrato.id, formData);
      } else {
        result = await criarTipoPrato(formData);
      }

      if (result.success) {
        handleCloseModal();
      }
      // O hook já mostra os toasts de sucesso/erro
    } catch (error) {
      console.error('Erro ao salvar tipo de prato:', error);
      toast.error('Erro ao salvar tipo de prato');
    }
  };

  const handleConfirmDelete = async () => {
    if (!tipoPratoToDelete) return;

    try {
      const result = await excluirTipoPrato(tipoPratoToDelete.id);
      if (result.success) {
        setShowDeleteModal(false);
        setTipoPratoToDelete(null);
      }
      // O hook já mostra os toasts de sucesso/erro
    } catch (error) {
      console.error('Erro ao excluir tipo de prato:', error);
      toast.error('Erro ao excluir tipo de prato');
    }
  };

  const handleClearFilters = () => {
    clearFilters();
    setSearchTerm('');
    handlePageChange(1);
  };

  if (!canViewTiposPratos) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Você não tem permissão para visualizar esta tela.</p>
        </div>
      </div>
    );
  }

  if (loading && tiposPratos.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando tipos de pratos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Tipos de Pratos</h1>
        <div className="flex gap-2 sm:gap-3">
          {canCreateTiposPratos && (
            <Button
              onClick={handleAddTipoPrato}
              variant="primary"
              size="sm"
              className="text-xs"
            >
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Novo Tipo de Prato</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          )}
          {canViewTiposPratos && (
            <Button
              onClick={handleOpenAuditModal}
              variant="ghost"
              size="sm"
              className="text-xs"
              disabled={loading}
            >
              <FaQuestionCircle className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Auditoria</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <TiposPratosStats tiposPratos={tiposPratos} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={handleLocalSearchChange}
        onKeyPress={handleKeyPress}
        onClear={handleClearFilters}
        placeholder="Buscar por código, tipo ou descrição..."
      />

      {/* Botões de Exportação */}
      <div className="mb-4">
        <ExportButtons
          onExportJSON={exportarJson}
          onExportPDF={() => {}}
        />
      </div>

      {/* Tabela */}
      <TiposPratosTable
        tiposPratos={tiposPratos}
        loading={loading}
        canView={canViewTiposPratos}
        canEdit={canEditTiposPratos}
        canDelete={canDeleteTiposPratos}
        onView={handleViewTipoPrato}
        onEdit={handleEditTipoPrato}
        onDelete={handleDeleteTipoPrato}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Paginação */}
      <Pagination
        currentPage={pagination.currentPage || 1}
        totalPages={pagination.totalPages || 1}
        onPageChange={handlePageChange}
        itemsPerPage={pagination.itemsPerPage || 20}
        onItemsPerPageChange={handleItemsPerPageChange}
        totalItems={pagination.totalItems || 0}
      />

      {/* Modal de Tipo de Prato */}
      <TipoPratoModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmitModal}
        tipoPrato={selectedTipoPrato}
        isViewMode={isViewMode}
      />

      {/* Modal de confirmação de exclusão */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setTipoPratoToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir Tipo de Prato"
        message={`Tem certeza que deseja excluir o tipo de prato "${tipoPratoToDelete?.tipo_prato}"? Esta ação não pode ser desfeita.`}
        type="danger"
      />

      {/* Modal de Auditoria */}
      <AuditModal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        title="Relatório de Auditoria - Tipos de Pratos"
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

export default TiposPratos;

