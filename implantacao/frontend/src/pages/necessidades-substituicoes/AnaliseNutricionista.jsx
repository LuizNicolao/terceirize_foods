import React, { useEffect, useState, useMemo } from 'react';
import { useSubstituicoesNecessidades } from '../../hooks/useSubstituicoesNecessidades';
import { SubstituicoesFilters, SubstituicoesTableNutricionista } from './components';
import { AnaliseHeader, AnaliseEmptyState, AnaliseLoadingState, AnaliseErrorMessage } from './components/analise';
import useAnaliseAjustes from '../../hooks/necessidades/useAnaliseAjustes';
import useAnaliseLiberacao from '../../hooks/necessidades/useAnaliseLiberacao';
import ModalProgresso from '../../components/necessidades/ajuste/ModalProgresso';

const AnaliseNutricionista = () => {
  const [ajustesAtivados, setAjustesAtivados] = useState(false);
  const [progressoModal, setProgressoModal] = useState({
    isOpen: false,
    progresso: 0,
    total: 0,
    mensagem: 'Aguarde, processando registros...',
    title: 'Processando...'
  });
  
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
    carregarNecessidades,
    buscarProdutosGenericos,
    salvarSubstituicao,
    deletarSubstituicao,
    liberarAnalise,
    trocarProdutoOrigem,
    desfazerTrocaProduto,
    atualizarFiltros,
    aplicarFiltros,
    limparFiltros
  } = useSubstituicoesNecessidades();

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

  // Calcular total de escolas únicas e total de necessidades (linhas)
  const { totalEscolas, totalNecessidades } = useMemo(() => {
    if (!necessidades.length) return { totalEscolas: 0, totalNecessidades: 0 };
    
    const escolasUnicas = new Set();
    let totalLinhas = 0;
    
    necessidades.forEach(necessidade => {
      if (necessidade.escolas && Array.isArray(necessidade.escolas)) {
        totalLinhas += necessidade.escolas.length;
        necessidade.escolas.forEach(escola => {
          if (escola.escola_id) {
            escolasUnicas.add(escola.escola_id);
          }
        });
      }
    });
    
    return {
      totalEscolas: escolasUnicas.size,
      totalNecessidades: totalLinhas
    };
  }, [necessidades]);

  // Hook para gerenciar ajustes
  const { salvandoAjustes: salvandoAjustesHook, handleIniciarAjustes } = useAnaliseAjustes({
    necessidades,
    produtosGenericos,
    salvarSubstituicao,
    carregarNecessidades,
    setProgressoModal
  });

  // Hook para gerenciar liberação
  const { salvandoAjustes: salvandoLiberacao, handleLiberarAnalise } = useAnaliseLiberacao({
    necessidades,
    liberarAnalise,
    carregarNecessidades,
    limparFiltros,
    setProgressoModal
  });

  const salvandoAjustes = salvandoAjustesHook || salvandoLiberacao;
      
  // Handler para iniciar ajustes com callback
  const handleIniciarAjustesComCallback = async () => {
    const resultado = await handleIniciarAjustes();
    if (resultado?.ajustesAtivados !== undefined) {
      setAjustesAtivados(resultado.ajustesAtivados);
        }
  };

  // Handler para liberar análise com callback
  const handleLiberarAnaliseComCallback = async () => {
    const resultado = await handleLiberarAnalise();
    if (resultado?.ajustesAtivados !== undefined) {
      setAjustesAtivados(resultado.ajustesAtivados);
    }
  };

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
        tipo="nutricionista"
        onFiltroChange={atualizarFiltros}
        onAplicarFiltros={aplicarFiltros}
        onLimparFiltros={limparFiltros}
      />

      {/* Header com Estatísticas e Botões */}
      <AnaliseHeader
        totalNecessidades={totalNecessidades}
        totalEscolas={totalEscolas}
        necessidadesCount={necessidades.length}
        ajustesAtivados={ajustesAtivados}
        salvandoAjustes={salvandoAjustes}
        onIniciarAjustes={handleIniciarAjustesComCallback}
        onLiberarAnalise={handleLiberarAnaliseComCallback}
      />

      {/* Error Message */}
      <AnaliseErrorMessage error={error} />

      {/* Loading State */}
      {loading && <AnaliseLoadingState />}

      {/* Tabela */}
      {!loading && necessidades.length > 0 && (
        <SubstituicoesTableNutricionista
          necessidades={necessidades}
          produtosGenericos={produtosGenericos}
          loadingGenericos={loadingGenericos}
          onBuscarProdutosGenericos={buscarProdutosGenericos}
          ajustesAtivados={ajustesAtivados}
          onExpand={() => {}}
          onSaveConsolidated={handleSaveConsolidated}
          onSaveIndividual={handleSaveIndividual}
          onTrocarProdutoOrigem={trocarProdutoOrigem}
          onDesfazerTroca={desfazerTrocaProduto}
          onDeletarSubstituicao={deletarSubstituicao}
        />
      )}

      {/* Empty State */}
      {!loading && necessidades.length === 0 && (
        <AnaliseEmptyState filtrosJaAplicados={filtrosJaAplicados} />
      )}

      {/* Modal de Progresso */}
      <ModalProgresso
        isOpen={progressoModal.isOpen}
        title={progressoModal.title}
        progresso={progressoModal.progresso}
        total={progressoModal.total}
        mensagem={progressoModal.mensagem}
      />
    </>
  );
};

export default AnaliseNutricionista;
