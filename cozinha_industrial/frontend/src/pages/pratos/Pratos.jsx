import React, { useState, useEffect } from 'react';
import { FaPlus, FaQuestionCircle, FaUpload } from 'react-icons/fa';
import { usePratos } from '../../hooks/usePratos';
import { PratosStats, PratosTable, PratoModal } from '../../components/pratos';
import { Button, Pagination, CadastroFilterBar } from '../../components/ui';
import { ExportButtons, AuditModal } from '../../components/shared';
import { ConfirmModal } from '../../components/ui';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useAuditoria } from '../../hooks/common/useAuditoria';
import pratosService from '../../services/pratos';
import toast from 'react-hot-toast';
import ImportPratosModal from '../../components/pratos/ImportPratosModal';

/**
 * Página de Cadastro de Pratos
 */
const Pratos = () => {
  const {
    pratos,
    loading,
    pagination,
    filters,
    sortField,
    sortDirection,
    carregarPratos,
    criarPrato,
    atualizarPrato,
    excluirPrato,
    exportarJson,
    handleSort,
    handlePageChange,
    handleSearchChange,
    clearFilters
  } = usePratos();

  const { canView, canCreate, canEdit, canDelete } = usePermissions();
  
  // Permissões específicas para pratos
  const canViewPratos = canView('pratos');
  const canCreatePratos = canCreate('pratos');
  const canEditPratos = canEdit('pratos');
  const canDeletePratos = canDelete('pratos');

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
  } = useAuditoria('pratos');

  // Estados para modais
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedPrato, setSelectedPrato] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [pratoToDelete, setPratoToDelete] = useState(null);

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
  };

  // Handlers de modal
  const handleAddPrato = () => {
    setSelectedPrato(null);
    setIsViewMode(false);
    setShowModal(true);
  };

  const handleImportClick = () => {
    setShowImportModal(true);
  };

  const handleImportSuccess = () => {
    toast.success('Importação de pratos concluída!');
    carregarPratos();
    setShowImportModal(false);
  };

  const handleCloseImportModal = () => {
    setShowImportModal(false);
  };

  const handleViewPrato = async (prato) => {
    try {
      const response = await pratosService.buscarPorId(prato.id);
      if (response.success) {
        setSelectedPrato(response.data);
        setIsViewMode(true);
        setShowModal(true);
      }
    } catch (err) {
      console.error('Erro ao carregar prato:', err);
      toast.error('Erro ao carregar prato');
    }
  };

  const handleEditPrato = async (prato) => {
    try {
      const response = await pratosService.buscarPorId(prato.id);
      if (response.success) {
        setSelectedPrato(response.data);
        setIsViewMode(false);
        setShowModal(true);
      }
    } catch (err) {
      console.error('Erro ao carregar prato:', err);
      toast.error('Erro ao carregar prato');
    }
  };

  const handleDeletePrato = (prato) => {
    setPratoToDelete(prato);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPrato(null);
    setIsViewMode(false);
  };

  const handleSubmitModal = async (formData) => {
    try {
      let result;
      if (selectedPrato) {
        result = await atualizarPrato(selectedPrato.id, formData);
      } else {
        result = await criarPrato(formData);
      }

      if (result.success) {
        handleCloseModal();
      }
    } catch (error) {
      console.error('Erro ao salvar prato:', error);
      toast.error('Erro ao salvar prato');
    }
  };

  const handleConfirmDelete = async () => {
    if (!pratoToDelete) return;

    try {
      const result = await excluirPrato(pratoToDelete.id);
      if (result.success) {
        setShowDeleteModal(false);
        setPratoToDelete(null);
      }
    } catch (error) {
      console.error('Erro ao excluir prato:', error);
      toast.error('Erro ao excluir prato');
    }
  };

  const handleClearFilters = () => {
    clearFilters();
    setSearchTerm('');
    handlePageChange(1);
  };

  const handleExportXLSX = async () => {
    try {
      const result = await pratosService.exportarXLSX({ search: filters.search || '' });
      if (result.success) {
        toast.success('Exportação XLSX realizada com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao exportar XLSX');
      }
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      toast.error('Erro ao exportar pratos em XLSX');
    }
  };

  const handleExportPDF = async () => {
    try {
      const result = await pratosService.exportarPDF({ search: filters.search || '' });
      if (result.success) {
        toast.success('Exportação PDF realizada com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao exportar PDF');
      }
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar pratos em PDF');
    }
  };

  if (!canViewPratos) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Você não tem permissão para visualizar esta tela.</p>
        </div>
      </div>
    );
  }

  if (loading && pratos.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando pratos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Pratos</h1>
        <div className="flex gap-2 sm:gap-3">
          {canCreatePratos && (
            <>
              <Button
                onClick={handleImportClick}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                <FaUpload className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Importar</span>
                <span className="sm:hidden">Importar</span>
              </Button>
              <Button
                onClick={handleAddPrato}
                variant="primary"
                size="sm"
                className="text-xs"
              >
                <FaPlus className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Novo Prato</span>
                <span className="sm:hidden">Novo</span>
              </Button>
            </>
          )}
          {canViewPratos && (
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
      <PratosStats pratos={pratos} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={handleLocalSearchChange}
        onKeyPress={handleKeyPress}
        onClear={handleClearFilters}
        placeholder="Buscar por código, nome ou descrição..."
      />

      {/* Botões de Exportação */}
      <div className="mb-4">
        <ExportButtons
          onExportJSON={exportarJson}
          onExportXLSX={handleExportXLSX}
          onExportPDF={handleExportPDF}
        />
      </div>

      {/* Tabela */}
      <PratosTable
        pratos={pratos}
        loading={loading}
        canView={canViewPratos}
        canEdit={canEditPratos}
        canDelete={canDeletePratos}
        onView={handleViewPrato}
        onEdit={handleEditPrato}
        onDelete={handleDeletePrato}
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

      {/* Modal de Prato */}
      <PratoModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmitModal}
        prato={selectedPrato}
        isViewMode={isViewMode}
      />

      {/* Modal de confirmação de exclusão */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setPratoToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir Prato"
        message={`Tem certeza que deseja excluir o prato "${pratoToDelete?.nome}"? Esta ação não pode ser desfeita.`}
        type="danger"
      />

      {/* Modal de Auditoria */}
      <AuditModal
        isOpen={showAuditModal}
        onClose={handleCloseAuditModal}
        title="Relatório de Auditoria - Pratos"
        auditLogs={auditLogs}
        auditLoading={auditLoading}
        auditFilters={auditFilters}
        onApplyFilters={handleApplyAuditFilters}
        onExportXLSX={handleExportAuditXLSX}
        onExportPDF={handleExportAuditPDF}
        onFilterChange={(field, value) => setAuditFilters(prev => ({ ...prev, [field]: value }))}
      />

      {/* Modal de Importação de Pratos */}
      <ImportPratosModal
        isOpen={showImportModal}
        onClose={handleCloseImportModal}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
};

export default Pratos;

