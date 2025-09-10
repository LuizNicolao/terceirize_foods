import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useEfetivos } from '../../hooks/useEfetivos';
import { Button } from '../ui';
import { CadastroFilterBar } from '../ui';
import { Pagination } from '../ui';
import { EfetivosGroupedTable, EfetivoModal } from '../efetivos';
import { ConfirmModal } from '../ui';
import ValidationErrorModal from '../ui/ValidationErrorModal';

const EfetivosContent = ({ 
  unidadeEscolarId, 
  viewMode = false 
}) => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  // Hook de efetivos
  const {
    efetivos,
    loading,
    showModal,
    viewMode: efetivoViewMode,
    editingEfetivo,
    searchTerm,
    statusFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    validationErrors,
    showValidationModal,
    showConfirmDeleteModal,
    handleCloseValidationModal,
    onSubmit,
    handleDeleteEfetivo,
    handleConfirmDelete,
    handleAddEfetivo,
    handleViewEfetivo,
    handleEditEfetivo,
    handleCloseModal,
    setShowConfirmDeleteModal,
    handlePageChange,
    handleItemsPerPageChange,
    setSearchTerm,
    setStatusFilter,
    formatDate
  } = useEfetivos(unidadeEscolarId);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Carregando efetivos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Efetivos da Unidade Escolar</h3>
        <div className="text-sm text-gray-500 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
          <span className="font-medium">ℹ️ Modo Visualização:</span> Os efetivos são cadastrados nos períodos de refeição
        </div>
      </div>

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        placeholder="Buscar por tipo ou intolerância..."
        statusOptions={[
          { value: 'todos', label: 'Todos' },
          { value: 'PADRAO', label: 'Padrão' },
          { value: 'NAE', label: 'NAE' }
        ]}
      />

      {/* Tabela Agrupada por Período */}
      <EfetivosGroupedTable
        efetivos={efetivos}
        canView={canView}
        onView={handleViewEfetivo}
        formatDate={formatDate}
        viewMode={true}
      />

      {/* Modal de Efetivo - Apenas Visualização */}
      <EfetivoModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={null}
        efetivo={editingEfetivo}
        isViewMode={true}
        unidadeEscolarId={unidadeEscolarId}
      />

      {/* Paginação */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}
    </div>
  );
};

export default EfetivosContent;
