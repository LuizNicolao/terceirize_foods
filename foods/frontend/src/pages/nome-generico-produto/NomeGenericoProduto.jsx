import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useNomeGenericoProduto } from '../../hooks/useNomeGenericoProduto';
import { useAuditoria } from '../../hooks/useAuditoria';
import { useExport } from '../../hooks/useExport';
import { Button } from '../../components/ui';
import {
  NomeGenericoProdutoStats,
  NomeGenericoProdutoActions,
  NomeGenericoProdutoTable,
  NomeGenericoProdutoModal
} from '../../components/nome-generico-produto';
import CadastroFilterBar from '../../components/CadastroFilterBar';
import Pagination from '../../components/Pagination';

const NomeGenericoProduto = () => {
  const { canCreate, canEdit, canDelete, canView } = usePermissions();
  
  const {
    // Estados
    nomesGenericos,
    grupos,
    subgrupos,
    classes,
    loading,
    loadingGrupos,
    loadingSubgrupos,
    loadingClasses,
    showModal,
    viewMode,
    editingNomeGenerico,
    searchTerm,
    statusFilter,
    grupoFilter,
    subgrupoFilter,
    classeFilter,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    estatisticas,

    // Funções CRUD
    onSubmit,
    handleDeleteNomeGenerico,

    // Funções de modal
    handleAddNomeGenerico,
    handleViewNomeGenerico,
    handleEditNomeGenerico,
    handleCloseModal,

    // Funções de paginação
    handlePageChange,

    // Funções de filtros
    setSearchTerm,
    setStatusFilter,
    setGrupoFilter,
    setSubgrupoFilter,
    setClasseFilter,
    handleClearFilters,

    // Funções de carregamento
    loadSubgrupos,
    loadClasses,

    // Funções utilitárias
    formatDate,
    getStatusLabel,
    getGrupoNome,
    getSubgrupoNome,
    getClasseNome
  } = useNomeGenericoProduto();

  // Hooks de auditoria e exportação
  const { showAuditModal, setShowAuditModal, auditLogs, auditLoading, loadAuditLogs } = useAuditoria();
  const { exportToXLSX, exportToPDF } = useExport();

  // Funções de exportação
     const handleExportXLSX = () => {
     const data = nomesGenericos.map(nomeGenerico => ({
       ID: nomeGenerico.id,
       Nome: nomeGenerico.nome,
       Grupo: getGrupoNome(nomeGenerico.grupo_id),
       Subgrupo: getSubgrupoNome(nomeGenerico.subgrupo_id),
       Classe: getClasseNome(nomeGenerico.classe_id),
       Status: getStatusLabel(nomeGenerico.status),
       'Criado em': formatDate(nomeGenerico.created_at)
     }));

    exportToXLSX(data, 'nomes-genericos-produto');
  };

     const handleExportPDF = () => {
     const data = nomesGenericos.map(nomeGenerico => ({
       ID: nomeGenerico.id,
       Nome: nomeGenerico.nome,
       Grupo: getGrupoNome(nomeGenerico.grupo_id),
       Subgrupo: getSubgrupoNome(nomeGenerico.subgrupo_id),
       Classe: getClasseNome(nomeGenerico.classe_id),
       Status: getStatusLabel(nomeGenerico.status),
       'Criado em': formatDate(nomeGenerico.created_at)
     }));

    exportToPDF(data, 'Nomes Genéricos de Produto', 'nomes-genericos-produto');
  };

  return (
    <div className="p-3 sm:p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Nomes Genéricos de Produto
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Gerencie os nomes genéricos dos produtos do sistema
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {canCreate('nome_generico_produto') && (
            <Button onClick={handleAddNomeGenerico} className="w-full sm:w-auto">
              <FaPlus className="mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Novo Nome Genérico</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <NomeGenericoProdutoStats estatisticas={estatisticas} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onClearFilters={handleClearFilters}
        showStatusFilter={true}
        showSearchFilter={true}
        searchPlaceholder="Buscar por nome..."
      />

      {/* Filtros específicos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filtrar por Grupo
          </label>
          <select
            value={grupoFilter}
            onChange={(e) => setGrupoFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="todos">Todos os grupos</option>
            {grupos.map((grupo) => (
              <option key={grupo.id} value={grupo.id}>
                {grupo.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filtrar por Subgrupo
          </label>
          <select
            value={subgrupoFilter}
            onChange={(e) => setSubgrupoFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="todos">Todos os subgrupos</option>
            {subgrupos.map((subgrupo) => (
              <option key={subgrupo.id} value={subgrupo.id}>
                {subgrupo.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filtrar por Classe
          </label>
          <select
            value={classeFilter}
            onChange={(e) => setClasseFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="todos">Todas as classes</option>
            {classes.map((classe) => (
              <option key={classe.id} value={classe.id}>
                {classe.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ações de exportação */}
      <NomeGenericoProdutoActions
        onExportXLSX={handleExportXLSX}
        onExportPDF={handleExportPDF}
      />

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow-sm">
        <NomeGenericoProdutoTable
          nomesGenericos={nomesGenericos}
          canView={canView}
          canEdit={canEdit}
          canDelete={canDelete}
          onView={handleViewNomeGenerico}
          onEdit={handleEditNomeGenerico}
          onDelete={handleDeleteNomeGenerico}
          getStatusLabel={getStatusLabel}
          getGrupoNome={getGrupoNome}
          getSubgrupoNome={getSubgrupoNome}
          getClasseNome={getClasseNome}
          formatDate={formatDate}
        />
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
        />
      )}

      {/* Modal */}
      <NomeGenericoProdutoModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={onSubmit}
        editingNomeGenerico={editingNomeGenerico}
        viewMode={viewMode}
        grupos={grupos}
        subgrupos={subgrupos}
        classes={classes}
        loadingGrupos={loadingGrupos}
        loadingSubgrupos={loadingSubgrupos}
        loadingClasses={loadingClasses}
        loadSubgrupos={loadSubgrupos}
        loadClasses={loadClasses}
      />
    </div>
  );
};

export default NomeGenericoProduto;
