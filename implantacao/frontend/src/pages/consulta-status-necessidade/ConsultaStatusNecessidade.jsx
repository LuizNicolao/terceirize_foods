import React, { useState } from 'react';
import { FaClipboardList, FaQuestionCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useAuth } from '../../contexts/AuthContext';
import { useConsultaStatusNecessidade } from '../../hooks/useConsultaStatusNecessidade';
import { 
  ConsultaStatusLayout,
  ConsultaStatusLoading,
  ConsultaStatusStats,
  ConsultaStatusFilters,
  ConsultaStatusTable,
  ConsultaStatusHeader
} from './components';
import { ExportButtons } from '../../components/shared';
import { Pagination } from '../../components/ui';
import toast from 'react-hot-toast';

const ConsultaStatusNecessidade = () => {
  const { canView } = usePermissions();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('lista');

  // Hook para gerenciar consulta de status
  const {
    necessidades,
    estatisticas,
    loading,
    error,
    pagination,
    filtros,
    opcoesSemanasAbastecimento,
    opcoesSemanasConsumo,
    unidadesEscolares,
    grupos,
    produtos,
    carregarNecessidades,
    carregarEstatisticas,
    atualizarFiltros,
    limparFiltros,
    atualizarPaginacao,
    exportarXLSX,
    exportarPDF,
    obterOpcoesStatus,
    obterOpcoesStatusSubstituicao
  } = useConsultaStatusNecessidade();

  // Verificar permissões
  const canViewConsulta = canView('consulta_status_necessidade');

  // Handlers de paginação
  const handlePageChange = (page) => {
    atualizarPaginacao({ currentPage: page });
  };

  const handleItemsPerPageChange = (itemsPerPage) => {
    atualizarPaginacao({ itemsPerPage, currentPage: 1 });
  };

  // Handlers de filtros
  const handleFilterChange = (novosFiltros) => {
    atualizarFiltros(novosFiltros);
  };

  const handleClearFilters = () => {
    limparFiltros();
    toast.success('Filtros limpos');
  };

  // Handlers de exportação
  const handleExportXLSX = async () => {
    try {
      await exportarXLSX();
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportarPDF();
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
    }
  };

  if (!canViewConsulta) {
    return (
      <ConsultaStatusLayout>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <FaClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acesso Restrito
          </h2>
          <p className="text-gray-600">
            Você não tem permissão para acessar esta funcionalidade.
          </p>
        </div>
      </ConsultaStatusLayout>
    );
  }

  return (
    <ConsultaStatusLayout>
      {/* Header */}
      <ConsultaStatusHeader
        canView={canViewConsulta}
        onShowHelp={() => {}} // TODO: Implementar ajuda
        loading={loading}
      />

      {/* Estatísticas - sempre visíveis */}
      <ConsultaStatusStats
        necessidades={necessidades}
        estatisticas={estatisticas}
        filtros={filtros}
      />

      {/* Abas */}
      <div className="mb-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('lista')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'lista'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📋 Lista de Necessidades
          </button>
          <button
            onClick={() => setActiveTab('relatorios')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'relatorios'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📊 Relatórios
          </button>
        </nav>
      </div>

      {/* Ações de Exportação - sempre visíveis */}
      <div className="mb-4">
        <ExportButtons
          onExportXLSX={handleExportXLSX}
          onExportPDF={handleExportPDF}
        />
      </div>

      {/* Conteúdo da aba Lista */}
      {activeTab === 'lista' && (
        <>
          {/* Filtros */}
          <ConsultaStatusFilters
            filtros={filtros}
            opcoesSemanasAbastecimento={opcoesSemanasAbastecimento}
            opcoesSemanasConsumo={opcoesSemanasConsumo}
            unidadesEscolares={unidadesEscolares}
            grupos={grupos}
            produtos={produtos}
            opcoesStatus={obterOpcoesStatus()}
            opcoesStatusSubstituicao={obterOpcoesStatusSubstituicao()}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            loading={loading}
          />

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Tabela de Necessidades */}
          <ConsultaStatusTable
            necessidades={necessidades || []}
            loading={loading}
            canView={canViewConsulta}
          />

          {/* Paginação */}
          {pagination && pagination.totalPages > 1 && (
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
        </>
      )}

      {/* Conteúdo da aba Relatórios */}
      {activeTab === 'relatorios' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Relatórios de Status de Necessidades
          </h3>
          <p className="text-gray-600">
            Funcionalidade de relatórios em desenvolvimento.
          </p>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && <ConsultaStatusLoading />}
    </ConsultaStatusLayout>
  );
};

export default ConsultaStatusNecessidade;
