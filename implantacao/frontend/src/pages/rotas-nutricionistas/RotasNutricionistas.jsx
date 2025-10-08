import React, { useState } from 'react';
import { FaQuestionCircle, FaEye, FaExclamationTriangle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useRotasNutricionistasConsulta } from '../../hooks/useRotasNutricionistasConsulta';
import { Button } from '../../components/ui';
import { 
  RotasNutricionistasTable, 
  RotasNutricionistasStats,
  RotasNutricionistasModal
} from '../../components/rotas-nutricionistas';
import { CadastroFilterBar } from '../../components/ui';
import { Pagination } from '../../components/ui';
import { ConsultaActions } from '../../components/shared';

const RotasNutricionistas = () => {
  const { canView } = usePermissions();
  
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRotaNutricionista, setSelectedRotaNutricionista] = useState(null);
  
  const {
    rotasNutricionistas,
    stats,
    connectionStatus,
    loading,
    error,
    pagination,
    filters,
    carregarRotasNutricionistas,
    buscarRotaNutricionistaPorId,
    atualizarFiltros,
    atualizarPaginacao,
    recarregar,
    isConnected,
    hasError,
    isEmpty
  } = useRotasNutricionistasConsulta();

  const handleView = async (rotaNutricionista) => {
    try {
      const rotaCompleta = await buscarRotaNutricionistaPorId(rotaNutricionista.id);
      setSelectedRotaNutricionista(rotaCompleta);
      setShowViewModal(true);
    } catch (err) {
      console.error('Erro ao carregar rota nutricionista:', err);
    }
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedRotaNutricionista(null);
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
    console.log('Exportar XLSX das rotas nutricionistas consultadas');
  };

  const handleExportPDF = () => {
    console.log('Exportar PDF das rotas nutricionistas consultadas');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Consultando rotas nutricionistas do sistema Foods...</p>
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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Rotas Nutricionistas</h1>
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
      <RotasNutricionistasStats 
        rotasNutricionistas={rotasNutricionistas}
        unidadesEscolares={[]}
      />

      {/* Filtros */}
      <CadastroFilterBar
        searchTerm={filters.search}
        onSearchChange={handleSearch}
        placeholder="Buscar por nome da rota, nutricionista, supervisor ou coordenador..."
      />

      {/* Ações */}
      <ConsultaActions
        onExportXLSX={handleExportXLSX}
        onExportPDF={handleExportPDF}
        totalItems={rotasNutricionistas.length}
        loading={loading}
      />

      {/* Tabela */}
      <RotasNutricionistasTable
        rotasNutricionistas={rotasNutricionistas}
        canView={canView('rotas_nutricionistas')}
        canEdit={false}
        canDelete={false}
        onView={handleView}
        onEdit={() => {}}
        onDelete={() => {}}
        getUsuarioName={(id) => rotasNutricionistas.find(r => r.usuario_id === id)?.usuario_nome || '-'}
        getSupervisorName={(id) => rotasNutricionistas.find(r => r.supervisor_id === id)?.supervisor_nome || '-'}
        getCoordenadorName={(id) => rotasNutricionistas.find(r => r.coordenador_id === id)?.coordenador_nome || '-'}
        loadingUsuarios={false}
      />

      {/* Modal de Visualização */}
      <RotasNutricionistasModal
        isOpen={showViewModal}
        onClose={handleCloseViewModal}
        onSubmit={() => {}} // Não usado no modo visualização
        isViewMode={true}
        rota={selectedRotaNutricionista}
        usuarios={[]}
        supervisores={[]}
        coordenadores={[]}
        unidadesEscolares={[]}
        loadingUsuarios={false}
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

export default RotasNutricionistas;