import React, { useEffect, useState, useMemo } from 'react';
import { FaExchangeAlt } from 'react-icons/fa';
import { useSubstituicoesNecessidades } from '../../hooks/useSubstituicoesNecessidades';
import { SubstituicoesFilters, SubstituicoesTableCoordenacao } from './components';
import { ExportButtons } from '../../components/shared';
import SubstituicoesNecessidadesService from '../../services/substituicoesNecessidades';
import toast from 'react-hot-toast';

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

  const handleSaveConsolidated = async (dados, codigoOrigem) => {
    const response = await salvarSubstituicao(dados);
    return response;
  };

  const handleSaveIndividual = async (dados, escolaId) => {
    const response = await salvarSubstituicao(dados);
    return response;
  };

  const handleExportXLSX = async () => {
    try {
      // Preparar filtros para o backend
      const filtrosExport = {};
      
      if (filtros.grupo) {
        filtrosExport.grupo = typeof filtros.grupo === 'object' ? filtros.grupo.nome || filtros.grupo.id : filtros.grupo;
      }
      
      if (filtros.semana_abastecimento) {
        filtrosExport.semana_abastecimento = filtros.semana_abastecimento;
      }
      
      if (filtros.semana_consumo) {
        filtrosExport.semana_consumo = filtros.semana_consumo;
      }
      
      if (filtros.tipo_rota_id) {
        filtrosExport.tipo_rota_id = typeof filtros.tipo_rota_id === 'object' ? filtros.tipo_rota_id.id : filtros.tipo_rota_id;
      }
      
      if (filtros.rota_id) {
        filtrosExport.rota_id = typeof filtros.rota_id === 'object' ? filtros.rota_id.id : filtros.rota_id;
      }

      const response = await SubstituicoesNecessidadesService.exportarXLSX(filtrosExport);
      
      if (response.success) {
        // Criar blob e fazer download
        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = response.filename || `substituicoes_coordenacao_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('Arquivo XLSX exportado com sucesso!');
      } else {
        toast.error('Erro ao exportar arquivo XLSX');
      }
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      toast.error('Erro ao exportar arquivo XLSX');
    }
  };

  const handleExportPDF = async () => {
    try {
      // Preparar filtros para o backend
      const filtrosExport = {};
      
      if (filtros.grupo) {
        filtrosExport.grupo = typeof filtros.grupo === 'object' ? filtros.grupo.nome || filtros.grupo.id : filtros.grupo;
      }
      
      if (filtros.semana_abastecimento) {
        filtrosExport.semana_abastecimento = filtros.semana_abastecimento;
      }
      
      if (filtros.semana_consumo) {
        filtrosExport.semana_consumo = filtros.semana_consumo;
      }
      
      if (filtros.tipo_rota_id) {
        filtrosExport.tipo_rota_id = typeof filtros.tipo_rota_id === 'object' ? filtros.tipo_rota_id.id : filtros.tipo_rota_id;
      }
      
      if (filtros.rota_id) {
        filtrosExport.rota_id = typeof filtros.rota_id === 'object' ? filtros.rota_id.id : filtros.rota_id;
      }

      const response = await SubstituicoesNecessidadesService.exportarPDF(filtrosExport);
      
      if (response.success) {
        // Criar blob e fazer download
        const blob = new Blob([response.data], {
          type: 'application/pdf'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = response.filename || `substituicoes_coordenacao_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('Arquivo PDF exportado com sucesso!');
      } else {
        toast.error('Erro ao exportar arquivo PDF');
      }
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar arquivo PDF');
    }
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

      {/* Ações (Botões de Exportar) */}
      {necessidades.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Produtos para Substituição ({necessidades.length}) • {totalNecessidades} {totalNecessidades === 1 ? 'necessidade' : 'necessidades'} • {totalEscolas} {totalEscolas === 1 ? 'escola' : 'escolas'}
            </h2>
            <div className="flex items-center gap-2">
              <ExportButtons
                onExportXLSX={handleExportXLSX}
                onExportPDF={handleExportPDF}
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
          onBuscarProdutosGenericos={buscarProdutosGenericos}
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
            Não há necessidades liberadas para coordenação com os filtros selecionados.
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
            Selecione pelo menos um filtro (<strong>Tipo de Rota</strong>, <strong>Grupo de Produtos</strong> ou <strong>Semana de Abastecimento</strong>) para visualizar as necessidades liberadas para coordenação.
          </p>
        </div>
      )}
    </>
  );
};

export default AnaliseCoordenacao;
