import React, { useEffect, useState } from 'react';
import { useSubstituicoesNecessidades } from '../../hooks/useSubstituicoesNecessidades';
import { SubstituicoesFilters, SubstituicoesTableCoordenacao, CoordenacaoHeader, CoordenacaoEmptyState } from './components';
import { AnaliseLoadingState, AnaliseErrorMessage } from './components/analise';
import { useCoordenacaoExport, useCoordenacaoStats } from '../../hooks/necessidades';

const AnaliseCoordenacao = () => {
  const [ajustesAtivados, setAjustesAtivados] = useState(false);
  
  const {
    necessidades,
    loading,
    error,
    grupos,
    semanasAbastecimento,
    semanasConsumo,
    tiposRota,
    rotas,
    filtros,
    filtrosJaAplicados,
    produtosGenericos,
    loadingGenericos,
    buscarProdutosGenericos,
    salvarSubstituicao,
    deletarSubstituicao,
    atualizarFiltros,
    aplicarFiltros,
    limparFiltros,
    trocarProdutoOrigem,
    desfazerTrocaProduto
  } = useSubstituicoesNecessidades('coordenacao');

  // Carregar produtos genéricos quando necessário
  useEffect(() => {
    if (necessidades.length > 0) {
      necessidades.forEach(necessidade => {
        if (!produtosGenericos[necessidade.codigo_origem] && necessidade.grupo) {
          buscarProdutosGenericos(necessidade.codigo_origem, necessidade.grupo);
        }
      });
    }
  }, [necessidades]);

  // Verificar se já existem substituições salvas
  useEffect(() => {
    if (necessidades.length > 0) {
      const temSubstituicoes = necessidades.some(nec => 
        nec.escolas.some(escola => escola.substituicao)
      );
      setAjustesAtivados(temSubstituicoes);
    }
  }, [necessidades]);

  // Estatísticas
  const { totalEscolas, totalNecessidades, totalProdutos } = useCoordenacaoStats(necessidades);

  // Exportações
  const { handleExportXLSX, handleExportPDF } = useCoordenacaoExport(filtros);

  const handleSaveConsolidated = async (dados, codigoOrigem) => {
    const response = await salvarSubstituicao(dados);
    return response;
  };

  const handleSaveIndividual = async (dados, escolaId) => {
    const response = await salvarSubstituicao(dados);
    return response;
  };

  return (
    <>
      {/* Filtros */}
      <SubstituicoesFilters
        grupos={grupos}
        semanasAbastecimento={semanasAbastecimento}
        semanasConsumo={semanasConsumo}
        tiposRota={tiposRota}
        rotas={rotas}
        filtros={filtros}
        loading={loading}
        tipo="coordenacao"
        onFiltroChange={atualizarFiltros}
        onAplicarFiltros={aplicarFiltros}
        onLimparFiltros={limparFiltros}
      />

      {/* Header com Estatísticas e Botões de Exportar */}
      <CoordenacaoHeader
        totalProdutos={totalProdutos}
        totalNecessidades={totalNecessidades}
        totalEscolas={totalEscolas}
        onExportXLSX={handleExportXLSX}
        onExportPDF={handleExportPDF}
      />

      {/* Error Message */}
      <AnaliseErrorMessage error={error} />

      {/* Loading State */}
      {loading && <AnaliseLoadingState />}

      {/* Tabela */}
      {!loading && necessidades.length > 0 && (
        <SubstituicoesTableCoordenacao
          necessidades={necessidades}
          produtosGenericos={produtosGenericos}
          loadingGenericos={loadingGenericos}
          ajustesAtivados={ajustesAtivados}
          onExpand={() => {}}
          onSaveConsolidated={handleSaveConsolidated}
          onSaveIndividual={handleSaveIndividual}
          onBuscarProdutosGenericos={buscarProdutosGenericos}
          onTrocarProdutoOrigem={trocarProdutoOrigem}
          onDesfazerTroca={desfazerTrocaProduto}
          onDeletarSubstituicao={deletarSubstituicao}
        />
      )}

      {/* Empty State */}
      {!loading && necessidades.length === 0 && (
        <CoordenacaoEmptyState filtrosJaAplicados={filtrosJaAplicados} />
      )}
    </>
  );
};

export default AnaliseCoordenacao;
