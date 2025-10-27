import React, { useEffect, useState } from 'react';
import { FaExchangeAlt, FaClipboardList, FaCheckCircle } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useSubstituicoesNecessidades } from '../../hooks/useSubstituicoesNecessidades';
import { NecessidadesLayout, NecessidadesLoading } from '../../components/necessidades';
import { SubstituicoesFilters, SubstituicoesTable } from './components';
import { ExportButtons } from '../../components/shared';
import { Button } from '../../components/ui';
import toast from 'react-hot-toast';

const AnaliseSubstituicoes = () => {
  const { canView, loading: permissionsLoading } = usePermissions();
  const [ajustesAtivados, setAjustesAtivados] = useState(false);
  const [salvandoAjustes, setSalvandoAjustes] = useState(false);
  
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
        const key = `${necessidade.codigo_origem}_${necessidade.grupo}`;
        if (!produtosGenericos[necessidade.codigo_origem] && necessidade.grupo) {
          buscarProdutosGenericos(necessidade.codigo_origem, necessidade.grupo);
        }
      });
    }
  }, [necessidades]);

  // Verificar se já existem substituições salvas
  useEffect(() => {
    if (necessidades.length > 0) {
      // Verificar se alguma necessidade já tem substituição salva
      const temSubstituicoes = necessidades.some(nec => 
        nec.escolas.some(escola => escola.substituicao)
      );
      setAjustesAtivados(temSubstituicoes);
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

  const handleIniciarAjustes = async () => {
    if (!necessidades.length) {
      toast.error('Nenhuma necessidade encontrada');
      return;
    }

    setSalvandoAjustes(true);
    
    try {
      // Para cada necessidade, criar registros iniciais com produtos padrão
      const resultados = await Promise.allSettled(
        necessidades.map(async (necessidade) => {
          try {
            // Buscar produto padrão
            const produtoPadrao = produtosGenericos[necessidade.codigo_origem]?.find(
              p => p.produto_padrao === 'Sim'
            );

            if (!produtoPadrao) {
              console.warn(`Produto padrão não encontrado para ${necessidade.codigo_origem}`);
              return { success: false, message: `Produto padrão não encontrado para ${necessidade.codigo_origem}` };
            }

            const unidade = produtoPadrao.unidade_medida_sigla || produtoPadrao.unidade || '';
            const fatorConversao = produtoPadrao.fator_conversao || 1;

            // Preparar dados para salvar
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
              // Campos obrigatórios para validação (valores consolidados)
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

            console.log('📤 Enviando dados para salvar:', JSON.stringify(dados, null, 2));
            const response = await salvarSubstituicao(dados);
            console.log('✅ Resposta recebida:', response);
            return response;
          } catch (error) {
            console.error(`❌ Erro ao salvar necessidade ${necessidade.codigo_origem}:`, error);
            return { success: false, error: error.message };
          }
        })
      );

      console.log('📊 Resultados:', resultados);
      
      const sucessos = resultados.filter(r => r.status === 'fulfilled').length;
      const erros = resultados.filter(r => r.status === 'rejected').length;
      
      if (erros > 0) {
        console.error('⚠️ Alguns ajustes falharam:', erros);
        console.log('📋 Resultados completos:', resultados);
        toast.error(`${sucessos} salvos com sucesso, ${erros} falharam. Veja o console para detalhes.`);
      } else {
        toast.success('Ajustes iniciados com sucesso!');
        setAjustesAtivados(true);
        
        // Recarregar necessidades para atualizar os dados (após delay para ver logs)
        setTimeout(() => {
          console.log('🔄 Recarregando página...');
          window.location.reload();
        }, 3000); // 3 segundos para ver os logs
      }
    } catch (error) {
      console.error('❌ Erro ao iniciar ajustes:', error);
      toast.error(`Erro ao iniciar ajustes: ${error.message}`);
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
        grupos={grupos}
        semanasAbastecimento={semanasAbastecimento}
        semanasConsumo={semanasConsumo}
        filtros={filtros}
        loading={loading}
        onFiltroChange={atualizarFiltros}
        onLimparFiltros={limparFiltros}
      />

      {/* Botões de Exportação */}
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

      {/* Botões de Exportação quando ajustes ativados */}
      {necessidades.length > 0 && ajustesAtivados && (
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
          ajustesAtivados={ajustesAtivados}
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
