import React, { useState, useEffect } from 'react';
import { FaQuestionCircle, FaExclamationTriangle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useUnidadesEscolaresConsulta } from '../../hooks/useUnidadesEscolaresConsulta';
import { Button, ValidationErrorModal, ConfirmModal } from '../../components/ui';
import { CadastroFilterBar } from '../../components/ui';
import { Pagination } from '../../components/ui';
import { ExportButtons } from '../../components/shared';
import { 
  UnidadesEscolaresTable, 
  UnidadesEscolaresStats,
  UnidadeEscolarModal
} from '../../components/unidades-escolares';

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
    sortField,
    sortDirection,
    carregarUnidadesEscolares,
    buscarUnidadeEscolarPorId,
    atualizarFiltros,
    atualizarPaginacao,
    recarregar,
    handleSort,
    isConnected,
    hasError,
    isEmpty
  } = useUnidadesEscolaresConsulta();

  // Estados locais para rotas e filiais (não usados no cozinha_industrial)
  const rotas = [];
  const filiais = [];
  const loadingRotas = false;
  const loadingFiliais = false;

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

  const handleRotaFilter = (rotaFilter) => {
    atualizarFiltros({ rotaFilter });
  };

  const handleFilialFilter = (filialFilter) => {
    atualizarFiltros({ filialFilter });
  };

  const handlePageChange = (page) => {
    atualizarPaginacao({ currentPage: page });
  };

  const handleItemsPerPageChange = (itemsPerPage) => {
    atualizarPaginacao({ itemsPerPage, currentPage: 1 });
  };

  const handleExportXLSX = () => {};

  const handleExportPDF = () => {};

  // Estados de loading e erro
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Consultando cozinhas industriais do sistema Foods...</p>
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
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Cozinha Industrial</h1>
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
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onKeyPress={handleKeyPress}
        placeholder="Buscar por código, nome da escola, cidade ou estado..."
      />

      {/* Botões de Exportação */}
      <div className="mb-4">
        <ExportButtons
        onExportXLSX={handleExportXLSX}
        onExportPDF={handleExportPDF}
          disabled={!canView('unidades_escolares')}
      />
      </div>

      {/* Tabela */}
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
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        />

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

export default UnidadesEscolares;
