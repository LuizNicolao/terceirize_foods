import React, { useState, useEffect } from 'react';
import { FaClipboardList } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useNecessidades } from '../../hooks/useNecessidades';
import { useNecessidadesFilters } from '../../hooks/useNecessidadesFilters';
import {
  NecessidadesLayout,
  NecessidadesActions,
  NecessidadesLoading,
  NecessidadesStats,
  NecessidadesFilters,
  NecessidadeModal
} from '../../components/necessidades';
import { ActionButtons, Modal } from '../../components/ui';
import { ExportButtons } from '../../components/shared';
import { formatarDataParaExibicao } from '../../utils/recebimentos/recebimentosUtils';
import toast from 'react-hot-toast';

const Necessidades = () => {
  const { canView, canCreate, loading: permissionsLoading } = usePermissions();
  const [gerando, setGerando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalVisualizacaoAberto, setModalVisualizacaoAberto] = useState(false);
  const [necessidadeSelecionada, setNecessidadeSelecionada] = useState(null);
  
  // Hook para gerenciar necessidades
  const {
    necessidades,
    escolas,
    grupos,
    produtosTabela,
    loading,
    error,
    carregarNecessidades,
    gerarNecessidade,
    exportarXLSX,
    exportarPDF
  } = useNecessidades();

  // Hook para filtros
  const {
    filtros,
    updateFiltros,
    clearFiltros
  } = useNecessidadesFilters();

  // Verificar permissões específicas
  const canViewNecessidades = canView('necessidades');
  const canCreateNecessidades = canCreate('necessidades');

  // Carregar necessidades quando a página for montada ou quando os filtros mudarem
  useEffect(() => {
    if (canViewNecessidades) {
      carregarNecessidades(filtros);
    }
  }, [canViewNecessidades, carregarNecessidades, filtros]);


  // Verificar se pode visualizar
  if (permissionsLoading) {
    return <NecessidadesLoading />;
  }

  if (!canViewNecessidades) {
    return (
      <NecessidadesLayout>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <FaClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acesso Restrito
          </h2>
          <p className="text-gray-600">
            Você não tem permissão para visualizar a geração de necessidades.
          </p>
        </div>
      </NecessidadesLayout>
    );
  }

  // Handler para gerar necessidade
  const handleGerarNecessidade = () => {
    if (!canCreateNecessidades) {
      toast.error('Você não tem permissão para gerar necessidades');
      return;
    }
    setModalAberto(true);
  };

  const handleSalvarNecessidade = async (dados) => {
    setGerando(true);
    try {
      const resultado = await gerarNecessidade(dados);
      if (resultado.success) {
        setModalAberto(false);
        // Recarregar necessidades após gerar
        carregarNecessidades();
      }
      // Toast de sucesso/erro é tratado no hook
    } catch (error) {
      console.error('Erro ao gerar necessidade:', error);
      toast.error('Erro ao gerar necessidade');
    } finally {
      setGerando(false);
    }
  };

  const handleVisualizarNecessidade = (grupo) => {
    setNecessidadeSelecionada(grupo);
    setModalVisualizacaoAberto(true);
  };


  return (
    <>
    <NecessidadesLayout hideHeader={true}>
      {/* Botão de Adicionar */}
      <NecessidadesActions
        canCreate={canCreateNecessidades}
        onAdd={handleGerarNecessidade}
        onShowHelp={() => {}} // TODO: Implementar ajuda
        loading={loading}
      />

      {/* Estatísticas */}
      <NecessidadesStats
        produtos={necessidades}
        escola={filtros.escola}
        grupo={filtros.grupo}
        data={filtros.data}
      />

      {/* Filtros */}
      <NecessidadesFilters
        escolas={escolas}
        grupos={grupos}
        filtros={filtros}
        onFilterChange={updateFiltros}
        onClearFilters={clearFiltros}
        loading={loading}
      />

      {/* Botões de Exportação */}
      <div className="mb-4">
        <ExportButtons
          onExportXLSX={exportarXLSX}
          onExportPDF={exportarPDF}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Lista de Necessidades Agrupadas por Escola */}
      {necessidades && necessidades.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Necessidades Geradas ({necessidades.length} produtos)
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {(() => {
              // Agrupar necessidades por necessidade_id (se disponível) ou por escola e data
              const agrupadas = necessidades.reduce((acc, necessidade) => {
                // Usar necessidade_id se disponível, senão usar escola-data como fallback
                const chave = necessidade.necessidade_id || `${necessidade.escola}-${necessidade.semana_consumo}`;
                if (!acc[chave]) {
                  acc[chave] = {
                    necessidade_id: necessidade.necessidade_id,
                    escola: necessidade.escola,
                    rota: necessidade.escola_rota,
                    data_consumo: necessidade.semana_consumo,
                    data_preenchimento: necessidade.data_preenchimento,
                    produtos: []
                  };
                }
                acc[chave].produtos.push(necessidade);
                return acc;
              }, {});

              return Object.values(agrupadas).map((grupo, index) => (
                <div key={index} className="p-6">
                  {/* Cabeçalho da Escola */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {grupo.escola}
                      </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Rota: {grupo.rota}</span>
                          <span>•</span>
                          <span>Semana de Consumo: {grupo.data_consumo}</span>
                          <span>•</span>
                          <span>Gerado em: {new Date(grupo.data_preenchimento).toLocaleString('pt-BR')}</span>
                        </div>
                        {grupo.necessidade_id && (
                          <div className="mt-1">
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                              ID: {grupo.necessidade_id}
                            </span>
                          </div>
                        )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                        {grupo.produtos.length} produtos
                      </span>
                      <ActionButtons
                        canView={true}
                        onView={handleVisualizarNecessidade}
                        item={grupo}
                        size="sm"
                      />
                    </div>
                  </div>

                  {/* Resumo da Escola */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Total de produtos com ajuste: {grupo.produtos.filter(p => Number(p.ajuste) > 0).length}
                      </span>
                      <span className="font-medium text-gray-900">
                        Soma dos ajustes: {grupo.produtos.reduce((sum, p) => sum + Number(p.ajuste), 0).toFixed(3).replace('.', ',')}
                      </span>
                    </div>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* Mensagem quando não há necessidades */}
      {necessidades && necessidades.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <FaClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma necessidade encontrada
          </h3>
          <p className="text-gray-600">
            Gere uma nova necessidade usando o botão acima.
          </p>
        </div>
      )}
    </NecessidadesLayout>

    <NecessidadeModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSave={handleSalvarNecessidade}
        escolas={escolas}
        grupos={grupos}
        loading={gerando}
      />

      {/* Modal de Visualização */}
      <Modal
        isOpen={modalVisualizacaoAberto}
        onClose={() => setModalVisualizacaoAberto(false)}
        title={`Necessidade - ${necessidadeSelecionada?.escola || ''}`}
        size="xl"
      >
        {necessidadeSelecionada && (
          <div className="space-y-6">
            {/* Informações da Escola */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Escola:</span>
                  <p className="text-gray-900">{necessidadeSelecionada.escola}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Rota:</span>
                  <p className="text-gray-900">{necessidadeSelecionada.rota}</p>
                </div>
                            <div>
                              <span className="font-medium text-gray-700">Semana de Consumo:</span>
                              <p className="text-gray-900">{necessidadeSelecionada.data_consumo}</p>
                            </div>
                <div>
                  <span className="font-medium text-gray-700">Gerado em:</span>
                  <p className="text-gray-900">{new Date(necessidadeSelecionada.data_preenchimento).toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </div>

            {/* Lista de Produtos */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">
                Produtos ({necessidadeSelecionada.produtos.length})
              </h4>
              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produto
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unidade
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ajuste
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {necessidadeSelecionada.produtos.map((produto) => (
                      <tr key={produto.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {produto.produto_nome || produto.produto}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {produto.produto_unidade}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            Number(produto.ajuste) > 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {Number(produto.ajuste).toFixed(3).replace('.', ',')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Resumo */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700">
                  <strong>Total de produtos com ajuste:</strong> {necessidadeSelecionada.produtos.filter(p => Number(p.ajuste) > 0).length}
                </span>
                <span className="text-blue-900 font-semibold">
                  <strong>Soma dos ajustes:</strong> {necessidadeSelecionada.produtos.reduce((sum, p) => sum + Number(p.ajuste), 0).toFixed(3).replace('.', ',')}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default Necessidades;