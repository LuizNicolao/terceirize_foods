import React, { useEffect, useState, useMemo } from 'react';
import { FaExchangeAlt, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import { useSubstituicoesNecessidades } from '../../hooks/useSubstituicoesNecessidades';
import { SubstituicoesFilters, SubstituicoesTableNutricionista } from './components';
import { ExportButtons } from '../../components/shared';
import { Button } from '../../components/ui';
import ModalProgresso from '../../components/necessidades/ajuste/ModalProgresso';
import toast from 'react-hot-toast';

const AnaliseNutricionista = () => {
  const [ajustesAtivados, setAjustesAtivados] = useState(false);
  const [salvandoAjustes, setSalvandoAjustes] = useState(false);
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

  const handleIniciarAjustes = async () => {
    if (!necessidades.length) {
      toast.error('Nenhuma necessidade encontrada');
      return;
    }

    setSalvandoAjustes(true);
    const totalProcessos = necessidades.length;
    const resultadosAjustes = [];
    
    try {
      // Passo 1: Salvar todos os ajustes
      setProgressoModal({
        isOpen: true,
        progresso: 0,
        total: totalProcessos,
        mensagem: 'Salvando ajustes...',
        title: 'Realizando Ajustes'
      });

      const delayEntreRequisicoes = 200; // 200ms entre cada requisição
      
      for (let i = 0; i < necessidades.length; i++) {
        const necessidade = necessidades[i];
        
          try {
            const produtoPadrao = produtosGenericos[necessidade.codigo_origem]?.find(
              p => p.produto_padrao === 'Sim'
            );

            if (!produtoPadrao) {
            resultadosAjustes.push({ 
              success: false, 
              message: `Produto padrão não encontrado para ${necessidade.codigo_origem}` 
            });
          } else {
            const unidade = produtoPadrao.unidade_medida_sigla || produtoPadrao.unidade || '';
            const fatorConversao = produtoPadrao.fator_conversao || 1;

            // Garantir que quantidade_total_origem tenha um valor válido
            const quantidadeTotalOrigem = parseFloat(necessidade.quantidade_total_origem) || 0;
            const quantidadeGenericoTotal = Math.ceil(quantidadeTotalOrigem / fatorConversao) || 0;

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
              quantidade_origem: quantidadeTotalOrigem,
              quantidade_generico: quantidadeGenericoTotal,
              escola_ids: necessidade.escolas.map(escola => {
                // Garantir que quantidade_origem da escola tenha um valor válido
                const quantidadeOrigemEscola = parseFloat(escola.quantidade_origem) || 0;
                const quantidadeGenericoEscola = Math.ceil(quantidadeOrigemEscola / fatorConversao) || 0;
                
                return {
                  necessidade_id: escola.necessidade_id,
                  escola_id: escola.escola_id,
                  escola_nome: escola.escola_nome,
                  quantidade_origem: quantidadeOrigemEscola,
                  quantidade_generico: quantidadeGenericoEscola
                };
              })
            };

            // Desabilitar toast individual quando salvando em lote
            const response = await salvarSubstituicao(dados, false);
            resultadosAjustes.push(response);
          }
          } catch (error) {
          resultadosAjustes.push({ success: false, error: error.message });
          }
        
        // Atualizar progresso
        setProgressoModal(prev => ({
          ...prev,
          progresso: i + 1
        }));

        // Delay entre requisições (exceto na última)
        if (i < necessidades.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delayEntreRequisicoes));
        }
      }

      // Contar sucessos e erros dos ajustes
      const sucessosAjustes = resultadosAjustes.filter(r => r.success).length;
      const errosAjustes = resultadosAjustes.filter(r => !r.success).length;

      // Fechar modal de progresso
      setProgressoModal(prev => ({ ...prev, isOpen: false }));
      
      // Recarregar necessidades para mostrar os ajustes salvos
      if (necessidades.length > 0) {
        await carregarNecessidades();
      }
      
      // Exibir mensagem de sucesso dos ajustes
      if (sucessosAjustes > 0) {
        let mensagem = `${sucessosAjustes} ajuste(s) salvo(s) com sucesso`;
        if (errosAjustes > 0) {
          mensagem += `, ${errosAjustes} erro(s)`;
        }
        toast.success(mensagem);
        setAjustesAtivados(true); // Ativar ajustes para permitir troca de produto origem
      } else {
        toast.error('Nenhuma substituição foi salva.');
      }
    } catch (error) {
      setProgressoModal(prev => ({ ...prev, isOpen: false }));
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

      // Liberar análise para cada produto origem sequencialmente com modal de progresso
      const dadosParaProcessar = Object.values(necessidadesPorProduto);
      const totalProcessos = dadosParaProcessar.length;
      
      setProgressoModal({
        isOpen: true,
        progresso: 0,
        total: totalProcessos,
        mensagem: 'Liberando análises...',
        title: 'Liberando Análises'
      });

      const resultados = [];
      const delayEntreRequisicoes = 200; // 200ms entre cada requisição
      
      for (let i = 0; i < dadosParaProcessar.length; i++) {
        const dados = dadosParaProcessar[i];
        
        try {
          const resultado = await liberarAnalise(dados, false);
          resultados.push({ status: 'fulfilled', value: resultado });
        } catch (error) {
          resultados.push({ 
            status: 'rejected', 
            reason: error,
            value: { success: false, error: error?.message || 'Erro desconhecido' }
          });
        }
        
        // Atualizar progresso
        setProgressoModal(prev => ({
          ...prev,
          progresso: i + 1
        }));
        
        // Delay entre requisições (exceto na última)
        if (i < dadosParaProcessar.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delayEntreRequisicoes));
        }
      }

      // Contar sucessos e erros baseado nas respostas
      const sucessos = resultados.filter(r => 
        r.status === 'fulfilled' && r.value?.success
      ).length;
      const erros = resultados.filter(r => 
        r.status === 'rejected' || (r.status === 'fulfilled' && !r.value?.success)
      ).length;

      // Fechar modal de progresso
      setProgressoModal(prev => ({ ...prev, isOpen: false }));

      // Recarregar necessidades apenas uma vez no final
      if (necessidades.length > 0) {
        await carregarNecessidades();
      }

      // Limpar filtros após liberar análise com sucesso
      if (sucessos > 0) {
        limparFiltros();
      }

      // Exibir mensagem consolidada
      if (erros > 0) {
        toast.error(`${sucessos} análise(s) liberada(s) com sucesso, ${erros} falharam`);
      } else if (sucessos > 0) {
        toast.success(`${sucessos} análise(s) liberada(s) para coordenação!`);
        setAjustesAtivados(false); // Reset para mostrar que foi liberado
      } else {
        toast.error('Nenhuma análise foi liberada');
      }
    } catch (error) {
      setProgressoModal(prev => ({ ...prev, isOpen: false }));
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
        tipo="nutricionista"
        onFiltroChange={atualizarFiltros}
        onAplicarFiltros={aplicarFiltros}
        onLimparFiltros={limparFiltros}
      />

      {/* Botões de Ação */}
      {necessidades.length > 0 && !ajustesAtivados && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Produtos para Substituição ({necessidades.length}) • {totalNecessidades} {totalNecessidades === 1 ? 'necessidade' : 'necessidades'} • {totalEscolas} {totalEscolas === 1 ? 'escola' : 'escolas'}
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
              Produtos para Substituição ({necessidades.length}) • {totalNecessidades} {totalNecessidades === 1 ? 'necessidade' : 'necessidades'} • {totalEscolas} {totalEscolas === 1 ? 'escola' : 'escolas'}
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
          onBuscarProdutosGenericos={buscarProdutosGenericos}
          ajustesAtivados={ajustesAtivados}
          onExpand={() => {}}
          onSaveConsolidated={handleSaveConsolidated}
          onSaveIndividual={handleSaveIndividual}
          onTrocarProdutoOrigem={trocarProdutoOrigem}
          onDesfazerTroca={desfazerTrocaProduto}
        />
      )}

      {/* Empty State */}
      {!loading && necessidades.length === 0 && filtrosJaAplicados && (
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
      {!loading && necessidades.length === 0 && !filtrosJaAplicados && (
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
