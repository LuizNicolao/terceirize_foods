import React, { useState, useEffect } from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { useReceitas } from '../../hooks/useReceitas';
import { ReceitasStats, ReceitasTable, ReceitaModal } from '../../components/receitas';
import { Button, Pagination, CadastroFilterBar } from '../../components/ui';
import { ExportButtons, AuditModal } from '../../components/shared';
import { ConfirmModal } from '../../components/ui';
import { useAuditoria } from '../../hooks/common/useAuditoria';

/**
 * Página de Cadastro de Receitas
 */
const Receitas = () => {
  const {
    receitas,
    loading,
    error,
    stats,
    pagination,
    filters,
    sortField,
    sortDirection,
    atualizarFiltros,
    atualizarPaginacao,
    limparFiltros,
    recarregar,
    handleSort,
    carregarReceitaPorId,
    criarReceita,
    atualizarReceita,
    excluirReceita,
    exportarReceitas
  } = useReceitas();

  // Estados para modais
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReceita, setSelectedReceita] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [receitaToDelete, setReceitaToDelete] = useState(null);

  // Estado local para o termo de busca
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  // Atualizar estado local quando filtros mudarem externamente
  useEffect(() => {
    setSearchTerm(filters.search || '');
  }, [filters.search]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      atualizarFiltros({ search: searchTerm });
    }
  };

  // Handlers de modal
  const handleAddReceita = () => {
    setSelectedReceita(null);
    setIsViewMode(false);
    setIsEditing(false);
    setShowModal(true);
  };

  const handleViewReceita = async (receita) => {
    try {
      const receitaCompleta = await carregarReceitaPorId(receita.id);
      setSelectedReceita(receitaCompleta);
      setIsViewMode(true);
      setIsEditing(false);
      setShowModal(true);
    } catch (err) {
      console.error('Erro ao carregar receita:', err);
    }
  };

  const handleEditReceita = async (receita) => {
    try {
      const receitaCompleta = await carregarReceitaPorId(receita.id);
      setSelectedReceita(receitaCompleta);
      setIsViewMode(false);
      setIsEditing(true);
      setShowModal(true);
    } catch (err) {
      console.error('Erro ao carregar receita:', err);
    }
  };

  const handleDeleteReceita = (receita) => {
    setReceitaToDelete(receita);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedReceita(null);
    setIsViewMode(false);
    setIsEditing(false);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setReceitaToDelete(null);
  };

  // Handler de submit do formulário
  const handleSubmit = async (data) => {
    if (isEditing && selectedReceita) {
      await atualizarReceita(selectedReceita.id, data);
    } else {
      await criarReceita(data);
    }
    handleCloseModal();
  };

  // Handler de confirmação de exclusão
  const handleConfirmDelete = async () => {
    if (receitaToDelete) {
      await excluirReceita(receitaToDelete.id);
      handleCloseDeleteModal();
    }
  };

  // Handlers de paginação
  const handlePageChange = (page) => {
    atualizarPaginacao({ currentPage: page });
  };

  const handleItemsPerPageChange = (itemsPerPage) => {
    atualizarPaginacao({ itemsPerPage, currentPage: 1 });
  };

  // Handlers de exportação
  const handleExportJSON = async () => {
    await exportarReceitas();
  };

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
  } = useAuditoria('receitas');

  if (loading && receitas.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando receitas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Cadastro de Receitas</h1>
        <div className="flex gap-2 sm:gap-3">
          <Button
            onClick={handleAddReceita}
            variant="primary"
            size="sm"
            className="text-xs"
          >
            <FaPlus className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Nova Receita</span>
            <span className="sm:hidden">Nova</span>
          </Button>
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
        </div>
      </div>

      {/* Estatísticas */}
      <ReceitasStats stats={stats} loading={loading} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onKeyPress={handleKeyPress}
        onClear={limparFiltros}
        placeholder="Buscar por código, nome, tipo, filial, centro de custo ou produtos..."
      />

      {/* Botões de Exportação */}
      <div className="mb-4">
        <ExportButtons
          onExportXLSX={handleExportJSON}
          onExportPDF={() => {}}
        />
      </div>

      {/* Tabela */}
      <ReceitasTable
        receitas={receitas}
        loading={loading}
        onView={handleViewReceita}
        onEdit={handleEditReceita}
        onDelete={handleDeleteReceita}
        canView={true}
        canEdit={true}
        canDelete={true}
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

      {/* Modal de Receita */}
      <ReceitaModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        receita={selectedReceita}
        isViewMode={isViewMode}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Excluir Receita"
        message={`Tem certeza que deseja excluir a receita "${receitaToDelete?.nome}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Modal de Auditoria */}
      <AuditModal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        title="Relatório de Auditoria - Receitas"
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

export default Receitas;

