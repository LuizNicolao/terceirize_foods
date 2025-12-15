import React, { useState, useEffect } from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { useTiposCardapio } from '../../hooks/useTiposCardapio';
import { TiposCardapioStats, TiposCardapioTable, TiposCardapioModal } from '../../components/tipos-cardapio';
import { Button, Pagination, CadastroFilterBar, ConfirmModal, EmptyState } from '../../components/ui';
import { ExportButtons, AuditModal } from '../../components/shared';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import tiposCardapioService from '../../services/tiposCardapio';
import toast from 'react-hot-toast';

/**
 * Página de Cadastro de Tipos de Cardápio
 */
const TiposCardapio = () => {
  const {
    tiposCardapio,
    loading,
    pagination,
    filters,
    sortField,
    sortDirection,
    carregarTiposCardapio,
    criarTipoCardapio,
    atualizarTipoCardapio,
    excluirTipoCardapio,
    exportarJson,
    handleSort,
    handlePageChange,
    handleSearchChange,
    clearFilters
  } = useTiposCardapio();

  const { canView, canCreate, canEdit, canDelete } = usePermissions();
  
  // Permissões específicas para tipos de cardápio
  const canViewTiposCardapio = canView('tipos_cardapio');
  const canCreateTiposCardapio = canCreate('tipos_cardapio');
  const canEditTiposCardapio = canEdit('tipos_cardapio');
  const canDeleteTiposCardapio = canDelete('tipos_cardapio');

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
  } = useAuditoria('tipos_cardapio');

  // Estados para modais
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTipoCardapio, setSelectedTipoCardapio] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [tipoCardapioToDelete, setTipoCardapioToDelete] = useState(null);

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
  const handleAddTipoCardapio = () => {
    setSelectedTipoCardapio(null);
    setIsViewMode(false);
    setShowModal(true);
  };

  const handleViewTipoCardapio = (tipoCardapio) => {
    setSelectedTipoCardapio(tipoCardapio);
    setIsViewMode(true);
    setShowModal(true);
  };

  const handleEditTipoCardapio = (tipoCardapio) => {
    setSelectedTipoCardapio(tipoCardapio);
    setIsViewMode(false);
    setShowModal(true);
  };

  const handleDeleteTipoCardapio = (tipoCardapio) => {
    setTipoCardapioToDelete(tipoCardapio);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTipoCardapio(null);
    setIsViewMode(false);
  };

  const handleSubmitModal = async () => {
    try {
      await carregarTiposCardapio();
    } catch (error) {
      toast.error('Erro ao recarregar tipos de cardápio após salvar.');
    }
    handleCloseModal();
  };

  const handleConfirmDelete = async () => {
    if (!tipoCardapioToDelete) return;

    try {
      const result = await excluirTipoCardapio(tipoCardapioToDelete.id);
      if (result.success) {
        setShowDeleteModal(false);
        setTipoCardapioToDelete(null);
      }
    } catch (error) {
      console.error('Erro ao excluir tipo de cardápio:', error);
      toast.error('Erro ao excluir tipo de cardápio');
    }
  };

  // Handlers de exportação
  const handleExportXLSX = async () => {
    try {
      const exportParams = {
        search: searchTerm || filters.search || '',
        filial: filters.filial_id || '',
        centro_custo: filters.centro_custo_id || '',
        contrato: filters.contrato_id || ''
      };
      
      const result = await tiposCardapioService.exportarXLSX(exportParams);
      if (result.success) {
        toast.success('Exportação XLSX realizada com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao exportar para XLSX');
      }
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      toast.error('Erro ao exportar para XLSX');
    }
  };

  const handleExportPDF = async () => {
    try {
      const exportParams = {
        search: searchTerm || filters.search || '',
        filial: filters.filial_id || '',
        centro_custo: filters.centro_custo_id || '',
        contrato: filters.contrato_id || ''
      };
      
      const result = await tiposCardapioService.exportarPDF(exportParams);
      if (result.success) {
        toast.success('Exportação PDF realizada com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao exportar para PDF');
      }
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar para PDF');
    }
  };

  useEffect(() => {
    if (canViewTiposCardapio) {
      carregarTiposCardapio();
    }
  }, [canViewTiposCardapio, carregarTiposCardapio]);

  if (loading && (!tiposCardapio || tiposCardapio.length === 0)) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Carregando tipos de cardápio...</span>
        </div>
      </div>
    );
  }

  if (!canViewTiposCardapio) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800">
            Você não tem permissão para visualizar tipos de cardápio.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Tipos de Cardápio</h1>
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
          {canCreateTiposCardapio && (
            <Button onClick={handleAddTipoCardapio} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar Tipo de Cardápio</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      <TiposCardapioStats tiposCardapio={tiposCardapio || []} />

      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={handleLocalSearchChange}
        onKeyPress={handleKeyPress}
        onClear={clearFilters}
        placeholder="Buscar por nome, filial, centro de custo, contrato..."
      />

      <div className="mb-4">
        <ExportButtons
          onExportJson={exportarJson}
          onExportXLSX={handleExportXLSX}
          onExportPDF={handleExportPDF}
          disabled={!canViewTiposCardapio}
        />
      </div>

      {(!tiposCardapio || tiposCardapio.length === 0) && !loading ? (
        <EmptyState
          title="Nenhum tipo de cardápio encontrado"
          description="Não há tipos de cardápio cadastrados ou os filtros aplicados não retornaram resultados"
          icon="utensils"
        />
      ) : (
        <TiposCardapioTable
          tiposCardapio={tiposCardapio || []}
          loading={loading}
          canView={canViewTiposCardapio}
          canEdit={canEditTiposCardapio}
          canDelete={canDeleteTiposCardapio}
          onView={handleViewTipoCardapio}
          onEdit={handleEditTipoCardapio}
          onDelete={handleDeleteTipoCardapio}
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

      <TiposCardapioModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmitModal}
        tipoCardapio={selectedTipoCardapio}
        isViewMode={isViewMode}
        loading={loading}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setTipoCardapioToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir Tipo de Cardápio"
        message={`Tem certeza que deseja excluir o tipo de cardápio "${tipoCardapioToDelete?.filial_nome || 'N/A'} - ${tipoCardapioToDelete?.contrato_nome || 'N/A'}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />

      <AuditModal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        title="Relatório de Auditoria - Tipos de Cardápio"
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

export default TiposCardapio;

