import React, { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaTruck, 
  FaBox, 
  FaLayerGroup, 
  FaChartLine, 
  FaExclamationTriangle, 
  FaDollarSign, 
  FaRuler,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaUser,
  FaBuilding,
  FaRoute
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { StatCard, ActivityCard, ChartCard } from '../components/ui';
import DashboardService from '../services/dashboard';

const Dashboard = () => {
  // Estados
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({});
  const [atividades, setAtividades] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [dadosRecentes, setDadosRecentes] = useState({});

  // Carregar dados iniciais
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Carregar dados do dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Delay mínimo para evitar flash
      const startTime = Date.now();
      
      // Carregar dados principais (estatísticas)
      const result = await DashboardService.carregarEstatisticas();
      if (result.success) {
        setDashboardData(result.data);
      } else {
        toast.error(result.error);
      }

      // Carregar atividades recentes
      const atividadesResult = await DashboardService.carregarAtividadesRecentes(5);
      if (atividadesResult.success) {
        setAtividades(atividadesResult.data);
      }

      // Carregar dados recentes
      const recentesResult = await DashboardService.carregarDadosRecentes();
      if (recentesResult.success) {
        setDadosRecentes(recentesResult.data);
      }

      // Carregar alertas
      const alertasResult = await DashboardService.carregarAlertas();
      if (alertasResult.success) {
        setAlertas(alertasResult.data);
      }

      // Garantir que o loading dure pelo menos 500ms
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < 500) {
        await new Promise(resolve => setTimeout(resolve, 500 - elapsedTime));
      }

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Utilitários
  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hoje';
    if (diffDays === 2) return 'Ontem';
    if (diffDays <= 7) return `${diffDays - 1} dias atrás`;
    
    return date.toLocaleDateString('pt-BR');
  };

  const getActivityIcon = (tipo) => {
    const icons = {
      'produto': FaBox,
      'fornecedor': FaTruck,
      'cliente': FaUser,
      'grupo': FaLayerGroup,
      'usuario': FaUsers,
      'filial': FaBuilding,
      'rota': FaRoute,
      'unidade_escolar': FaRuler,
      'motorista': FaUser,
      'ajudante': FaUser,
      'veiculo': FaTruck
    };
    return icons[tipo] || FaChartLine;
  };

  const getActivityColor = (tipo) => {
    const colors = {
      'produto': 'bg-purple-500',
      'fornecedor': 'bg-green-500',
      'cliente': 'bg-blue-500',
      'grupo': 'bg-orange-500',
      'usuario': 'bg-indigo-500',
      'filial': 'bg-teal-500',
      'rota': 'bg-pink-500',
      'unidade_escolar': 'bg-red-500',
      'motorista': 'bg-yellow-500',
      'ajudante': 'bg-gray-500',
      'veiculo': 'bg-cyan-500'
    };
    return colors[tipo] || 'bg-gray-500';
  };

  const getAlertaColor = (nivel) => {
    const colors = {
      'baixo': 'bg-yellow-100 text-yellow-800',
      'medio': 'bg-orange-100 text-orange-800',
      'alto': 'bg-red-100 text-red-800'
    };
    return colors[nivel] || 'bg-gray-100 text-gray-800';
  };

  // Dados de estatísticas do backend
  const statsData = {
    totalUsuarios: dashboardData.usuarios || 0,
    totalVeiculos: dashboardData.veiculos || 0,
    totalProdutos: dashboardData.produtos || 0,
    totalGrupos: dashboardData.grupos || 0,
    totalFiliais: dashboardData.filiais || 0,
    totalRotas: dashboardData.rotas || 0,
    totalMotoristas: dashboardData.motoristas || 0,
    totalUnidadesEscolares: dashboardData.unidades_escolares || 0,
    totalFornecedores: dashboardData.fornecedores || 0,
    totalClientes: dashboardData.clientes || 0,
    totalSubgrupos: dashboardData.subgrupos || 0,
    totalClasses: dashboardData.classes || 0,
    totalMarcas: dashboardData.marcas || 0,
    totalUnidades: dashboardData.unidades || 0,
    totalAjudantes: dashboardData.ajudantes || 0,
    totalNomeGenerico: dashboardData.nome_generico_produto || 0,
    valorEstoque: dashboardData.valorEstoque || 0,
    produtosEstoqueBaixo: dashboardData.produtosEstoqueBaixo || 0,
    produtosSemEstoque: dashboardData.produtosSemEstoque || 0,
    produtosVencendo: dashboardData.produtosVencendo || 0,
    veiculosDocumentacaoVencendo: dashboardData.veiculosDocumentacaoVencendo || 0,
    motoristasCnhVencendo: dashboardData.motoristasCnhVencendo || 0
  };

  // Renderização
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Visão geral do sistema de terceirização de alimentos
        </p>
      </div>

      {/* Cards de Estatísticas - Primeira Linha */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Usuários"
          value={statsData.totalUsuarios}
          subtitle="Total de usuários ativos"
          icon={FaUsers}
          color="bg-blue-500"
        />
        
        <StatCard
          title="Fornecedores"
          value={statsData.totalFornecedores}
          subtitle="Fornecedores ativos"
          icon={FaTruck}
          color="bg-green-500"
        />
        
        <StatCard
          title="Clientes"
          value={statsData.totalClientes}
          subtitle="Clientes ativos"
          icon={FaUser}
          color="bg-purple-500"
        />
        
        <StatCard
          title="Produtos"
          value={statsData.totalProdutos}
          subtitle="Produtos cadastrados"
          icon={FaBox}
          color="bg-orange-500"
        />
      </div>

      {/* Cards de Estatísticas - Segunda Linha */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Grupos"
          value={statsData.totalGrupos}
          subtitle="Grupos de produtos"
          icon={FaLayerGroup}
          color="bg-indigo-500"
        />
        
        <StatCard
          title="Subgrupos"
          value={statsData.totalSubgrupos}
          subtitle="Subgrupos ativos"
          icon={FaLayerGroup}
          color="bg-teal-500"
        />
        
        <StatCard
          title="Classes"
          value={statsData.totalClasses}
          subtitle="Classes ativas"
          icon={FaLayerGroup}
          color="bg-pink-500"
        />
        
        <StatCard
          title="Marcas"
          value={statsData.totalMarcas}
          subtitle="Marcas cadastradas"
          icon={FaBox}
          color="bg-red-500"
        />
      </div>

      {/* Cards de Estatísticas - Terceira Linha */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Filiais"
          value={statsData.totalFiliais}
          subtitle="Filiais ativas"
          icon={FaBuilding}
          color="bg-cyan-500"
        />
        
        <StatCard
          title="Rotas"
          value={statsData.totalRotas}
          subtitle="Rotas configuradas"
          icon={FaRoute}
          color="bg-yellow-500"
        />
        
        <StatCard
          title="Motoristas"
          value={statsData.totalMotoristas}
          subtitle="Motoristas ativos"
          icon={FaUser}
          color="bg-gray-500"
        />
        
        <StatCard
          title="Ajudantes"
          value={statsData.totalAjudantes}
          subtitle="Ajudantes ativos"
          icon={FaUser}
          color="bg-lime-500"
        />
      </div>

      {/* Cards de Estatísticas - Quarta Linha */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Veículos"
          value={statsData.totalVeiculos}
          subtitle="Veículos disponíveis"
          icon={FaTruck}
          color="bg-emerald-500"
        />
        
        <StatCard
          title="Unidades Escolares"
          value={statsData.totalUnidadesEscolares}
          subtitle="Unidades atendidas"
          icon={FaRuler}
          color="bg-violet-500"
        />
        
        <StatCard
          title="Unidades"
          value={statsData.totalUnidades}
          subtitle="Unidades de medida"
          icon={FaRuler}
          color="bg-amber-500"
        />
        
        <StatCard
          title="Nomes Genéricos"
          value={statsData.totalNomeGenerico}
          subtitle="Nomes genéricos"
          icon={FaBox}
          color="bg-slate-500"
        />
      </div>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráficos e Métricas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gráfico de Atividades */}
          <ChartCard title="Atividades Recentes">
            <div className="space-y-2">
              {atividades.length > 0 ? (
                atividades.map((atividade, index) => (
                  <ActivityCard
                    key={index}
                    title={`${atividade.acao}: ${atividade.titulo}`}
                    subtitle={`ID: ${atividade.id}`}
                    time={formatDate(atividade.data)}
                    icon={getActivityIcon(atividade.tipo)}
                    color={getActivityColor(atividade.tipo)}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaChartLine className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                  <p>Nenhuma atividade recente</p>
                </div>
              )}
            </div>
          </ChartCard>

          {/* Métricas de Performance */}
          <ChartCard title="Métricas de Performance">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(statsData.valorEstoque)}
                </div>
                <div className="text-sm text-gray-600">Valor Total em Estoque</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">
                  {statsData.produtosEstoqueBaixo}
                </div>
                <div className="text-sm text-gray-600">Produtos com Estoque Baixo</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">
                  {statsData.produtosSemEstoque}
                </div>
                <div className="text-sm text-gray-600">Produtos Sem Estoque</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">
                  {statsData.produtosVencendo}
                </div>
                <div className="text-sm text-gray-600">Produtos Vencendo</div>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Sidebar - Alertas e Informações */}
        <div className="space-y-6">
          {/* Alertas */}
          <ChartCard title="Alertas do Sistema">
            <div className="space-y-3">
              {alertas.length > 0 ? (
                alertas.map((alerta, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-l-4 ${getAlertaColor(alerta.nivel)}`}
                  >
                    <div className="flex items-start">
                      <FaExclamationTriangle className="mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium">
                          {alerta.titulo || 'Alerta do Sistema'}
                        </div>
                        <div className="text-xs mt-1">
                          {alerta.descricao || 'Descrição do alerta'}
                        </div>
                        <div className="text-xs mt-1 opacity-75">
                          {formatDate(alerta.data_hora)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <FaExclamationTriangle className="mx-auto h-8 w-8 mb-2 text-gray-300" />
                  <p className="text-sm">Nenhum alerta ativo</p>
                </div>
              )}
            </div>
          </ChartCard>

          {/* Informações do Sistema */}
          <ChartCard title="Informações do Sistema">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Veículos Doc. Vencendo</span>
                <span className="text-sm font-medium text-gray-900">
                  {statsData.veiculosDocumentacaoVencendo}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Motoristas CNH Vencendo</span>
                <span className="text-sm font-medium text-gray-900">
                  {statsData.motoristasCnhVencendo}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status</span>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Online
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Banco de Dados</span>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Conectado
                </span>
              </div>
            </div>
          </ChartCard>

          {/* Links Rápidos */}
          <ChartCard title="Acesso Rápido">
            <div className="space-y-2">
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center">
                  <FaUsers className="mr-3 text-blue-500" />
                  <span className="text-sm font-medium text-gray-900">Gerenciar Usuários</span>
                </div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center">
                  <FaTruck className="mr-3 text-green-500" />
                  <span className="text-sm font-medium text-gray-900">Gerenciar Veículos</span>
                </div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center">
                  <FaBox className="mr-3 text-purple-500" />
                  <span className="text-sm font-medium text-gray-900">Gerenciar Produtos</span>
                </div>
              </button>
              
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center">
                  <FaRoute className="mr-3 text-teal-500" />
                  <span className="text-sm font-medium text-gray-900">Gerenciar Rotas</span>
                </div>
              </button>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 