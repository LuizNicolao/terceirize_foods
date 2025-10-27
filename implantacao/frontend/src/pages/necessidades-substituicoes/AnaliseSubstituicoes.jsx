import React, { useEffect } from 'react';
import { FaExchangeAlt, FaClipboardList } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useSubstituicoesNecessidades } from '../../hooks/useSubstituicoesNecessidades';
import { NecessidadesLayout, NecessidadesLoading } from '../../components/necessidades';
import { SubstituicoesFilters, SubstituicoesTable } from './components';
import { ExportButtons } from '../../components/shared';

const AnaliseSubstituicoes = () => {
  const { canView, loading: permissionsLoading } = usePermissions();
  
  const {
    necessidades,
    loading,
    error,
    grupos,
    semanasAbastecimento,
    semanasConsumo,
    filtros,
    produtosGenericos,
    loadingGenericos,
    buscarProdutosGenericos,
    salvarSubstituicao,
    atualizarFiltros,
    limparFiltros
  } = useSubstituicoesNecessidades();

  // Verificar permissões
  const canViewSubstituicoes = canView('necessidades');

  // Carregar produtos genéricos quando necessário
  useEffect(() => {
    if (necessidades.length > 0) {
      necessidades.forEach(necessidade => {
        if (!produtosGenericos[necessidade.codigo_origem]) {
          buscarProdutosGenericos(necessidade.codigo_origem);
        }
      });
    }
  }, [necessidades]);

  if (permissionsLoading) {
    return <NecessidadesLoading />;
  }

  if (!canViewSubstituicoes) {
    return (
      <NecessidadesLayout>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <FaClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acesso Restrito
          </h2>
          <p className="text-gray-600">
            Você não tem permissão para visualizar a análise de substituições.
          </p>
        </div>
      </NecessidadesLayout>
    );
  }

  const handleSaveConsolidated = async (dados, codigoOrigem) => {
    const response = await salvarSubstituicao(dados);
    return response;
  };

  const handleSaveIndividual = async (dados, escolaId) => {
    const response = await salvarSubstituicao(dados);
    return response;
  };

  return (
    <NecessidadesLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <FaExchangeAlt className="text-blue-600 text-2xl" />
          <h1 className="text-2xl font-bold text-gray-900">Análise de Necessidades</h1>
        </div>
        <p className="text-gray-600">
          Gerencie substituições de produtos solicitados por produtos genéricos disponíveis em estoque
        </p>
      </div>

      {/* Filtros */}
      <SubstituicoesFilters
        grupos={grupos}
        semanasAbastecimento={semanasAbastecimento}
        semanasConsumo={semanasConsumo}
        filtros={filtros}
        loading={loading}
        onFiltroChange={atualizarFiltros}
        onLimparFiltros={limparFiltros}
      />

      {/* Botões de Exportação */}
      {necessidades.length > 0 && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Produtos para Substituição ({necessidades.length})
            </h2>
            <ExportButtons
              onExportXLSX={() => console.log('Export XLSX')}
              onExportPDF={() => console.log('Export PDF')}
              size="sm"
              variant="outline"
              showLabels={true}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando necessidades...</p>
        </div>
      )}

      {/* Tabela */}
      {!loading && necessidades.length > 0 && (
        <SubstituicoesTable
          necessidades={necessidades}
          produtosGenericos={produtosGenericos}
          loadingGenericos={loadingGenericos}
          onExpand={() => {}}
          onSaveConsolidated={handleSaveConsolidated}
          onSaveIndividual={handleSaveIndividual}
        />
      )}

      {/* Empty State */}
      {!loading && necessidades.length === 0 && (filtros.grupo || filtros.semana_abastecimento) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <FaExchangeAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma necessidade encontrada
          </h3>
          <p className="text-gray-600">
            Não há necessidades com status CONF para os filtros selecionados.
          </p>
        </div>
      )}

      {/* Initial State */}
      {!loading && necessidades.length === 0 && !filtros.grupo && !filtros.semana_abastecimento && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <FaExchangeAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Selecione os filtros para buscar necessidades
          </h3>
          <p className="text-gray-600">
            Use os filtros acima para visualizar as necessidades disponíveis para substituição.
          </p>
        </div>
      )}
    </NecessidadesLayout>
  );
};

export default AnaliseSubstituicoes;
