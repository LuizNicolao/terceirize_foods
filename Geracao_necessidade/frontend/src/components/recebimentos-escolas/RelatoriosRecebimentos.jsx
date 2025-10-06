import React, { useState, useEffect } from 'react';
import { FaDownload, FaChartBar, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import Button from '../ui/Button';
import { SearchableSelect } from '../ui';
import { Pagination } from '../shared';
import useRecebimentosRelatorios from '../../hooks/useRecebimentosRelatorios';
import useEscolas from '../../hooks/useEscolas';
import { useAuth } from '../../contexts/AuthContext';
import { formatarDataParaExibicao } from '../../utils/recebimentosUtils';
import StatusEntregaTab from './StatusEntregaTab';
import { useSemanasAbastecimento } from '../../hooks/useSemanasAbastecimento';
import toast from 'react-hot-toast';

const RelatoriosRecebimentos = () => {
  const { user } = useAuth();
  
  // Verificar se é nutricionista
  const isNutricionista = user?.tipo_usuario === 'Nutricionista';
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
  const { escolas, carregarEscolas, carregarTodasEscolas } = useEscolas();
  const { opcoes: opcoesSemanas, obterValorPadrao } = useSemanasAbastecimento();
  
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
  
  const [dadosRelatorios, setDadosRelatorios] = useState({
    pendencias: null,
    completos: null,
    dashboard: null
  });

  // Estado para controle de inicialização
  const [inicializado, setInicializado] = useState(false);

  const tiposEntrega = [
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
          setDadosRelatorios(prev => ({ ...prev, pendencias: dados }));
          break;
        case 'completos':
          dados = await carregarRelatorioCompletos(filtrosAtivos);
          setDadosRelatorios(prev => ({ ...prev, completos: dados }));
          break;
        case 'dashboard':
          dados = await carregarDashboard(filtrosAtivos);
          setDadosRelatorios(prev => ({ ...prev, dashboard: dados }));
          break;
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  // Carregar escolas e dados iniciais quando o componente montar
  useEffect(() => {
    carregarTodasEscolas(); // Usar carregarTodasEscolas para dropdown sem limitação
    // Carregar dados iniciais apenas se não for nutricionista
    if (!isNutricionista) {
      carregarDadosIniciais();
    }
  }, []);

  // Inicializar filtro de semana com a semana atual (apenas na primeira carga)
  // REMOVIDO: Não inicializar filtros automaticamente para mostrar todos os dados

  useEffect(() => {
    if (activeTab && !isNutricionista) {
      carregarDados(activeTab);
    }
  }, [activeTab, filtrosDashboard, filtrosPendencias, filtrosCompletos]);

  // Recarregar dados quando a paginação mudar
  useEffect(() => {
    if (activeTab === 'pendencias' && !isNutricionista) {
      carregarDados('pendencias');
    }
  }, [paginationPendencias.currentPage, paginationPendencias.itemsPerPage]);

  useEffect(() => {
    if (activeTab === 'completos' && !isNutricionista) {
      carregarDados('completos');
    }
  }, [paginationCompletos.currentPage, paginationCompletos.itemsPerPage]);

  const exportarExcel = (dados, nomeArquivo, tipoRelatorio = 'pendencias') => {
    try {
      if (!dados || dados.length === 0) {
        toast.error('Nenhum dado para exportar');
        return;
      }

      let dadosExcel;

      if (tipoRelatorio === 'pendencias') {
        // Preparar dados para Excel - Pendências (uma linha por produto)
        dadosExcel = dados.map(item => ({
          'Escola': item.nome_escola,
          'Rota': item.rota,
          'Data': new Date(item.data_recebimento).toLocaleDateString('pt-BR'),
          'Tipo Entrega': item.tipo_entrega,
          'Nutricionista': item.nutricionista_nome,
          'Produto': item.produto_nome || 'Nenhum produto registrado',
          'Quantidade': item.produto_quantidade ? parseFloat(item.produto_quantidade) : 0,
          'Unidade': item.produto_unidade || ''
        }));
      } else {
        // Preparar dados para Excel - Completos (mantém formato original)
        dadosExcel = dados.map(item => ({
          'Escola': item.nome_escola,
          'Rota': item.rota,
          'Data': new Date(item.data_recebimento).toLocaleDateString('pt-BR'),
          'Tipo Entrega': item.tipo_entrega,
          'Nutricionista': item.nutricionista_nome,
          'Pendência Anterior': item.pendencia_anterior ? 'Sim' : 'Não',
          'Observações': item.observacoes || ''
        }));
      }

      // Criar workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(dadosExcel);

      // Ajustar largura das colunas baseado no tipo
      let colWidths;
      if (tipoRelatorio === 'pendencias') {
        colWidths = [
          { wch: 30 }, // Escola
          { wch: 15 }, // Rota
          { wch: 12 }, // Data
          { wch: 15 }, // Tipo Entrega
          { wch: 20 }, // Nutricionista
          { wch: 25 }, // Produto
          { wch: 12 }, // Quantidade
          { wch: 10 }  // Unidade
        ];
      } else {
        colWidths = [
          { wch: 30 }, // Escola
          { wch: 15 }, // Rota
          { wch: 12 }, // Data
          { wch: 15 }, // Tipo Entrega
          { wch: 20 }, // Nutricionista
          { wch: 15 }, // Pendência Anterior
          { wch: 30 }  // Observações
        ];
      }
      ws['!cols'] = colWidths;

      // Adicionar worksheet ao workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Relatório');

      // Gerar nome do arquivo com data
      const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
      const nomeArquivoCompleto = `${nomeArquivo}_${dataAtual}.xlsx`;

      // Fazer download
      XLSX.writeFile(wb, nomeArquivoCompleto);
      
      toast.success(`Arquivo ${nomeArquivoCompleto} baixado com sucesso!`);
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      toast.error('Erro ao exportar arquivo Excel');
    }
  };

  const limparFiltros = (aba) => {
    switch (aba) {
      case 'dashboard':
        setFiltrosDashboard({
          tipo_entrega: '',
          rota: '',
          semana_abastecimento: ''
        });
        break;
      case 'pendencias':
        setFiltrosPendencias({
          tipo_entrega: '',
          rota: '',
          semana_abastecimento: ''
        });
        break;
      case 'completos':
        setFiltrosCompletos({
          tipo_entrega: '',
          rota: '',
          semana_abastecimento: ''
        });
        break;
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
              onClick={() => limparFiltros(aba)}
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
              options={rotasDisponiveis?.map(rota => ({ value: rota, label: rota })) || []}
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

  const renderDashboard = () => {
    const { dashboard } = dadosRelatorios;
    if (!dashboard) return <div>Carregando dashboard...</div>;

    const { metricas, porTipoEntrega, porRota } = dashboard;

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
                <p className="text-2xl font-bold text-gray-900">{metricas.total_recebimentos}</p>
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
                <p className="text-2xl font-bold text-gray-900">{metricas.escolas_completas}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FaExclamationTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Escolas com Pendências</p>
                <p className="text-2xl font-bold text-gray-900">{metricas.escolas_parciais}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaChartBar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Escolas</p>
                <p className="text-2xl font-bold text-gray-900">{metricas.total_escolas}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabelas de Resumo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Por Tipo de Entrega</h3>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Completos</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Parciais</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {porTipoEntrega.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.tipo_entrega}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.total}</td>
                        <td className="px-4 py-2 text-sm text-green-600">{item.completos}</td>
                        <td className="px-4 py-2 text-sm text-yellow-600">{item.parciais}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Por Rota</h3>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rota</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Completos</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Parciais</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {porRota.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.rota}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.total_recebimentos}</td>
                        <td className="px-4 py-2 text-sm text-green-600">{item.completos}</td>
                        <td className="px-4 py-2 text-sm text-yellow-600">{item.parciais}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    );
  };

  const renderPendencias = () => {
    const { pendencias } = dadosRelatorios;
    if (!pendencias) return <div>Carregando pendências...</div>;

    const { pendencias: dados, metricas } = pendencias;

    return (
      <div>
        {renderFiltrosAba('pendencias', filtrosPendencias)}
        <div className="space-y-6">
        {/* Dashboard de Pendências */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            📊 Dashboard de Pendências
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">🏫</span>
                <p className="text-sm font-medium text-yellow-800">Escolas com Pendências</p>
              </div>
              <p className="text-3xl font-bold text-yellow-600">{metricas.escolasComPendencias}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">✅</span>
                <p className="text-sm font-medium text-green-800">Escolas sem Pendência</p>
              </div>
              <p className="text-3xl font-bold text-green-600">{metricas.escolasSemPendencia}</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">📦</span>
                <p className="text-sm font-medium text-blue-800">Total de Registros</p>
              </div>
              <p className="text-3xl font-bold text-blue-600">{metricas.totalRegistros}</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">📊</span>
                <p className="text-sm font-medium text-purple-800">Total Escolas na Base</p>
              </div>
              <p className="text-3xl font-bold text-purple-600">{metricas.totalEscolasBase}</p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">📈</span>
                <p className="text-sm font-medium text-orange-800">% com Pendência</p>
              </div>
              <p className="text-3xl font-bold text-orange-600">{metricas.percentualPendencia}%</p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <Button
              onClick={() => exportarExcel(dados, 'pendencias', 'pendencias')}
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
              Detalhamento das Pendências ({paginationPendencias.totalItems || dados.length})
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
                {dados.map((item, index) => (
                  <tr key={`${item.id}-${index}`} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">{item.nome_escola}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.rota}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {formatarDataParaExibicao(item.data_recebimento)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.tipo_entrega}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.nutricionista_nome}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {item.produto_nome ? (
                        <span className="font-medium text-yellow-800">{item.produto_nome}</span>
                      ) : (
                        <span className="text-gray-400 italic">Nenhum produto</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {item.produto_quantidade ? (
                        <span className="font-medium">{parseFloat(item.produto_quantidade).toFixed(3)}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {item.produto_unidade ? (
                        <span className="text-gray-600">{item.produto_unidade}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Paginação */}
          {paginationPendencias && paginationPendencias.totalPages > 0 && (
            <Pagination
              currentPage={paginationPendencias.currentPage}
              totalPages={paginationPendencias.totalPages}
              totalItems={paginationPendencias.totalItems}
              itemsPerPage={paginationPendencias.itemsPerPage}
              hasNextPage={paginationPendencias.hasNextPage}
              hasPrevPage={paginationPendencias.hasPrevPage}
              onPageChange={setPagePendencias}
              onLimitChange={setLimitPendencias}
              loading={loading}
            />
          )}
        </div>
        </div>
      </div>
    );
  };

  const renderCompletos = () => {
    const { completos } = dadosRelatorios;
    if (!completos) return <div>Carregando completos...</div>;

    const { completos: dados, metricas } = completos;

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
              <p className="text-3xl font-bold text-green-600">{metricas.escolasCompletas}</p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">⚠️</span>
                <p className="text-sm font-medium text-yellow-800">Escolas Incompletas</p>
              </div>
              <p className="text-3xl font-bold text-yellow-600">{metricas.escolasIncompletas}</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">📊</span>
                <p className="text-sm font-medium text-purple-800">Total Escolas na Base</p>
              </div>
              <p className="text-3xl font-bold text-purple-600">{metricas.totalEscolasBase}</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">📈</span>
                <p className="text-sm font-medium text-blue-800">% Completas</p>
              </div>
              <p className="text-3xl font-bold text-blue-600">{metricas.percentualCompleto}%</p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <Button
              onClick={() => exportarExcel(dados, 'completos', 'completos')}
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
              Detalhamento dos Completos ({paginationCompletos.totalItems || dados.length})
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
                {dados.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.nome_escola}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.rota}</td>
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
          {paginationCompletos && paginationCompletos.totalPages > 0 && (
            <Pagination
              currentPage={paginationCompletos.currentPage}
              totalPages={paginationCompletos.totalPages}
              totalItems={paginationCompletos.totalItems}
              itemsPerPage={paginationCompletos.itemsPerPage}
              hasNextPage={paginationCompletos.hasNextPage}
              hasPrevPage={paginationCompletos.hasPrevPage}
              onPageChange={setPageCompletos}
              onLimitChange={setLimitCompletos}
              loading={loading}
            />
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
