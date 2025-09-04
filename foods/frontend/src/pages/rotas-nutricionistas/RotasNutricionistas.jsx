import React from 'react';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useRotasNutricionistas } from '../../hooks/useRotasNutricionistas';
import { useAuditoria } from '../../hooks/useAuditoria';
import { useExport } from '../../hooks/useExport';
import RotasNutricionistasService from '../../services/rotasNutricionistas';
import { Button, ValidationErrorModal } from '../../components/ui';
import { CadastroFilterBar } from '../../components/ui';
import { Pagination } from '../../components/ui';
import { RotasNutricionistasStats, RotasNutricionistasTable, RotasNutricionistasModal } from '../../components/rotas-nutricionistas';
import { AuditModal } from '../../components/shared';
import { ConfirmModal } from '../../components/ui';

const RotasNutricionistas = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  // Hook customizado de rotas nutricionistas
  const {
    rotas,
    loading,
    saving,
    selectedRota,
    showModal,
    modalMode,
    searchTerm,
    statusFilter,
    usuarioFilter,
    supervisorFilter,
    coordenadorFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    usuarios,
    supervisores,
    coordenadores,
    unidadesEscolares,
    estatisticas,
    showDeleteModal,
    rotaToDelete,
    handleSave,
    openCreateModal,
    openEditModal,
    openViewModal,
    closeModal,
    handlePageChange,
    handleLimitChange,
    handleSearch,
    handleStatusFilter,
    handleUsuarioFilter,
    handleSupervisorFilter,
    handleCoordenadorFilter,
    clearFilters,
    openDeleteModal,
    closeDeleteModal,
    handleDelete
  } = useRotasNutricionistas();

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
  } = useAuditoria('rotas_nutricionistas');

  const { handleExportXLSX, handleExportPDF } = useExport(RotasNutricionistasService);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando rotas nutricionistas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Rotas Nutricionistas</h1>
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
          {canCreate('rotas_nutricionistas') && (
            <Button onClick={openCreateModal} size="sm">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Nova Rota</span>
              <span className="sm:hidden">Nova Rota</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <RotasNutricionistasStats
        rotasNutricionistas={rotas}
        unidadesEscolares={unidadesEscolares}
      />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        onClear={() => clearFilters()}
        placeholder="Buscar por código, usuário, supervisor ou coordenador..."
      />

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
        <Button
          onClick={handleExportXLSX}
          variant="outline"
          size="sm"
          disabled={!canView('rotas_nutricionistas')}
        >
          Exportar XLSX
        </Button>
        <Button
          onClick={handleExportPDF}
          variant="outline"
          size="sm"
          disabled={!canView('rotas_nutricionistas')}
        >
          Exportar PDF
        </Button>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <RotasNutricionistasTable
          rotasNutricionistas={rotas}
          canView={canView('rotas_nutricionistas')}
          canEdit={canEdit('rotas_nutricionistas')}
          canDelete={canDelete('rotas_nutricionistas')}
          onView={openViewModal}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          getUsuarioName={(id) => {
            const usuario = usuarios.find(u => u.id === id);
            return usuario ? usuario.nome : 'N/A';
          }}
          getSupervisorName={(id) => {
            const supervisor = supervisores.find(s => s.id === id);
            return supervisor ? supervisor.nome : 'N/A';
          }}
          getCoordenadorName={(id) => {
            const coordenador = coordenadores.find(c => c.id === id);
            return coordenador ? coordenador.nome : 'N/A';
          }}
          loadingUsuarios={false}
        />
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onLimitChange={handleLimitChange}
          />
        </div>
      )}

      {/* Modal de Formulário */}
      <RotasNutricionistasModal
        isOpen={showModal}
        onClose={closeModal}
        rota={selectedRota}
        isViewMode={modalMode === 'view'}
        usuarios={usuarios}
        supervisores={supervisores}
        coordenadores={coordenadores}
        unidadesEscolares={unidadesEscolares}
        loadingUsuarios={false}
        onSubmit={handleSave}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir a rota nutricionista "${rotaToDelete?.codigo || rotaToDelete?.usuario_nome || 'N/A'}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        loading={saving}
      />
    </div>
  );
};

export default RotasNutricionistas;
