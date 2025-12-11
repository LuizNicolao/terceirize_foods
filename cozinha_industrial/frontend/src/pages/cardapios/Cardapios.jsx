import React, { useState, useEffect } from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { useCardapios } from '../../hooks/useCardapios';
import { CardapiosStats, CardapiosTable, CardapioModal } from '../../components/cardapios';
import { Button, Pagination, CadastroFilterBar, ConfirmModal, EmptyState } from '../../components/ui';
import { ExportButtons, AuditModal } from '../../components/shared';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import cardapiosService from '../../services/cardapios';
import toast from 'react-hot-toast';

/**
 * Página de Cadastro de Cardápios
 */
const Cardapios = () => {
  const {
    cardapios,
    loading,
    pagination,
    filters,
    sortField,
    sortDirection,
    carregarCardapios,
    criarCardapio,
    atualizarCardapio,
    excluirCardapio,
    exportarJson,
    handleSort,
    handlePageChange,
    handleSearchChange,
    clearFilters
  } = useCardapios();

  const { canView, canCreate, canEdit, canDelete } = usePermissions();
  
  // Permissões específicas para cardápios
  const canViewCardapios = canView('cardapios');
  const canCreateCardapios = canCreate('cardapios');
  const canEditCardapios = canEdit('cardapios');
  const canDeleteCardapios = canDelete('cardapios');

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
  } = useAuditoria('cardapios');

  // Estados para modais
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCardapio, setSelectedCardapio] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [cardapioToDelete, setCardapioToDelete] = useState(null);

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

  // Handlers de modal
  const handleAddCardapio = () => {
    setSelectedCardapio(null);
    setIsViewMode(false);
    setShowModal(true);
  };

  const handleViewCardapio = (cardapio) => {
    setSelectedCardapio(cardapio);
    setIsViewMode(true);
    setShowModal(true);
  };

  const handleEditCardapio = (cardapio) => {
    setSelectedCardapio(cardapio);
    setIsViewMode(false);
    setShowModal(true);
  };

  const handleDeleteCardapio = (cardapio) => {
    setCardapioToDelete(cardapio);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCardapio(null);
    setIsViewMode(false);
  };

  const handleSubmitModal = async () => {
    try {
      await carregarCardapios();
    } catch (error) {
      toast.error('Erro ao recarregar cardápios após salvar.');
    }
    handleCloseModal();
  };

  const handleConfirmDelete = async () => {
    if (!cardapioToDelete) return;

    try {
      const result = await excluirCardapio(cardapioToDelete.id);
      if (result.success) {
        setShowDeleteModal(false);
        setCardapioToDelete(null);
      }
    } catch (error) {
      console.error('Erro ao excluir cardápio:', error);
      toast.error('Erro ao excluir cardápio');
    }
  };

  useEffect(() => {
    if (canViewCardapios) {
      carregarCardapios();
    }
  }, [canViewCardapios, carregarCardapios]);

  if (loading && cardapios.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Carregando cardápios...</span>
        </div>
      </div>
    );
  }

  if (!canViewCardapios) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800">
            Você não tem permissão para visualizar cardápios.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Cardápios</h1>
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
          {canCreateCardapios && (
            <Button onClick={handleAddCardapio} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar Cardápio</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      <CardapiosStats cardapios={cardapios} />

      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={handleLocalSearchChange}
        onKeyPress={handleKeyPress}
        onClear={clearFilters}
        placeholder="Buscar por nome do cardápio..."
      />

      <div className="mb-4">
        <ExportButtons
          onExportJson={exportarJson}
          onExportXLSX={null}
          onExportPDF={null}
          disabled={!canViewCardapios}
        />
      </div>

      {cardapios.length === 0 && !loading ? (
        <EmptyState
          title="Nenhum cardápio encontrado"
          description="Não há cardápios cadastrados ou os filtros aplicados não retornaram resultados"
          icon="clipboard-list"
        />
      ) : (
        <CardapiosTable
          cardapios={cardapios}
          loading={loading}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onView={canViewCardapios ? handleViewCardapio : undefined}
          onEdit={canEditCardapios ? handleEditCardapio : undefined}
          onDelete={canDeleteCardapios ? handleDeleteCardapio : undefined}
          canView={canViewCardapios}
          canEdit={canEditCardapios}
          canDelete={canDeleteCardapios}
        />
      )}

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage || 1}
          totalPages={pagination.totalPages || 1}
          itemsPerPage={pagination.itemsPerPage || 20}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          totalItems={pagination.totalItems || 0}
        />
      )}

      {/* Modal de Cardápio */}
      <CardapioModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmitModal}
        cardapio={selectedCardapio}
        isViewMode={isViewMode}
        onCreate={criarCardapio}
        onUpdate={atualizarCardapio}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCardapioToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir Cardápio"
        message={`Tem certeza que deseja excluir o cardápio "${cardapioToDelete?.nome}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />

      {/* Modal de Auditoria */}
      <AuditModal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        title="Relatório de Auditoria - Cardápios"
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

export default Cardapios;

