import React, { useEffect, useState } from 'react';
import { FaExchangeAlt, FaClipboardList, FaCheckCircle, FaUserMd, FaUserTie } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useSubstituicoesOrchestrator } from './hooks/useSubstituicoesOrchestrator';
import { useSubstituicoesNutricionista } from './hooks/useSubstituicoesNutricionista';
import { NecessidadesLayout, NecessidadesLoading } from '../../components/necessidades';
import { SubstituicoesFilters } from './components';
import SubstituicoesTableNutricionista from './components/SubstituicoesTableNutricionista';
import { ExportButtons } from '../../components/shared';
import { Button } from '../../components/ui';
import toast from 'react-hot-toast';

const AnaliseSubstituicoes = () => {
  const { canView, loading: permissionsLoading } = usePermissions();
  
  const {
    necessidades,
    produtosGenericos,
    filtros,
    ajustesAtivados,
    activeTab,
    semanasAbastecimento,
    semanasConsumo,
    loadingNecessidades,
    loadingGenericos,
    loadingSemanasAbast,
    loadingSemanasConsumo,
    handleFiltrosChange,
    handleIniciarAjustes,
    handleTabChange,
    getTabelaParaUsuario,
    salvarSubstituicao,
    canView: canViewSubstituicoes,
    canEdit
  } = useSubstituicoesOrchestrator();

  const {
    salvarSubstituicao: salvarNutricionista,
    liberarParaCoordenacao,
    loading: loadingNutricionista,
    salvando: salvandoNutricionista
  } = useSubstituicoesNutricionista();

  const handleSaveConsolidated = async (dados, chaveUnica) => {
    return await salvarNutricionista(dados);
  };

  const handleSaveIndividual = async (dados, escolaId) => {
    return await salvarNutricionista(dados);
  };

  const handleLiberarCoordenacao = async () => {
    const response = await liberarParaCoordenacao(necessidades);
    if (response.success) {
      // Recarregar necessidades para atualizar status
      window.location.reload();
    }
  };

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

  return (
    <NecessidadesLayout hideHeader={true}>
      {/* Header Personalizado */}
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
        filtros={filtros}
        onFiltrosChange={handleFiltrosChange}
        semanasAbastecimento={semanasAbastecimento}
        semanasConsumo={semanasConsumo}
        loadingSemanasAbast={loadingSemanasAbast}
        loadingSemanasConsumo={loadingSemanasConsumo}
      />

      {/* Abas */}
      {necessidades.length > 0 && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => handleTabChange('nutricionista')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'nutricionista'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FaUserMd className="w-4 h-4" />
                  Ajuste Nutricionista
                </div>
              </button>
              <button
                onClick={() => handleTabChange('coordenacao')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'coordenacao'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FaUserTie className="w-4 h-4" />
                  Ajuste Coordenação
                </div>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Botão Realizar Ajustes */}
      {necessidades.length > 0 && !ajustesAtivados && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Produtos para Substituição ({necessidades.length})
            </h2>
            <Button
              variant="primary"
              onClick={handleIniciarAjustes}
              disabled={loadingNutricionista || !necessidades.length}
            >
              {loadingNutricionista ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <FaCheckCircle className="mr-2" />
                  Realizar Ajustes
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Botões de Exportação e Liberar para Coordenação */}
      {necessidades.length > 0 && ajustesAtivados && activeTab === 'nutricionista' && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Produtos para Substituição ({necessidades.length})
            </h2>
            <div className="flex gap-3">
              <ExportButtons
                onExportXLSX={() => console.log('Export XLSX')}
                onExportPDF={() => console.log('Export PDF')}
                size="sm"
                variant="outline"
                showLabels={true}
              />
              <Button
                variant="success"
                onClick={handleLiberarCoordenacao}
                disabled={loadingNutricionista}
              >
                {loadingNutricionista ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Liberando...
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="mr-2" />
                    Liberar para Coordenação
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Botões de Exportação para Coordenação */}
      {necessidades.length > 0 && ajustesAtivados && activeTab === 'coordenacao' && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Substituições para Aprovação ({necessidades.length})
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

      {/* Loading State */}
      {loadingNecessidades && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando necessidades...</p>
        </div>
      )}

      {/* Tabela Nutricionista */}
      {!loadingNecessidades && necessidades.length > 0 && activeTab === 'nutricionista' && (
        <SubstituicoesTableNutricionista
          necessidades={necessidades}
          produtosGenericos={produtosGenericos}
          loadingGenericos={loadingGenericos}
          ajustesAtivados={ajustesAtivados}
          onSaveConsolidated={handleSaveConsolidated}
          onSaveIndividual={handleSaveIndividual}
        />
      )}

      {/* Empty State */}
      {!loadingNecessidades && necessidades.length === 0 && (filtros.grupo || filtros.semana_abastecimento) && (
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
      {!loadingNecessidades && necessidades.length === 0 && !filtros.grupo && !filtros.semana_abastecimento && (
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
