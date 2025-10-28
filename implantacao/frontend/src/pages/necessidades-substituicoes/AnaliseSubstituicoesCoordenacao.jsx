import React from 'react';
import { useSubstituicoesOrchestrator } from './hooks/useSubstituicoesOrchestrator';
import { useSubstituicoesCoordenacao } from './hooks/useSubstituicoesCoordenacao';
import SubstituicoesFilters from './components/SubstituicoesFilters';
import SubstituicoesTableCoordenacao from './components/SubstituicoesTableCoordenacao';
import ExportButtons from './components/ExportButtons';
import { useExport } from '../../../hooks/useExport';

const AnaliseSubstituicoesCoordenacao = () => {
  const {
    necessidades,
    produtosGenericos,
    filtros,
    ajustesAtivados,
    semanasAbastecimento,
    semanasConsumo,
    loadingNecessidades,
    loadingGenericos,
    loadingSemanasAbast,
    loadingSemanasConsumo,
    handleFiltrosChange,
    canView,
    canEdit
  } = useSubstituicoesOrchestrator();

  const {
    salvarSubstituicao,
    aprovarSubstituicao,
    rejeitarSubstituicao,
    loading,
    salvando
  } = useSubstituicoesCoordenacao();

  const {
    exportarPDF,
    exportarXLSX,
    loadingExport
  } = useExport();

  const handleSaveConsolidated = async (dados, chaveUnica) => {
    return await salvarSubstituicao(dados);
  };

  const handleSaveIndividual = async (dados, escolaId) => {
    return await salvarSubstituicao(dados);
  };

  const handleAprovarSubstituicao = async (substituicao) => {
    return await aprovarSubstituicao(substituicao);
  };

  const handleRejeitarSubstituicao = async (substituicao) => {
    return await rejeitarSubstituicao(substituicao);
  };

  const handleExportPDF = async () => {
    await exportarPDF('necessidades-substituicoes-coordenacao', {
      necessidades,
      filtros,
      tipo: 'coordenacao'
    });
  };

  const handleExportXLSX = async () => {
    await exportarXLSX('necessidades-substituicoes-coordenacao', {
      necessidades,
      filtros,
      tipo: 'coordenacao'
    });
  };

  if (!canView) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            👨‍💼 Análise de Necessidades - Coordenação
          </h1>
          <p className="mt-2 text-gray-600">
            Aprovação e edição de substituições de produtos
          </p>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <SubstituicoesFilters
            filtros={filtros}
            onFiltrosChange={handleFiltrosChange}
            semanasAbastecimento={semanasAbastecimento}
            semanasConsumo={semanasConsumo}
            loadingSemanasAbast={loadingSemanasAbast}
            loadingSemanasConsumo={loadingSemanasConsumo}
          />
        </div>

        {/* Botões de Exportação */}
        {necessidades.length > 0 && (
          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                Substituições para Aprovação ({necessidades.length})
              </h2>
              <ExportButtons
                onExportPDF={handleExportPDF}
                onExportXLSX={handleExportXLSX}
                loading={loadingExport}
                disabled={necessidades.length === 0}
              />
            </div>
          </div>
        )}

        {/* Tabela */}
        <SubstituicoesTableCoordenacao
          necessidades={necessidades}
          produtosGenericos={produtosGenericos}
          loadingGenericos={loadingGenericos}
          ajustesAtivados={ajustesAtivados}
          onSaveConsolidated={handleSaveConsolidated}
          onSaveIndividual={handleSaveIndividual}
          onAprovarSubstituicao={handleAprovarSubstituicao}
          onRejeitarSubstituicao={handleRejeitarSubstituicao}
        />

        {/* Loading Overlay */}
        {(loadingNecessidades || loading) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-700">
                {loadingNecessidades ? 'Carregando necessidades...' : 'Processando...'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnaliseSubstituicoesCoordenacao;
