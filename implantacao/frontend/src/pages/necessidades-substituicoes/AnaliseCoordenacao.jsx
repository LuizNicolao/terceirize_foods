import React, { useEffect, useState } from 'react';
import { FaExchangeAlt, FaCheckCircle } from 'react-icons/fa';
import { useSubstituicoesNecessidades } from '../../hooks/useSubstituicoesNecessidades';
import { SubstituicoesFilters, SubstituicoesTableCoordenacao } from './components';
import { ExportButtons } from '../../components/shared';
import { Button } from '../../components/ui';
import toast from 'react-hot-toast';

const AnaliseCoordenacao = () => {
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
    aprovarSubstituicao,
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

  const handleAprovarAnalise = async () => {
    if (!necessidades.length) {
      toast.error('Nenhuma necessidade encontrada');
      return;
    }

    setSalvandoAjustes(true);
    
    try {
      // Aprovar todas as substituições
      const resultados = await Promise.allSettled(
        necessidades.flatMap(necessidade => 
          necessidade.escolas
            .filter(escola => escola.substituicao)
            .map(escola => aprovarSubstituicao(escola.substituicao.id))
        )
      );

      const sucessos = resultados.filter(r => r.status === 'fulfilled').length;
      const erros = resultados.filter(r => r.status === 'rejected').length;

      if (erros > 0) {
        toast.error(`${sucessos} substituições aprovadas com sucesso, ${erros} falharam`);
      } else {
        toast.success('Análise aprovada com sucesso!');
        setAjustesAtivados(false); // Reset para mostrar que foi aprovado
      }
    } catch (error) {
      toast.error(`Erro ao aprovar análise: ${error.message}`);
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
        filtros={filtros}
        loading={loading}
        onFiltroChange={atualizarFiltros}
        onLimparFiltros={limparFiltros}
      />

      {/* Ações (Botões de Exportar e Aprovar) */}
      {necessidades.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Produtos para Aprovação ({necessidades.length})
            </h2>
            <div className="flex items-center gap-2">
              <ExportButtons
                onExportXLSX={() => console.log('Export XLSX')}
                onExportPDF={() => console.log('Export PDF')}
                size="sm"
                variant="outline"
                showLabels={true}
              />
              <Button
                variant="success"
                size="sm"
                onClick={handleAprovarAnalise}
                disabled={salvandoAjustes}
                icon={<FaCheckCircle />}
              >
                {salvandoAjustes ? 'Aprovando...' : 'Aprovar'}
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
        <SubstituicoesTableCoordenacao
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
      {!loading && necessidades.length === 0 && filtros.grupo && filtros.semana_abastecimento && (
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
      {!loading && necessidades.length === 0 && (!filtros.grupo || !filtros.semana_abastecimento) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <FaExchangeAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Selecione os filtros para buscar necessidades
          </h3>
          <p className="text-gray-600">
            Selecione o <strong>Grupo de Produtos</strong> e a <strong>Semana de Abastecimento</strong> para visualizar as necessidades liberadas para coordenação.
          </p>
        </div>
      )}
    </>
  );
};

export default AnaliseCoordenacao;
