import React from 'react';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useTipoAtendimentoEscola } from '../../hooks/useTipoAtendimentoEscola';
import { ConfirmModal, Pagination } from '../../components/ui';
import {
  TipoAtendimentoEscolaHeader,
  TipoAtendimentoEscolaFilters,
  TipoAtendimentoEscolaTable,
  TipoAtendimentoEscolaModal
} from '../../components/tipo-atendimento-escola';

/**
 * Página principal de Tipo de Atendimento por Escola
 * Segue padrão de excelência do sistema
 */
const TipoAtendimentoEscola = () => {
  const { canCreate, canEdit, canDelete, canView, loading: permissionsLoading } = usePermissions();

  const {
    vinculos,
    escolas,
    loading,
    error,
    showModal,
    viewMode,
    editingItem,
    showDeleteConfirmModal,
    itemToDelete,
    searchTerm,
    escolaFilter,
    tipoAtendimentoFilter,
    ativoFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    tiposAtendimento,
    criar,
    atualizar,
    deletar,
    formatarTipoAtendimento,
    handleAdd,
    handleView,
    handleEdit,
    handleCloseModal,
    handleDelete,
    handleConfirmDelete,
    handleCloseDeleteModal,
    handlePageChange,
    handleItemsPerPageChange,
    setSearchTerm,
    setEscolaFilter,
    setTipoAtendimentoFilter,
    setAtivoFilter
  } = useTipoAtendimentoEscola();

  // Verificar permissões específicas
  const canViewVinculos = canView('tipo_atendimento_escola');
  const canCreateVinculos = canCreate('tipo_atendimento_escola');
  const canEditVinculos = canEdit('tipo_atendimento_escola');
  const canDeleteVinculos = canDelete('tipo_atendimento_escola');

  // Handler para salvar (criar ou atualizar)
  const handleSave = async (dados) => {
    if (editingItem) {
      return await atualizar(editingItem.id, dados);
    } else {
      return await criar(dados);
    }
  };

  // Handler para limpar filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setEscolaFilter('');
    setTipoAtendimentoFilter('');
    setAtivoFilter('todos');
  };

  if (permissionsLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando permissões...</p>
        </div>
      </div>
    );
  }

  if (!canViewVinculos) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Acesso Restrito
        </h2>
        <p className="text-gray-600">
          Você não tem permissão para visualizar tipo de atendimento por escola.
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <TipoAtendimentoEscolaHeader
        canCreate={canCreateVinculos}
        onAdd={handleAdd}
        loading={loading}
      />

      {/* Filtros */}
      <TipoAtendimentoEscolaFilters
        escolas={escolas}
        tiposAtendimento={tiposAtendimento}
        searchTerm={searchTerm}
        escolaFilter={escolaFilter}
        tipoAtendimentoFilter={tipoAtendimentoFilter}
        ativoFilter={ativoFilter}
        onSearchChange={setSearchTerm}
        onEscolaFilterChange={setEscolaFilter}
        onTipoAtendimentoFilterChange={setTipoAtendimentoFilter}
        onAtivoFilterChange={setAtivoFilter}
        onClearFilters={handleClearFilters}
        loading={loading}
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Tabela */}
      <TipoAtendimentoEscolaTable
        vinculos={vinculos}
        loading={loading}
        canView={canViewVinculos}
        canEdit={canEditVinculos}
        canDelete={canDeleteVinculos}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        formatarTipoAtendimento={formatarTipoAtendimento}
      />

      {/* Paginação */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}

      {/* Modal de Criação/Edição */}
      <TipoAtendimentoEscolaModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSave}
        tiposAtendimento={tiposAtendimento}
        editingItem={editingItem}
        viewMode={viewMode}
        loading={loading}
        buscarPorEscola={buscarPorEscola}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o vínculo entre "${itemToDelete?.nome_escola || ''}" e "${itemToDelete ? formatarTipoAtendimento(itemToDelete.tipo_atendimento) : ''}"?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default TipoAtendimentoEscola;

