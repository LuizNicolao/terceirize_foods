import React, { useState, useEffect } from 'react';
import { FaEye, FaEdit, FaCheck, FaTimes, FaClipboardList } from 'react-icons/fa';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useNecessidades } from '../../hooks/useNecessidades';
import { useNecessidadesFilters } from '../../hooks/useNecessidadesFilters';
import {
  NecessidadesLayout,
  NecessidadesActions,
  NecessidadesLoading,
  NecessidadesStats,
  NecessidadesFilters,
  StatusBadge
} from '../../components/necessidades';
import { ActionButtons, Modal } from '../../components/ui';
import { ExportButtons } from '../../components/shared';
import toast from 'react-hot-toast';

const AnaliseNecessidades = () => {
  const { canView, canEdit, loading: permissionsLoading } = usePermissions();
  const [modalAjusteAberto, setModalAjusteAberto] = useState(false);
  const [necessidadeSelecionada, setNecessidadeSelecionada] = useState(null);
  const [ajusteForm, setAjusteForm] = useState({
    observacoes: '',
    status: 'NEC'
  });
  
  // Hook para gerenciar necessidades
  const {
    necessidades,
    escolas,
    grupos,
    loading,
    error,
    carregarNecessidades,
    atualizarNecessidade
  } = useNecessidades();

  // Hook para filtros
  const {
    filtros,
    updateFiltros,
    clearFiltros
  } = useNecessidadesFilters();

  // Verificar permissões específicas
  const canViewNecessidades = canView('necessidades');
  const canEditNecessidades = canEdit('necessidades');

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
            Você não tem permissão para visualizar a análise de necessidades.
          </p>
        </div>
      </NecessidadesLayout>
    );
  }

  // Handler para abrir modal de ajuste
  const handleAbrirAjuste = (necessidade) => {
    setNecessidadeSelecionada(necessidade);
    setAjusteForm({
      observacoes: necessidade.observacoes || '',
      status: necessidade.status || 'NEC NUTRI'
    });
    setModalAjusteAberto(true);
  };

  // Handler para salvar ajuste
  const handleSalvarAjuste = async () => {
    if (!necessidadeSelecionada) return;

    try {
      const resultado = await atualizarNecessidade(necessidadeSelecionada.id, {
        observacoes: ajusteForm.observacoes,
        status: ajusteForm.status
      });

      if (resultado.success) {
        toast.success('Necessidade atualizada com sucesso!');
        setModalAjusteAberto(false);
        carregarNecessidades(filtros);
      } else {
        toast.error(resultado.error || 'Erro ao atualizar necessidade');
      }
    } catch (error) {
      console.error('Erro ao atualizar necessidade:', error);
      toast.error('Erro ao atualizar necessidade');
    }
  };

  // Filtrar necessidades por status
  const necessidadesFiltradas = necessidades.filter(nec => 
    nec.status === 'NEC' || nec.status === 'EM_ANALISE'
  );

  return (
    <>
      <NecessidadesLayout>
        {/* Título da página */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Análise de Necessidades</h1>
          <p className="text-gray-600 mt-1">
            Analise e ajuste as necessidades criadas pelas nutricionistas
          </p>
        </div>

        {/* Filtros */}
        <NecessidadesFilters
          escolas={escolas}
          grupos={grupos}
          filtros={filtros}
          onFilterChange={updateFiltros}
          onClearFilters={clearFiltros}
          loading={loading}
        />

        {/* Estatísticas */}
        <NecessidadesStats
          produtos={necessidadesFiltradas}
          escola={filtros.escola}
          grupo={filtros.grupo}
          data={filtros.data}
        />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Lista de Necessidades para Análise */}
        {necessidadesFiltradas && necessidadesFiltradas.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Necessidades para Análise ({necessidadesFiltradas.length} produtos)
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {(() => {
                // Agrupar necessidades por escola e data
                const agrupadas = necessidadesFiltradas.reduce((acc, necessidade) => {
                  const chave = `${necessidade.escola}-${necessidade.semana_consumo}`;
                  if (!acc[chave]) {
                    acc[chave] = {
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
                        <div className="mt-2">
                          <StatusBadge status={grupo.produtos[0]?.status || 'NEC'} />
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                          {grupo.produtos.length} produtos
                        </span>
                        {canEditNecessidades && (
                          <button
                            onClick={() => handleAbrirAjuste(grupo.produtos[0])}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <FaEdit className="mr-2 h-4 w-4" />
                            Analisar
                          </button>
                        )}
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

                    {/* Lista de produtos */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Produto
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ajuste
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {grupo.produtos.map((produto) => (
                            <tr key={produto.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {produto.produto}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {produto.produto_unidade}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                                {Number(produto.ajuste).toFixed(3).replace('.', ',')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <StatusBadge status={produto.status} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

        {/* Mensagem quando não há necessidades */}
        {necessidadesFiltradas && necessidadesFiltradas.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <FaClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma necessidade para análise
            </h3>
            <p className="text-gray-600">
              Não há necessidades com status "NEC" ou "EM_ANALISE" para análise.
            </p>
          </div>
        )}
      </NecessidadesLayout>

      {/* Modal de Ajuste */}
      <Modal
        isOpen={modalAjusteAberto}
        onClose={() => setModalAjusteAberto(false)}
        title="Analisar Necessidade"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Escola
            </label>
            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
              {necessidadeSelecionada?.escola}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={ajusteForm.status}
              onChange={(e) => setAjusteForm({ ...ajusteForm, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="NEC">Criada pela Nutricionista</option>
              <option value="EM_ANALISE">Em Análise</option>
              <option value="APROVADA">Aprovada</option>
              <option value="REJEITADA">Rejeitada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              value={ajusteForm.observacoes}
              onChange={(e) => setAjusteForm({ ...ajusteForm, observacoes: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite suas observações sobre esta necessidade..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setModalAjusteAberto(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              onClick={handleSalvarAjuste}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaCheck className="mr-2 h-4 w-4 inline" />
              Salvar Análise
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AnaliseNecessidades;
