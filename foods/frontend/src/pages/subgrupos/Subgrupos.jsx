import React from 'react';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useSubgrupos } from '../../hooks/useSubgrupos';
import { 
  SubgruposStats, 
  SubgruposActions, 
  SubgruposTable, 
  SubgrupoModal 
} from '../../components/subgrupos';
import CadastroFilterBar from '../../components/CadastroFilterBar';
import Pagination from '../../components/Pagination';

const Subgrupos = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  const {
    // Estados
    subgrupos,
    grupos,
    loading,
    showModal,
    viewMode,
    editingSubgrupo,
    searchTerm,
    statusFilter,
    grupoFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,

    // Funções CRUD
    onSubmit,
    handleDeleteSubgrupo,

    // Funções de modal
    handleAddSubgrupo,
    handleViewSubgrupo,
    handleEditSubgrupo,
    handleCloseModal,

    // Funções de paginação
    handlePageChange,

    // Funções de filtros
    setSearchTerm,
    setStatusFilter,
    setGrupoFilter,
    setItemsPerPage,
    handleClearFilters,

    // Funções utilitárias
    formatDate,
    getStatusLabel,
    getGrupoNome
  } = useSubgrupos();

  // Funções de exportação (placeholder)
  const handleExportExcel = () => {
    console.log('Exportar para Excel');
  };

  const handleExportPdf = () => {
    console.log('Exportar para PDF');
  };

  return (
    <div className="space-y-6">
      {/* Título da página */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Subgrupos</h1>
      </div>

      {/* Estatísticas */}
      <SubgruposStats estatisticas={estatisticas} />

      {/* Ações */}
      <SubgruposActions
        canCreate={canCreate}
        onAdd={handleAddSubgrupo}
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        loading={loading}
      />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onClearFilters={handleClearFilters}
        additionalFilters={[
          {
            label: 'Grupo',
            value: grupoFilter,
            onChange: setGrupoFilter,
            options: [
              { value: 'todos', label: 'Todos os Grupos' },
              ...grupos.map(grupo => ({
                value: grupo.id.toString(),
                label: grupo.nome
              }))
            ]
          }
        ]}
      />

      {/* Tabela */}
      <SubgruposTable
        subgrupos={subgrupos}
        canView={canView}
        canEdit={canEdit}
        canDelete={canDelete}
        onView={handleViewSubgrupo}
        onEdit={handleEditSubgrupo}
        onDelete={handleDeleteSubgrupo}
        getStatusLabel={getStatusLabel}
        getGrupoNome={getGrupoNome}
        formatDate={formatDate}
      />

      {/* Paginação */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}

      {/* Modal */}
      <SubgrupoModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={onSubmit}
        subgrupo={editingSubgrupo}
        isViewMode={viewMode}
        grupos={grupos}
      />
    </div>
  );
};

export default Subgrupos;
