import React, { useState } from 'react';
import { FaQuestionCircle } from 'react-icons/fa';
import { useProdutosOrigemConsulta } from '../../hooks/useProdutosOrigemConsulta';
import ProdutosOrigemStats from '../../components/produtos-origem/ProdutosOrigemStats';
import ProdutosOrigemTable from '../../components/produtos-origem/ProdutosOrigemTable';
import ProdutoOrigemModal from '../../components/produtos-origem/ProdutoOrigemModal';
import { Pagination, Button, CadastroFilterBar } from '../../components/ui';
import { ExportButtons } from '../../components/shared';

/**
 * Página de consulta de Produtos Origem
 * Modo apenas leitura - dados consultados do sistema Foods
 */
const ProdutosOrigem = () => {
  // Estados locais para modal
  const [selectedProduto, setSelectedProduto] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  
  const {
    produtos,
    loading,
    error,
    pagination,
    filters,
    stats,
    atualizarFiltros,
    atualizarPaginacao,
    limparFiltros,
    getGrupoName,
    getSubgrupoName,
    getClasseName,
    getUnidadeMedidaName,
    getUnidadeMedidaSigla
  } = useProdutosOrigemConsulta();

  // Debug logs removidos

  /**
   * Handlers de eventos
   */
  const handlePageChange = (page) => {
    atualizarPaginacao({ currentPage: page });
  };

  const handleItemsPerPageChange = (itemsPerPage) => {
    atualizarPaginacao({ itemsPerPage, currentPage: 1 });
  };

  const handleExportXLSX = () => {
    // TODO: Implementar exportação XLSX dos dados consultados
    console.log('Exportar XLSX');
  };

  const handleExportPDF = () => {
    // TODO: Implementar exportação PDF dos dados consultados
    console.log('Exportar PDF');
  };

  const handleViewProduto = (produto) => {
    setSelectedProduto(produto);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setSelectedProduto(null);
    setShowViewModal(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando produtos origem...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
        {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Produtos Origem</h1>
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
      <ProdutosOrigemStats stats={stats} />

        {/* Filtros */}
      <CadastroFilterBar
        searchTerm={filters.search}
        onSearchChange={(value) => atualizarFiltros({ search: value })}
        statusFilter={filters.status}
        onStatusFilterChange={(value) => atualizarFiltros({ status: value })}
        onClear={limparFiltros}
        placeholder="Buscar por nome, código ou referência..."
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
      
      <ProdutosOrigemTable
        produtosOrigem={produtos}
        onView={handleViewProduto}
        onEdit={() => {}}
        onDelete={() => {}}
        canView={true}
        canEdit={false}
        canDelete={false}
        getGrupoName={getGrupoName}
        getSubgrupoName={getSubgrupoName}
        getClasseName={getClasseName}
        getUnidadeMedidaName={getUnidadeMedidaName}
        getUnidadeMedidaSigla={getUnidadeMedidaSigla}
        getProdutoGenericoPadraoName={() => 'N/A'}
      />

        {/* Paginação */}
      {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
              itemsPerPage={pagination.itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
          totalItems={pagination.totalItems}
            />
        )}

        {/* Modal de Visualização */}
      <ProdutoOrigemModal
        isOpen={showViewModal}
        onClose={handleCloseViewModal}
        produtoOrigem={selectedProduto}
        isViewMode={true}
        onSubmit={() => {}} // Não usado no modo visualização
        grupos={[]} // Para implantacao, não temos grupos carregados
        subgrupos={[]} // Para implantacao, não temos subgrupos carregados
        classes={[]} // Para implantacao, não temos classes carregadas
        unidadesMedida={[]} // Para implantacao, não temos unidades carregadas
        loading={false}
      />
    </div>
  );
};

export default ProdutosOrigem;