import React, { useState, useEffect } from 'react';
import { FaQuestionCircle } from 'react-icons/fa';
import useClassesConsulta from '../../hooks/useClassesConsulta';
import { ClassesStats, ClassesTable, ClasseModal } from '../../components/classes';
import { ExportButtons } from '../../components/shared';
import { Button, Pagination } from '../../components/ui';
import { CadastroFilterBar } from '../../components/ui';

/**
 * Página de consulta de Classes
 * Modo apenas leitura - dados consultados do sistema Foods
 */
const Classes = () => {
  const {
    classes,
    subgrupos,
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
    isConnected,
    hasError,
    getSubgrupoNome
  } = useClassesConsulta();

  // Estados para modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedClasse, setSelectedClasse] = useState(null);

  // Estado local para o termo de busca (não aplica filtro imediatamente)
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

  const handleExportXLSX = () => {};

  const handleExportPDF = () => {};

  const handleViewClasse = (classe) => {
    setSelectedClasse(classe);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedClasse(null);
  };

  const handlePageChange = (page) => {
    atualizarPaginacao({ currentPage: page });
  };

  const handleItemsPerPageChange = (itemsPerPage) => {
    atualizarPaginacao({ itemsPerPage, currentPage: 1 });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando classes...</p>
        </div>
      </div>
    );
  }

  if (hasError && !isConnected) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaQuestionCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro de Conexão</h2>
          <p className="text-gray-600 mb-4">{error || 'Erro desconhecido'}</p>
          <Button onClick={recarregar} variant="primary">Tentar Novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Classes</h1>
        <div className="flex gap-2 sm:gap-3">
          <Button
            onClick={() => window.location.reload()}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            <FaQuestionCircle className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <ClassesStats stats={stats} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onKeyPress={handleKeyPress}
        placeholder="Buscar por nome, código ou descrição..."
      />

      {/* Ações */}
      {/* Botões de Exportação */}
      <div className="mb-4">
        <ExportButtons
          onExportXLSX={handleExportXLSX}
          onExportPDF={handleExportPDF}
        />
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <ClassesTable
          classes={classes}
          loading={loading}
          onView={handleViewClasse}
          onEdit={() => {}}
          onDelete={() => {}}
          canView={true}
          canEdit={false}
          canDelete={false}
          getStatusLabel={(status) => {
            if (status === 'ativo' || status === 1) return 'Ativo';
            return 'Inativo';
          }}
          getSubgrupoNome={getSubgrupoNome}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      </div>

      {/* Paginação */}
          <Pagination
        currentPage={pagination.currentPage || 1}
        totalPages={pagination.totalPages || 1}
            onPageChange={handlePageChange}
        itemsPerPage={pagination.itemsPerPage || 20}
            onItemsPerPageChange={handleItemsPerPageChange}
        totalItems={pagination.totalItems || 0}
          />

      {/* Modal de Visualização */}
      <ClasseModal
        isOpen={showViewModal}
        onClose={handleCloseViewModal}
        classe={selectedClasse}
        isViewMode={true}
        subgrupos={subgrupos}
        onSubmit={() => {}}
      />
    </div>
  );
};

export default Classes;
