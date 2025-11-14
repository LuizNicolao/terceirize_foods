import React, { useEffect, useState } from 'react';
import { FaExchangeAlt } from 'react-icons/fa';
import { useSubstituicoesNecessidades } from '../../hooks/useSubstituicoesNecessidades';
import { SubstituicoesFilters, SubstituicoesTableCoordenacao } from './components';
import { ExportButtons } from '../../components/shared';

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
    produtosGenericos,
    loadingGenericos,
    buscarProdutosGenericos,
    salvarSubstituicao,
    desfazerSubstituicao,
    atualizarFiltros,
    limparFiltros
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

  const handleSaveConsolidated = async (dados, codigoOrigem) => {
    const response = await salvarSubstituicao(dados);
    return response;
  };

  const handleSaveIndividual = async (dados, escolaId) => {
    const response = await salvarSubstituicao(dados);
    return response;
  };

  const handleDesfazerSubstituicao = async (necessidade) => {
    if (!necessidade?.produto_trocado_id) {
      return;
    }

    let payload = {};
    if (necessidade.necessidade_ids) {
      const ids = necessidade.necessidade_ids
        .split(',')
        .map(id => parseInt(id.trim(), 10))
        .filter(id => !Number.isNaN(id));
      if (ids.length > 0) {
        payload.necessidade_ids = ids;
      }
    }

    if (!payload.necessidade_ids || payload.necessidade_ids.length === 0) {
      payload = {
        produto_origem_id: necessidade.codigo_origem,
        semana_abastecimento: necessidade.semana_abastecimento,
        semana_consumo: necessidade.semana_consumo
      };
    }

    await desfazerSubstituicao(payload);
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

      {/* Ações (Botões de Exportar) */}
      {necessidades.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Produtos para Substituição ({necessidades.length})
            </h2>
            <div className="flex items-center gap-2">
              <ExportButtons
                onExportXLSX={() => {}}
                onExportPDF={() => {}}
                size="sm"
                variant="outline"
                showLabels={true}
              />
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
        <SubstituicoesTableCoordenacao
          necessidades={necessidades}
          produtosGenericos={produtosGenericos}
          loadingGenericos={loadingGenericos}
          ajustesAtivados={ajustesAtivados}
          onExpand={() => {}}
          onSaveConsolidated={handleSaveConsolidated}
          onSaveIndividual={handleSaveIndividual}
          onUndoSubstitution={handleDesfazerSubstituicao}
        />
      )}

      {/* Empty State */}
      {!loading && necessidades.length === 0 && (filtros.grupo || filtros.semana_abastecimento || filtros.tipo_rota_id) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <FaExchangeAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma necessidade encontrada
          </h3>
          <p className="text-gray-600">
            Não há necessidades liberadas para coordenação com os filtros selecionados.
          </p>
        </div>
      )}

      {/* Initial State */}
      {!loading && necessidades.length === 0 && !filtros.grupo && !filtros.semana_abastecimento && !filtros.tipo_rota_id && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <FaExchangeAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Selecione os filtros para buscar necessidades
          </h3>
          <p className="text-gray-600">
            Selecione pelo menos um filtro (<strong>Tipo de Rota</strong>, <strong>Grupo de Produtos</strong> ou <strong>Semana de Abastecimento</strong>) para visualizar as necessidades liberadas para coordenação.
          </p>
        </div>
      )}
    </>
  );
};

export default AnaliseCoordenacao;
