import React, { useState } from 'react';
import { FaQuestionCircle } from 'react-icons/fa';
import useSubgruposConsulta from '../../hooks/useSubgruposConsulta';
import { SubgruposStats, SubgruposTable, SubgrupoModal } from '../../components/subgrupos';
import { ExportButtons } from '../../components/shared';
import { Button, Pagination } from '../../components/ui';
import { CadastroFilterBar } from '../../components/ui';

/**
 * Página de consulta de Subgrupos
 * Modo apenas leitura - dados consultados do sistema Foods
 */
const Subgrupos = () => {
  const {
    subgrupos,
    grupos,
    loading,
    error,
    stats,
    pagination,
    filters,
    atualizarFiltros,
    atualizarPaginacao,
    limparFiltros,
    recarregar,
    isConnected,
    hasError,
    getGrupoNome
  } = useSubgruposConsulta();

  // Estados para modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSubgrupo, setSelectedSubgrupo] = useState(null);

  const handleSearch = (searchTerm) => {
    atualizarFiltros({ search: searchTerm });
  };

  const handleExportXLSX = () => {
    console.log('Exportar XLSX');
  };

  const handleExportPDF = () => {
    console.log('Exportar PDF');
  };

  const handleViewSubgrupo = (subgrupo) => {
    setSelectedSubgrupo(subgrupo);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedSubgrupo(null);
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
          <p className="text-gray-600">Carregando subgrupos...</p>
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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Subgrupos</h1>
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
      <SubgruposStats stats={stats} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={filters.search}
        onSearchChange={handleSearch}
        placeholder="Buscar por nome..."
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
        <SubgruposTable
          subgrupos={subgrupos}
          loading={loading}
          onView={handleViewSubgrupo}
          onEdit={() => {}}
          onDelete={() => {}}
          canView={true}
          canEdit={false}
          canDelete={false}
          getStatusLabel={(status) => {
            if (status === 'ativo' || status === 1) return 'Ativo';
            return 'Inativo';
          }}
          getGrupoNome={getGrupoNome}
        />
      </div>

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={pagination.itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            totalItems={pagination.totalItems}
          />
        </div>
      )}

      {/* Modal de Visualização */}
      <SubgrupoModal
        isOpen={showViewModal}
        onClose={handleCloseViewModal}
        subgrupo={selectedSubgrupo}
        isViewMode={true}
        grupos={grupos}
        onSubmit={() => {}}
      />
    </div>
  );
};

export default Subgrupos;
