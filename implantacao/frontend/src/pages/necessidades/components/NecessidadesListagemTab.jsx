/**
 * Componente da aba de Listagem de Necessidades
 * Exibe a tabela de necessidades com três modos de visualização:
 * - Padrão: Agrupada por necessidade_id
 * - Individual: Cada necessidade individualmente
 * - Consolidado: Agrupada por produto, somando quantidades
 */

import React, { useState, useMemo } from 'react';
import { FaClipboardList } from 'react-icons/fa';
import { Pagination } from '../../../components/ui';
import { ExportButtons } from '../../../components/shared';
import { consolidarNecessidadesListagem } from '../utils/consolidarNecessidadesListagem';
import { useExportListagemNecessidades } from '../hooks/useExportListagemNecessidades';
import ControleVisualizacaoListagem from './listagem/ControleVisualizacaoListagem';
import TabelaPadraoListagem from './listagem/TabelaPadraoListagem';
import TabelaIndividualListagem from './listagem/TabelaIndividualListagem';
import TabelaConsolidadaListagem from './listagem/TabelaConsolidadaListagem';

const NecessidadesListagemTab = ({
  necessidades = [],
  loading = false,
  pagination = null,
  onView = () => {}
}) => {
  // Estado para modo de visualização (padrao, individual, consolidado)
  const [modoVisualizacao, setModoVisualizacao] = useState('padrao');

  // Estado local para paginação (usado apenas para modos Individual e Consolidado)
  const [paginaLocal, setPaginaLocal] = useState(1);
  const [itemsPerPageLocal, setItemsPerPageLocal] = useState(20);

  // Hook de exportação
  const { exportarExcel, exportarPDF } = useExportListagemNecessidades();

  // Processar dados conforme o modo de visualização
  const dadosProcessados = useMemo(() => {
    if (modoVisualizacao === 'padrao') {
  // Agrupar necessidades por necessidade_id (se disponível) ou por escola, data e grupo
  const agrupadas = necessidades.reduce((acc, necessidade) => {
    const chave = necessidade.necessidade_id || `${necessidade.escola}-${necessidade.semana_consumo}-${necessidade.grupo || 'sem-grupo'}`;
    if (!acc[chave]) {
      acc[chave] = {
        necessidade_id: necessidade.necessidade_id,
        escola: necessidade.escola,
        rota: necessidade.escola_rota,
        grupo: necessidade.grupo,
        data_consumo: necessidade.semana_consumo,
        data_abastecimento: necessidade.semana_abastecimento,
        data_preenchimento: necessidade.data_preenchimento,
        status: necessidade.status,
        produtos: []
      };
    }
    acc[chave].produtos.push(necessidade);
    return acc;
  }, {});
      return Object.values(agrupadas);
    } else if (modoVisualizacao === 'consolidado') {
      return consolidarNecessidadesListagem(necessidades);
    } else {
      // Individual: retornar todas as necessidades individualmente
      return necessidades;
    }
  }, [necessidades, modoVisualizacao]);

  // Para modos Individual e Consolidado, aplicar paginação local
  const dadosExibidos = useMemo(() => {
    // Modo padrão usa paginação do backend (dados já vêm paginados)
    if (modoVisualizacao === 'padrao') {
      return dadosProcessados;
    }

    // Modos Individual e Consolidado: paginar localmente
    const startIndex = (paginaLocal - 1) * itemsPerPageLocal;
    const endIndex = startIndex + itemsPerPageLocal;
    return dadosProcessados.slice(startIndex, endIndex);
  }, [dadosProcessados, modoVisualizacao, paginaLocal, itemsPerPageLocal]);

  // Calcular total de páginas para paginação local
  const totalPaginasLocal = useMemo(() => {
    if (modoVisualizacao === 'padrao') {
      return pagination?.totalPages || 1;
    }
    return Math.ceil(dadosProcessados.length / itemsPerPageLocal);
  }, [dadosProcessados.length, modoVisualizacao, itemsPerPageLocal, pagination?.totalPages]);

  // Handler para resetar página quando mudar o modo de visualização
  const handleModoVisualizacaoChange = (modo) => {
    setModoVisualizacao(modo);
    setPaginaLocal(1);
    if (pagination?.handlePageChange) {
      pagination.handlePageChange(1);
    }
  };

  // Handlers para paginação local (modos Individual e Consolidado)
  const handlePageChangeLocal = (novaPagina) => {
    setPaginaLocal(novaPagina);
  };

  const handleItemsPerPageChangeLocal = (novoItemsPerPage) => {
    setItemsPerPageLocal(novoItemsPerPage);
    setPaginaLocal(1); // Resetar para primeira página
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
        <span className="text-gray-600">Carregando necessidades...</span>
      </div>
    );
  }

  if (dadosExibidos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <FaClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Nenhuma necessidade encontrada
        </h3>
        <p className="text-gray-600">
          Gere uma nova necessidade usando o botão acima.
        </p>
      </div>
    );
  }

  // Renderizar a tabela apropriada conforme o modo de visualização
  const renderizarTabela = () => {
    switch (modoVisualizacao) {
      case 'consolidado':
        return <TabelaConsolidadaListagem dados={dadosExibidos} onView={onView} />;
      case 'individual':
        return <TabelaIndividualListagem dados={dadosExibidos} onView={onView} />;
      case 'padrao':
      default:
        return <TabelaPadraoListagem dados={dadosExibidos} onView={onView} />;
    }
  };

  // Handlers de exportação que respeitam o modo de visualização
  // Exportar TODOS os dados processados, não apenas os paginados
  const handleExportarExcel = () => {
    exportarExcel(dadosProcessados, modoVisualizacao);
  };

  const handleExportarPDF = () => {
    exportarPDF(dadosProcessados, modoVisualizacao);
  };

  return (
    <>
      {/* Controles: Visualização e Exportação */}
      <div className="mb-4 flex justify-between items-center">
        <div>
          <ExportButtons
            onExportXLSX={handleExportarExcel}
            onExportPDF={handleExportarPDF}
          />
        </div>
        <ControleVisualizacaoListagem
          modoVisualizacao={modoVisualizacao}
          onModoVisualizacaoChange={handleModoVisualizacaoChange}
          onPageReset={() => {
            if (pagination?.handlePageChange) {
              pagination.handlePageChange(1);
            }
          }}
        />
      </div>

      {/* Tabela de Necessidades */}
      {renderizarTabela()}

      {/* Paginação */}
      {modoVisualizacao === 'padrao' ? (
        // Paginação do backend para modo padrão
        pagination && pagination.totalItems > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={pagination.handlePageChange}
            onItemsPerPageChange={pagination.handleItemsPerPageChange}
          />
        </div>
        )
      ) : (
        // Paginação local para modos Individual e Consolidado
        dadosProcessados.length > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={paginaLocal}
              totalPages={totalPaginasLocal}
              totalItems={dadosProcessados.length}
              itemsPerPage={itemsPerPageLocal}
              onPageChange={handlePageChangeLocal}
              onItemsPerPageChange={handleItemsPerPageChangeLocal}
            />
          </div>
        )
      )}
    </>
  );
};

export default NecessidadesListagemTab;
