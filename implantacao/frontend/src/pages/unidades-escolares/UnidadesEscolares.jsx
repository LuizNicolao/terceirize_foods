import React, { useState } from 'react';
import { FaQuestionCircle, FaEye, FaExclamationTriangle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useUnidadesEscolaresConsulta } from '../../hooks/useUnidadesEscolaresConsulta';
import { Button } from '../../components/ui';
import { 
  UnidadesEscolaresTable, 
  UnidadesEscolaresStats,
  UnidadeEscolarModal
} from 'foods-frontend/src/components/unidades-escolares';
import { CadastroFilterBar } from '../../components/ui';
import { Pagination } from '../../components/ui';
import { Modal } from '../../components/ui';
import { ConsultaActions } from '../../components/shared';

const UnidadesEscolares = () => {
  const { canView } = usePermissions();
  
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUnidadeEscolar, setSelectedUnidadeEscolar] = useState(null);
  
  const {
    unidadesEscolares,
    stats,
    connectionStatus,
    loading,
    error,
    pagination,
    filters,
    carregarUnidadesEscolares,
    buscarUnidadeEscolarPorId,
    atualizarFiltros,
    atualizarPaginacao,
    recarregar,
    isConnected,
    hasError,
    isEmpty
  } = useUnidadesEscolaresConsulta();

  const handleView = async (unidadeEscolar) => {
    try {
      const unidadeCompleta = await buscarUnidadeEscolarPorId(unidadeEscolar.id);
      setSelectedUnidadeEscolar(unidadeCompleta);
      setShowViewModal(true);
    } catch (err) {
      console.error('Erro ao carregar unidade escolar:', err);
    }
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedUnidadeEscolar(null);
  };

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
    console.log('Exportar XLSX das unidades escolares consultadas');
  };

  const handleExportPDF = () => {
    console.log('Exportar PDF das unidades escolares consultadas');
  };

  // Estados de loading e erro
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Consultando unidades escolares do sistema Foods...</p>
          {!isConnected && (
            <p className="text-orange-600 text-sm mt-2">
              <FaExclamationTriangle className="inline mr-1" />
              Verificando conexão com o sistema Foods
            </p>
          )}
        </div>
      </div>
    );
  }

  // Estado de erro de conexão
  if (hasError && !isConnected) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center max-w-md">
          <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Unidades Escolares</h1>
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
      <UnidadesEscolaresStats estatisticas={stats} />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={filters.search}
        onSearchChange={handleSearch}
        placeholder="Buscar por código, nome da escola, cidade ou estado..."
      />

      {/* Ações */}
      <ConsultaActions
        onExportXLSX={handleExportXLSX}
        onExportPDF={handleExportPDF}
        totalItems={unidadesEscolares.length}
        loading={loading}
      />

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
      <UnidadesEscolaresTable
          unidades={unidadesEscolares}
          loading={loading}
          onView={handleView}
          canView={canView('unidades_escolares')}
          canEdit={false}
          canDelete={false}
          onEdit={() => {}}
          onDelete={() => {}}
          getRotaName={() => 'N/A'}
          loadingRotas={false}
          mode="consulta"
        />
      </div>

      {/* Modal de Visualização */}
      <UnidadeEscolarModal
        isOpen={showViewModal}
        onClose={handleCloseViewModal}
        unidade={selectedUnidadeEscolar}
        isViewMode={true}
        onSubmit={() => {}} // Não usado no modo visualização
        filiais={[]} // Para implantacao, não temos filiais carregadas
        rotas={[]} // Para implantacao, não temos rotas carregadas
        loadingFiliais={false}
        loadingRotas={false}
      />

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <div className="mt-6">
        <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
        </div>
      )}
    </div>
  );
};

export default UnidadesEscolares;
