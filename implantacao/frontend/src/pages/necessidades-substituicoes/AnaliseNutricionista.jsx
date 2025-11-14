import React, { useEffect, useState } from 'react';
import { FaExchangeAlt, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import { useSubstituicoesNecessidades } from '../../hooks/useSubstituicoesNecessidades';
import { SubstituicoesFilters, SubstituicoesTableNutricionista } from './components';
import { ExportButtons } from '../../components/shared';
import { Button } from '../../components/ui';
import toast from 'react-hot-toast';

const AnaliseNutricionista = () => {
  const [ajustesAtivados, setAjustesAtivados] = useState(false);
  const [salvandoAjustes, setSalvandoAjustes] = useState(false);
  
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
    produtosGenericos,
    loadingGenericos,
    buscarProdutosGenericos,
    salvarSubstituicao,
    trocarProdutoOrigem,
    desfazerTrocaProduto,
    liberarAnalise,
    atualizarFiltros,
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

  const handleIniciarAjustes = async () => {
    if (!necessidades.length) {
      toast.error('Nenhuma necessidade encontrada');
      return;
    }

    setSalvandoAjustes(true);
    
    try {
      const resultados = await Promise.allSettled(
        necessidades.map(async (necessidade) => {
          try {
            const produtoPadrao = produtosGenericos[necessidade.codigo_origem]?.find(
              p => p.produto_padrao === 'Sim'
            );

            if (!produtoPadrao) {
              return { success: false, message: `Produto padrão não encontrado para ${necessidade.codigo_origem}` };
            }

            const unidade = produtoPadrao.unidade_medida_sigla || produtoPadrao.unidade || '';
            const fatorConversao = produtoPadrao.fator_conversao || 1;

            const dados = {
              produto_origem_id: necessidade.codigo_origem,
              produto_origem_nome: necessidade.produto_origem_nome,
              produto_origem_unidade: necessidade.produto_origem_unidade,
              produto_generico_id: produtoPadrao.id || produtoPadrao.codigo,
              produto_generico_codigo: produtoPadrao.id || produtoPadrao.codigo,
              produto_generico_nome: produtoPadrao.nome,
              produto_generico_unidade: unidade,
              necessidade_id_grupo: necessidade.necessidade_id_grupo,
              semana_abastecimento: necessidade.semana_abastecimento,
              semana_consumo: necessidade.semana_consumo,
              quantidade_origem: necessidade.quantidade_total_origem,
              quantidade_generico: Math.ceil(parseFloat(necessidade.quantidade_total_origem) / fatorConversao),
              escola_ids: necessidade.escolas.map(escola => {
                const quantidadeGenerico = Math.ceil(parseFloat(escola.quantidade_origem) / fatorConversao);
                return {
                  necessidade_id: escola.necessidade_id,
                  escola_id: escola.escola_id,
                  escola_nome: escola.escola_nome,
                  quantidade_origem: escola.quantidade_origem,
                  quantidade_generico: quantidadeGenerico
                };
              })
            };

            const response = await salvarSubstituicao(dados);
            return response;
          } catch (error) {
            return { success: false, error: error.message };
          }
        })
      );

      const sucessos = resultados.filter(r => r.status === 'fulfilled').length;
      const erros = resultados.filter(r => r.status === 'rejected').length;
      
      if (erros > 0) {
        toast.error(`${sucessos} salvos com sucesso, ${erros} falharam`);
      } else {
        toast.success('Ajustes iniciados com sucesso!');
        setAjustesAtivados(true);
      }
    } catch (error) {
      toast.error(`Erro ao iniciar ajustes: ${error.message}`);
    } finally {
      setSalvandoAjustes(false);
    }
  };

  const handleLiberarAnalise = async () => {
    if (!necessidades.length) {
      toast.error('Nenhuma necessidade encontrada');
      return;
    }

    setSalvandoAjustes(true);

    try {
      // Agrupar necessidades por produto origem para liberar em lote
      const necessidadesPorProduto = {};
      
      necessidades.forEach(necessidade => {
        const chave = `${necessidade.codigo_origem}_${necessidade.semana_abastecimento}_${necessidade.semana_consumo}`;
        if (!necessidadesPorProduto[chave]) {
          necessidadesPorProduto[chave] = {
            produto_origem_id: necessidade.codigo_origem,
            semana_abastecimento: necessidade.semana_abastecimento,
            semana_consumo: necessidade.semana_consumo
          };
        }
      });

      // Liberar análise para cada produto origem
      const resultados = await Promise.allSettled(
        Object.values(necessidadesPorProduto).map(async (dados) => {
          return await liberarAnalise(dados);
        })
      );

      const sucessos = resultados.filter(r => r.status === 'fulfilled').length;
      const erros = resultados.filter(r => r.status === 'rejected').length;

      if (erros > 0) {
        toast.error(`${sucessos} análises liberadas com sucesso, ${erros} falharam`);
      } else {
        toast.success('Análise liberada para coordenação!');
        setAjustesAtivados(false); // Reset para mostrar que foi liberado
      }
    } catch (error) {
      toast.error(`Erro ao liberar análise: ${error.message}`);
    } finally {
      setSalvandoAjustes(false);
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
        onFiltroChange={atualizarFiltros}
        onLimparFiltros={limparFiltros}
      />

      {/* Botões de Ação */}
      {necessidades.length > 0 && !ajustesAtivados && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Produtos para Substituição ({necessidades.length})
            </h2>
            <Button
              variant="primary"
              onClick={handleIniciarAjustes}
              disabled={salvandoAjustes || !necessidades.length}
            >
              {salvandoAjustes ? (
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

      {/* Botões de Exportação e Liberar Análise quando ajustes ativados */}
      {necessidades.length > 0 && ajustesAtivados && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Produtos para Substituição ({necessidades.length})
            </h2>
            <div className="flex gap-3">
              <ExportButtons
                onExportXLSX={() => {}}
                onExportPDF={() => {}}
                size="sm"
                variant="outline"
                showLabels={true}
              />
              <Button
                variant="success"
                onClick={handleLiberarAnalise}
                disabled={salvandoAjustes}
                className="flex items-center gap-2"
              >
                {salvandoAjustes ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Liberando...
                  </>
                ) : (
                  <>
                    <FaArrowRight className="w-4 h-4" />
                    Liberar Análise
                  </>
                )}
              </Button>
            </div>
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
        <SubstituicoesTableNutricionista
          necessidades={necessidades}
          produtosGenericos={produtosGenericos}
          loadingGenericos={loadingGenericos}
          ajustesAtivados={ajustesAtivados}
          onExpand={() => {}}
          onSaveConsolidated={handleSaveConsolidated}
          onSaveIndividual={handleSaveIndividual}
          onTrocarProdutoOrigem={trocarProdutoOrigem}
          onDesfazerTrocaProduto={desfazerTrocaProduto}
        />
      )}

      {/* Empty State */}
      {!loading && necessidades.length === 0 && filtros.grupo && filtros.semana_abastecimento && (
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
      {!loading && necessidades.length === 0 && (!filtros.grupo || !filtros.semana_abastecimento) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <FaExchangeAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Selecione os filtros para buscar necessidades
          </h3>
          <p className="text-gray-600">
            Selecione o <strong>Grupo de Produtos</strong> e a <strong>Semana de Abastecimento</strong> para visualizar as necessidades disponíveis para substituição.
          </p>
        </div>
      )}
    </>
  );
};

export default AnaliseNutricionista;
