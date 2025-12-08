import React, { useState, useEffect } from 'react';
import { FaQuestionCircle } from 'react-icons/fa';
import { useProdutosComerciaisConsulta } from '../../hooks/useProdutosComerciaisConsulta';
import { ProdutosComerciaisStats, ProdutosComerciaisTable, ProdutoComercialModal } from '../../components/produtos-comerciais';
import { Button, Pagination, CadastroFilterBar } from '../../components/ui';
import { ExportButtons } from '../../components/shared';

/**
 * Página de consulta de Produtos Comerciais
 * Modo apenas leitura - dados consultados do sistema Foods
 */
const ProdutosComerciais = () => {
  // Estados locais para modal
  const [selectedProduto, setSelectedProduto] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  
  const {
    produtos,
    loading,
    error,
    connectionStatus,
    pagination,
    filters,
    stats,
    sortField,
    sortDirection,
    atualizarFiltros,
    atualizarPaginacao,
    limparFiltros,
    recarregar,
    handleSort,
    getGrupoName,
    getSubgrupoName,
    getClasseName,
    getUnidadeMedidaName,
    getUnidadeMedidaSigla
  } = useProdutosComerciaisConsulta();

  // Verificar se não está conectado
  const isConnected = connectionStatus?.connected !== false;
  const hasError = error !== null;

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
          <p className="text-gray-600">Carregando produtos comerciais...</p>
          {!isConnected && (
            <p className="text-orange-600 text-sm mt-2">
              Verificando conexão com o sistema Foods
            </p>
          )}
        </div>
      </div>
    );
  }

  if (hasError && !isConnected) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center max-w-md">
          <FaQuestionCircle className="text-red-500 text-4xl mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Erro de Conexão</h2>
          <p className="text-gray-600 mb-4">
            Não foi possível conectar ao sistema Foods. Verifique sua conexão e tente novamente.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {connectionStatus?.message || 'Erro desconhecido'}
          </p>
          <Button onClick={recarregar} variant="primary">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Produtos Comerciais</h1>
        <div className="flex gap-2 sm:gap-3">
          <Button
            onClick={recarregar}
            variant="ghost"
            size="sm"
            className="text-xs"
            disabled={loading}
          >
            <FaQuestionCircle className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
        </div>
      </div>
      
      {/* Estatísticas */}
      <ProdutosComerciaisStats stats={stats} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onKeyPress={handleKeyPress}
        statusFilter={filters.status}
        onStatusFilterChange={(value) => atualizarFiltros({ status: value })}
        onClear={limparFiltros}
        placeholder="Buscar por nome comercial ou código..."
      />

      {/* Botões de Exportação */}
      <div className="mb-4">
        <ExportButtons
          onExportXLSX={handleExportXLSX}
          onExportPDF={handleExportPDF}
        />
      </div>

      {/* Tabela */}
      <ProdutosComerciaisTable
        produtosComerciais={produtos}
        onView={handleViewProduto}
        canView={true}
        canEdit={false}
        canDelete={false}
        getGrupoName={getGrupoName}
        getSubgrupoName={getSubgrupoName}
        getClasseName={getClasseName}
        getUnidadeMedidaName={getUnidadeMedidaName}
        getUnidadeMedidaSigla={getUnidadeMedidaSigla}
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

      {/* Modal de Visualização */}
      <ProdutoComercialModal
        isOpen={showViewModal}
        onClose={handleCloseViewModal}
        produtoComercial={selectedProduto}
        isViewMode={true}
        onSubmit={() => {}} // Não usado no modo visualização
        grupos={[]} // Para cozinha_industrial, não temos grupos carregados
        subgrupos={[]} // Para cozinha_industrial, não temos subgrupos carregados
        classes={[]} // Para cozinha_industrial, não temos classes carregadas
        unidadesMedida={[]} // Para cozinha_industrial, não temos unidades carregadas
        loading={false}
      />
    </div>
  );
};

export default ProdutosComerciais;

