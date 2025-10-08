import React, { useState } from 'react';
import { FaQuestionCircle } from 'react-icons/fa';
import useUnidadesMedidaConsulta from '../../hooks/useUnidadesMedidaConsulta';
import { UnidadesMedidaStats, UnidadesMedidaTable, UnidadeModal } from '../../components/unidades-medida';
import { ConsultaActions } from '../../components/shared';
import { Button, CadastroFilterBar, Pagination } from '../../components/ui';

/**
 * Página de consulta de Unidades de Medida
 * Modo apenas leitura - dados consultados do sistema Foods
 */
const UnidadesMedida = () => {
  // Estados locais para modal
  const [selectedUnidadeMedida, setSelectedUnidadeMedida] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  
  const {
    unidadesMedida,
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
    isEmpty
  } = useUnidadesMedidaConsulta();

  const handleSearch = (searchTerm) => {
    atualizarFiltros({ search: searchTerm });
  };

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

  const handleViewUnidadeMedida = (unidadeMedida) => {
    setSelectedUnidadeMedida(unidadeMedida);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setSelectedUnidadeMedida(null);
    setShowViewModal(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando unidades de medida...</p>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Erro de Conexão
          </h2>
          <p className="text-gray-600 mb-4">
            Não foi possível conectar ao sistema Foods. Verifique sua conexão e tente novamente.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            {error || 'Erro desconhecido'}
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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Unidades de Medida</h1>
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
      <UnidadesMedidaStats stats={stats} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={filters.search}
        onSearchChange={handleSearch}
        placeholder="Buscar por nome, sigla ou descrição..."
      />

      {/* Ações */}
      <ConsultaActions
        onExportXLSX={handleExportXLSX}
        onExportPDF={handleExportPDF}
        totalItems={pagination.totalItems}
        loading={loading}
        showTotal={false}
      />

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <UnidadesMedidaTable
          unidadesMedida={unidadesMedida}
          loading={loading}
          onView={handleViewUnidadeMedida}
          canView={true}
          mode="consulta"
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
      <UnidadeModal
        isOpen={showViewModal}
        onClose={handleCloseViewModal}
        unidade={selectedUnidadeMedida}
        isViewMode={true}
        onSubmit={() => {}}
      />
    </div>
  );
};

export default UnidadesMedida;
