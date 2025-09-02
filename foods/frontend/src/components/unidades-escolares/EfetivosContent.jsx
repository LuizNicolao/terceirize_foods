import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useEfetivos } from '../../hooks/useEfetivos';
import { Button } from '../ui';
import { CadastroFilterBar } from '../ui';
import { Pagination } from '../ui';
import { EfetivosTable, EfetivoModal } from '../efetivos';
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
        {!viewMode && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddEfetivo}
          >
            <FaPlus className="mr-1" />
            Adicionar Efetivo
          </Button>
        )}
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

      {/* Tabela */}
      <EfetivosTable
        efetivos={efetivos}
        canView={canView}
        canEdit={canEdit}
        canDelete={canDelete}
        onView={handleViewEfetivo}
        onEdit={handleEditEfetivo}
        onDelete={handleDeleteEfetivo}
        formatDate={formatDate}
        viewMode={viewMode}
      />

      {/* Modal de Efetivo */}
      <EfetivoModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={onSubmit}
        efetivo={editingEfetivo}
        isViewMode={efetivoViewMode}
        unidadeEscolarId={unidadeEscolarId}
      />

      {/* Modal de Erros de Validação */}
      <ValidationErrorModal
        isOpen={showValidationModal}
        onClose={handleCloseValidationModal}
        errors={validationErrors?.errors}
        errorCategories={validationErrors?.errorCategories}
      />

      {/* Modal de Confirmação para Excluir */}
      <ConfirmModal
        isOpen={showConfirmDeleteModal}
        onClose={() => setShowConfirmDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Excluir Efetivo"
        message="Tem certeza que deseja excluir este efetivo? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
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
