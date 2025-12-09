import React, { useState, useEffect } from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { useTiposReceitas } from '../../hooks/useTiposReceitas';
import { TiposReceitasStats, TiposReceitasTable, TipoReceitaModal } from '../../components/tipos-receitas';
import { Button, Pagination, CadastroFilterBar } from '../../components/ui';
import { ExportButtons, AuditModal } from '../../components/shared';
import { ConfirmModal } from '../../components/ui';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import toast from 'react-hot-toast';

/**
 * Página de Cadastro de Tipos de Receitas
 */
const TiposReceitas = () => {
  const {
    tiposReceitas,
    loading,
    pagination,
    filters,
    sortField,
    sortDirection,
    carregarTiposReceitas,
    criarTipoReceita,
    atualizarTipoReceita,
    excluirTipoReceita,
    exportarJson,
    handleSort,
    handlePageChange,
    handleSearchChange,
    clearFilters
  } = useTiposReceitas();

  const { canView, canCreate, canEdit, canDelete } = usePermissions();
  
  // Permissões específicas para tipos_receitas
  const canViewTiposReceitas = canView('tipos_receitas');
  const canCreateTiposReceitas = canCreate('tipos_receitas');
  const canEditTiposReceitas = canEdit('tipos_receitas');
  const canDeleteTiposReceitas = canDelete('tipos_receitas');

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
  } = useAuditoria('tipos_receitas');

  // Estados para modais
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTipoReceita, setSelectedTipoReceita] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [tipoReceitaToDelete, setTipoReceitaToDelete] = useState(null);

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
  const handleAddTipoReceita = () => {
    setSelectedTipoReceita(null);
    setIsViewMode(false);
    setShowModal(true);
  };

  const handleViewTipoReceita = (tipoReceita) => {
    setSelectedTipoReceita(tipoReceita);
    setIsViewMode(true);
    setShowModal(true);
  };

  const handleEditTipoReceita = (tipoReceita) => {
    setSelectedTipoReceita(tipoReceita);
    setIsViewMode(false);
    setShowModal(true);
  };

  const handleDeleteTipoReceita = (tipoReceita) => {
    setTipoReceitaToDelete(tipoReceita);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTipoReceita(null);
    setIsViewMode(false);
  };

  const handleSubmitModal = async (formData) => {
    try {
      let result;
      if (selectedTipoReceita) {
        result = await atualizarTipoReceita(selectedTipoReceita.id, formData);
      } else {
        result = await criarTipoReceita(formData);
      }

      if (result.success) {
        handleCloseModal();
      }
      // O hook já mostra os toasts de sucesso/erro
    } catch (error) {
      console.error('Erro ao salvar tipo de receita:', error);
      toast.error('Erro ao salvar tipo de receita');
    }
  };

  const handleConfirmDelete = async () => {
    if (!tipoReceitaToDelete) return;

    try {
      const result = await excluirTipoReceita(tipoReceitaToDelete.id);
      if (result.success) {
        setShowDeleteModal(false);
        setTipoReceitaToDelete(null);
      }
      // O hook já mostra os toasts de sucesso/erro
    } catch (error) {
      console.error('Erro ao excluir tipo de receita:', error);
      toast.error('Erro ao excluir tipo de receita');
    }
  };

  const handleClearFilters = () => {
    clearFilters();
    setSearchTerm('');
    handlePageChange(1);
  };

  if (!canViewTiposReceitas) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Você não tem permissão para visualizar esta tela.</p>
        </div>
      </div>
    );
  }

  if (loading && tiposReceitas.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando tipos de receitas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Tipos de Receitas</h1>
        <div className="flex gap-2 sm:gap-3">
          {canCreateTiposReceitas && (
            <Button
              onClick={handleAddTipoReceita}
              variant="primary"
              size="sm"
              className="text-xs"
            >
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Novo Tipo de Receita</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          )}
          {canViewTiposReceitas && (
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
      <TiposReceitasStats tiposReceitas={tiposReceitas} />

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
      <TiposReceitasTable
        tiposReceitas={tiposReceitas}
        loading={loading}
        canView={canViewTiposReceitas}
        canEdit={canEditTiposReceitas}
        canDelete={canDeleteTiposReceitas}
        onView={handleViewTipoReceita}
        onEdit={handleEditTipoReceita}
        onDelete={handleDeleteTipoReceita}
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

      {/* Modal de Tipo de Receita */}
      <TipoReceitaModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmitModal}
        tipoReceita={selectedTipoReceita}
        isViewMode={isViewMode}
      />

      {/* Modal de confirmação de exclusão */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setTipoReceitaToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir Tipo de Receita"
        message={`Tem certeza que deseja excluir o tipo de receita "${tipoReceitaToDelete?.tipo_receita}"? Esta ação não pode ser desfeita.`}
        type="danger"
      />

      {/* Modal de Auditoria */}
      <AuditModal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        title="Relatório de Auditoria - Tipos de Receitas"
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

export default TiposReceitas;

