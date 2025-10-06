import React, { useState, useEffect } from 'react';
import { FaDownload, FaChartBar, FaExclamationTriangle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { Button, SearchableSelect, Pagination } from '../ui';
import useRecebimentosEscolas from '../../hooks/useRecebimentosEscolas';
import useRecebimentosRelatorios from '../../hooks/useRecebimentosRelatorios';
import { useAuth } from '../../contexts/AuthContext';
import { useSemanasAbastecimento } from '../../hooks/useSemanasAbastecimento';
import toast from 'react-hot-toast';
import StatusEntregaTab from './StatusEntregaTab';

// Função auxiliar para formatação de data
const formatarDataParaExibicao = (data) => {
  if (!data) return '';
  const date = new Date(data);
  return date.toLocaleDateString('pt-BR');
};

const RelatoriosRecebimentos = () => {
  const { user } = useAuth();
  
  // Verificar se é nutricionista
  const isNutricionista = user?.tipo_de_acesso === 'nutricionista';
  
  // Hooks principais - usando hooks do implantacao
  const { 
    recebimentos,
    escolas,
    carregarEscolas
  } = useRecebimentosEscolas();
  
  const { 
    carregarRelatorioPendencias, 
    carregarRelatorioCompletos, 
    carregarDashboard, 
    carregarDadosIniciais,
    obterDadosComPaginacao,
    loading,
    paginationPendencias,
    paginationCompletos,
    setPagePendencias,
    setLimitPendencias,
    setPageCompletos,
    setLimitCompletos,
    dadosPendencias,
    dadosCompletos,
    dadosDashboard
  } = useRecebimentosRelatorios();
  
  const { opcoes: opcoesSemanas, obterValorPadrao } = useSemanasAbastecimento();
  
  // Estados locais
  const [activeTab, setActiveTab] = useState(isNutricionista ? 'status-entrega' : 'dashboard');
  
  // Filtros específicos por aba
  const [filtrosDashboard, setFiltrosDashboard] = useState({
    tipo_entrega: '',
    rota: '',
    semana_abastecimento: ''
  });
  
  const [filtrosPendencias, setFiltrosPendencias] = useState({
    tipo_entrega: '',
    rota: '',
    semana_abastecimento: ''
  });
  
  const [filtrosCompletos, setFiltrosCompletos] = useState({
    tipo_entrega: '',
    rota: '',
    semana_abastecimento: ''
  });
  
  // Estado para controle de inicialização
  const [inicializado, setInicializado] = useState(false);

  // Inicializar filtros com semana atual
  useEffect(() => {
    const semanaPadrao = obterValorPadrao();
    if (semanaPadrao && !inicializado) {
      setFiltrosDashboard(prev => ({ ...prev, semana_abastecimento: semanaPadrao }));
      setFiltrosPendencias(prev => ({ ...prev, semana_abastecimento: semanaPadrao }));
      setFiltrosCompletos(prev => ({ ...prev, semana_abastecimento: semanaPadrao }));
      setInicializado(true);
    }
  }, [obterValorPadrao, inicializado]);

  const tiposEntrega = [
    { value: '', label: 'Selecione um tipo...' },
    { value: 'HORTI', label: 'HORTI' },
    { value: 'PAO', label: 'PÃO' },
    { value: 'PERECIVEL', label: 'PERECÍVEL' },
    { value: 'BASE SECA', label: 'BASE SECA' },
    { value: 'LIMPEZA', label: 'LIMPEZA' }
  ];

  const rotasDisponiveis = [...new Set(escolas.map(e => e.rota).filter(Boolean))];

  const handleFiltroChange = (aba, campo, valor) => {
    switch (aba) {
      case 'dashboard':
        setFiltrosDashboard(prev => ({ ...prev, [campo]: valor }));
        break;
      case 'pendencias':
        setFiltrosPendencias(prev => ({ ...prev, [campo]: valor }));
        break;
      case 'completos':
        setFiltrosCompletos(prev => ({ ...prev, [campo]: valor }));
        break;
    }
  };

  const carregarDados = async (tipo) => {
    try {
      let dados;
      let filtrosAtivos;
      
      // Determinar filtros ativos baseado na aba
      switch (tipo) {
        case 'dashboard':
          filtrosAtivos = filtrosDashboard;
          break;
        case 'pendencias':
          filtrosAtivos = filtrosPendencias;
          break;
        case 'completos':
          filtrosAtivos = filtrosCompletos;
          break;
        default:
          filtrosAtivos = {};
      }
      
      // Verificar se há filtros ativos
      const temFiltrosAtivos = Object.values(filtrosAtivos).some(valor => valor !== '');
      
      // Sempre carregar do servidor para garantir dados atualizados
      switch (tipo) {
        case 'pendencias':
          dados = await carregarRelatorioPendencias(filtrosAtivos);
          break;
        case 'completos':
          dados = await carregarRelatorioCompletos(filtrosAtivos);
          break;
        case 'dashboard':
          dados = await carregarDashboard(filtrosAtivos);
          break;
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    }
  };

  const exportarRelatorio = (formato) => {
    if (formato === 'xlsx') {
      // TODO: Implementar exportação XLSX específica por relatório
      toast('Funcionalidade de exportação XLSX em desenvolvimento...', { icon: 'ℹ️' });
    } else {
      // TODO: Implementar exportação PDF específica por relatório
      toast('Funcionalidade de exportação PDF em desenvolvimento...', { icon: 'ℹ️' });
    }
  };

  const exportarExcel = (dados, tipo, nomeArquivo) => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(dados);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');
      
      const nomeArquivoFinal = `${nomeArquivo}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`;
      XLSX.writeFile(workbook, nomeArquivoFinal);
      
      toast.success(`Arquivo ${nomeArquivoFinal} baixado com sucesso!`);
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      toast.error('Erro ao exportar arquivo Excel');
    }
  };

  const renderFiltrosAba = (aba, filtrosAtivos) => {
    // Verificar se há filtros ativos
    const temFiltrosAtivos = Object.values(filtrosAtivos).some(valor => valor !== '');

  return (
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">🔍 Filtros</h3>
          {temFiltrosAtivos && (
          <Button
              onClick={() => {
                switch (aba) {
                  case 'dashboard':
                    setFiltrosDashboard({ tipo_entrega: '', rota: '', semana_abastecimento: obterValorPadrao() });
                    break;
                  case 'pendencias':
                    setFiltrosPendencias({ tipo_entrega: '', rota: '', semana_abastecimento: obterValorPadrao() });
                    break;
                  case 'completos':
                    setFiltrosCompletos({ tipo_entrega: '', rota: '', semana_abastecimento: obterValorPadrao() });
                    break;
                }
              }}
            variant="outline"
            size="sm"
            disabled={loading}
          >
              Limpar Filtros
          </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <SearchableSelect
              label="Tipo de Entrega"
              value={filtrosAtivos.tipo_entrega}
              onChange={(value) => handleFiltroChange(aba, 'tipo_entrega', value)}
              options={tiposEntrega}
              placeholder="Selecione um tipo..."
              disabled={loading}
            />
          </div>
          
          <div>
            <SearchableSelect
              label="Rota"
              value={filtrosAtivos.rota}
              onChange={(value) => handleFiltroChange(aba, 'rota', value)}
              options={[]} // TODO: Implementar rotas
              placeholder="Selecione uma rota..."
              disabled={loading}
            />
          </div>
          
          <div>
            <SearchableSelect
              label="Semana de Abastecimento (AB)"
              value={filtrosAtivos.semana_abastecimento}
              onChange={(value) => handleFiltroChange(aba, 'semana_abastecimento', value)}
              options={opcoesSemanas || []}
              placeholder="Selecione uma semana..."
              disabled={loading}
            />
          </div>
        </div>
      </div>
    );
  };

  // Carregar escolas e dados iniciais quando o componente montar
  useEffect(() => {
    if (user) {
      const tipoUsuario = user.tipo_de_acesso;
      carregarEscolas(tipoUsuario, user.id);
    }
    // Carregar dados iniciais apenas se não for nutricionista
    if (!isNutricionista) {
      carregarDadosIniciais();
    }
  }, []);

  useEffect(() => {
    if (activeTab && !isNutricionista) {
      carregarDados(activeTab);
    }
  }, [activeTab, filtrosDashboard, filtrosPendencias, filtrosCompletos]);

  const renderDashboard = () => {
    if (!dadosDashboard) return <div>Carregando dashboard...</div>;

    const { metricas, porTipoEntrega, porRota } = dadosDashboard;

    return (
      <div>
        {renderFiltrosAba('dashboard', filtrosDashboard)}
        <div className="space-y-6">
          {/* Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
                  <FaChartBar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Recebimentos</p>
                  <p className="text-2xl font-bold text-gray-900">{metricas.total_recebimentos || 0}</p>
            </div>
          </div>
        </div>
        
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
                  <FaCheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Escolas Completas</p>
                  <p className="text-2xl font-bold text-gray-900">{metricas.escolas_completas || 0}</p>
            </div>
          </div>
        </div>
        
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
                  <FaExclamationTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recebimentos Parciais</p>
                  <p className="text-2xl font-bold text-gray-900">{metricas.recebimentos_parciais || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <FaTimesCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Com Pendência Anterior</p>
                  <p className="text-2xl font-bold text-gray-900">{metricas.escolas_parciais || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gráficos e Tabelas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico por Tipo de Entrega */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recebimentos por Tipo de Entrega</h3>
              {porTipoEntrega && porTipoEntrega.length > 0 ? (
                <div className="space-y-4">
                  {porTipoEntrega.map((item, index) => {
                    const maxValue = Math.max(...porTipoEntrega.map(i => i.total));
                    const percentage = maxValue > 0 ? (item.total / maxValue) * 100 : 0;
                    const cores = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'];
                    const cor = cores[index % cores.length];
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">{item.tipo_entrega}</span>
                          <span className="text-sm text-gray-600">{item.total}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`${cor} h-3 rounded-full transition-all duration-500 ease-out`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Completos: {item.completos}</span>
                          <span>Parciais: {item.parciais}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-gray-500">
                  Nenhum dado disponível
        </div>
              )}
            </div>

            {/* Gráfico por Rota */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recebimentos por Rota</h3>
              {porRota && porRota.length > 0 ? (
                <div className="space-y-4">
                  {porRota.slice(0, 8).map((item, index) => {
                    const maxValue = Math.max(...porRota.map(i => i.total_recebimentos));
                    const percentage = maxValue > 0 ? (item.total_recebimentos / maxValue) * 100 : 0;
                    const cores = ['bg-indigo-500', 'bg-pink-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-rose-500', 'bg-violet-500'];
                    const cor = cores[index % cores.length];
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700 truncate">{item.rota || 'Sem Rota'}</span>
                          <span className="text-sm text-gray-600">{item.total_recebimentos}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`${cor} h-3 rounded-full transition-all duration-500 ease-out`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Completos: {item.completos}</span>
                          <span>Parciais: {item.parciais}</span>
                        </div>
                      </div>
                    );
                  })}
                  {porRota.length > 8 && (
                    <div className="text-center text-sm text-gray-500 pt-2">
                      ... e mais {porRota.length - 8} rotas
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-gray-500">
                  Nenhum dado disponível
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPendencias = () => {
    if (!dadosPendencias) return <div>Carregando pendências...</div>;

    const { pendencias, metricas } = dadosPendencias;

    return (
      <div>
        {renderFiltrosAba('pendencias', filtrosPendencias)}
        <div className="space-y-6">
          {/* Dashboard de Pendências */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              ⚠️ Dashboard de Pendências
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">❌</span>
                  <p className="text-sm font-medium text-red-800">Total de Pendências</p>
                </div>
                <p className="text-3xl font-bold text-red-600">{metricas.totalPendencias || 0}</p>
      </div>

              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">📦</span>
                  <p className="text-sm font-medium text-orange-800">Produtos Pendentes</p>
                </div>
                <p className="text-3xl font-bold text-orange-600">{metricas.produtosPendentes || 0}</p>
      </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">📊</span>
                  <p className="text-sm font-medium text-purple-800">Escolas com Pendência</p>
                </div>
                <p className="text-3xl font-bold text-purple-600">{metricas.escolasComPendencia || 0}</p>
      </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">📈</span>
                  <p className="text-sm font-medium text-blue-800">% Pendências</p>
                </div>
                <p className="text-3xl font-bold text-blue-600">{metricas.percentualPendencias || 0}%</p>
              </div>
        </div>
        
            <div className="mt-6 flex justify-center">
              <Button
                onClick={() => exportarExcel(pendencias, 'pendencias', 'pendencias')}
                className="px-8 py-3"
                variant="primary"
              >
                <FaDownload className="w-4 h-4 mr-2" />
                Exportar Excel
              </Button>
            </div>
          </div>

          {/* Tabela de Pendências */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Detalhamento das Pendências ({pendencias.length})
              </h3>
            </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Escola</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rota</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo Entrega</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nutricionista</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantidade</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unidade</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                  {pendencias.map((item, index) => (
                    <tr key={`pendencias-${item.id}-${index}-${item.produto_nome || 'no-product'}`}>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.escola_nome}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.escola_rota}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {formatarDataParaExibicao(item.data_recebimento)}
                    </td>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.tipo_entrega}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.nutricionista_nome}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.produto_nome || 'Nenhum produto registrado'}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.produto_quantidade ? parseFloat(item.produto_quantidade).toFixed(3) : '0.000'}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.produto_unidade || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
            
            {/* Paginação */}
            {paginationPendencias && paginationPendencias.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <Pagination
                  currentPage={paginationPendencias.currentPage}
                  totalPages={paginationPendencias.totalPages}
                  onPageChange={setPagePendencias}
                  totalItems={paginationPendencias.totalItems}
                  itemsPerPage={paginationPendencias.itemsPerPage}
                  onItemsPerPageChange={setLimitPendencias}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCompletos = () => {
    if (!dadosCompletos) return <div>Carregando completos...</div>;

    const { completos, metricas } = dadosCompletos;

    return (
      <div>
        {renderFiltrosAba('completos', filtrosCompletos)}
        <div className="space-y-6">
          {/* Dashboard de Completos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              ✅ Dashboard de Completos
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">✅</span>
                  <p className="text-sm font-medium text-green-800">Escolas Completas</p>
                </div>
                <p className="text-3xl font-bold text-green-600">{metricas.escolasCompletas || 0}</p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">⚠️</span>
                  <p className="text-sm font-medium text-yellow-800">Escolas Incompletas</p>
                </div>
                <p className="text-3xl font-bold text-yellow-600">{metricas.escolasIncompletas || 0}</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">📊</span>
                  <p className="text-sm font-medium text-purple-800">Total Escolas na Base</p>
                </div>
                <p className="text-3xl font-bold text-purple-600">{metricas.totalEscolasBase || 0}</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">📈</span>
                  <p className="text-sm font-medium text-blue-800">% Completas</p>
                </div>
                <p className="text-3xl font-bold text-blue-600">{metricas.percentualCompleto || 0}%</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <Button
                onClick={() => exportarExcel(completos, 'completos', 'completos')}
                className="px-8 py-3"
                variant="primary"
              >
                <FaDownload className="w-4 h-4 mr-2" />
                Exportar Excel
              </Button>
            </div>
          </div>

          {/* Tabela de Completos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Detalhamento dos Completos ({completos.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Escola</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rota</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo Entrega</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nutricionista</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {completos.map((item, index) => (
                    <tr key={`completos-${item.id}-${index}-${item.escola_id}`}>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.escola_nome}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.escola_rota}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {formatarDataParaExibicao(item.data_recebimento)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.tipo_entrega}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.nutricionista_nome}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Paginação */}
            {paginationCompletos && paginationCompletos.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <Pagination
                  currentPage={paginationCompletos.currentPage}
                  totalPages={paginationCompletos.totalPages}
                  onPageChange={setPageCompletos}
                  totalItems={paginationCompletos.totalItems}
                  itemsPerPage={paginationCompletos.itemsPerPage}
                  onItemsPerPageChange={setLimitCompletos}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">📊 Relatórios de Recebimentos</h2>
        <p className="text-gray-600">Análise e exportação de dados de recebimentos</p>
      </div>

      {/* Tabs de Relatórios */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {!isNutricionista && (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'dashboard'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📊 Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('pendencias')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'pendencias'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  ⚠️ Pendências
                </button>
                <button
                  onClick={() => setActiveTab('completos')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'completos'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  ✅ Completos
                </button>
              </>
            )}
            <button
              onClick={() => setActiveTab('status-entrega')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'status-entrega'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 Status de Entrega
            </button>
          </nav>
        </div>

        <div className="p-6">
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-2 text-gray-600">Carregando dados...</span>
            </div>
          )}

          {!loading && (
            <>
              {!isNutricionista && activeTab === 'dashboard' && renderDashboard()}
              {!isNutricionista && activeTab === 'pendencias' && renderPendencias()}
              {!isNutricionista && activeTab === 'completos' && renderCompletos()}
              {activeTab === 'status-entrega' && <StatusEntregaTab />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RelatoriosRecebimentos;