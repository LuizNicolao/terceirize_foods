import React, { useState, useEffect } from 'react';
import { useCentrosCustoConsulta } from '../../hooks/useCentrosCustoConsulta';
import { CentrosCustoStats, CentrosCustoTable, CentroCustoModal } from '../../components/centros-custo';
import { Button, Pagination, CadastroFilterBar } from '../../components/ui';
import { ExportButtons } from '../../components/shared';

/**
 * Página de consulta de Centros de Custo
 * Modo apenas leitura - dados consultados do sistema Foods
 */
const CentrosCusto = () => {
  // Estados locais para modal
  const [selectedCentroCusto, setSelectedCentroCusto] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  
  const {
    centrosCusto,
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
    getStatusLabel,
    formatDate
  } = useCentrosCustoConsulta();

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

  const handleViewCentroCusto = (centroCusto) => {
    setSelectedCentroCusto(centroCusto);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setSelectedCentroCusto(null);
    setShowViewModal(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando centros de custo...</p>
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
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Erro de Conexão</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={recarregar} variant="primary">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Centros de Custo</h1>
      </div>

      {/* Estatísticas */}
      <CentrosCustoStats estatisticas={stats} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onKeyPress={handleKeyPress}
        statusFilter={filters.status}
        onStatusFilterChange={(status) => atualizarFiltros({ status })}
        onClear={limparFiltros}
        placeholder="Buscar por nome, código ou filial..."
      />

      {/* Ações de Exportação */}
      <div className="mb-4">
        <ExportButtons
          onExportXLSX={handleExportXLSX}
          onExportPDF={handleExportPDF}
          disabled={hasError}
        />
      </div>

      {/* Tabela */}
      <CentrosCustoTable
        centrosCusto={centrosCusto}
        canView={true}
        canEdit={false}
        canDelete={false}
        onView={handleViewCentroCusto}
        getStatusLabel={getStatusLabel}
        formatDate={formatDate}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Modal de Visualização */}
      {showViewModal && selectedCentroCusto && (
        <CentroCustoModal
          isOpen={showViewModal}
          onClose={handleCloseViewModal}
          centroCusto={selectedCentroCusto}
          isViewMode={true}
        />
      )}

      {/* Paginação */}
      <Pagination
        currentPage={pagination.currentPage || 1}
        totalPages={pagination.totalPages || 1}
        onPageChange={handlePageChange}
        totalItems={pagination.totalItems || 0}
        itemsPerPage={pagination.itemsPerPage || 20}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
};

export default CentrosCusto;

