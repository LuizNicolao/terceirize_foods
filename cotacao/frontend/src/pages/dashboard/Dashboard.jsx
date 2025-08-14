import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Layout } from '../../components/shared';
import { LoadingSpinner } from '../../components/ui';
import { 
  FaFileInvoice, 
  FaCheckCircle, 
  FaClock, 
  FaTimesCircle, 
  FaSyncAlt,
  FaUsers,
  FaBox,
  FaDollarSign,
  FaChartLine,
  FaExclamationTriangle
} from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Carregar estatísticas
      const statsResponse = await axios.get('/cotacao/api/dashboard/stats');
      setStats(statsResponse.data.data);

      // Carregar atividades recentes
      const activitiesResponse = await axios.get('/cotacao/api/dashboard/recent-activities');
      setRecentActivities(activitiesResponse.data.data);

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'aprovada': return 'text-success-600 bg-success-50';
      case 'pendente': return 'text-warning-600 bg-warning-50';
      case 'rejeitada': return 'text-error-600 bg-error-50';
      case 'renegociacao': return 'text-primary-600 bg-primary-50';
      default: return 'text-neutral-600 bg-neutral-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'aprovada': return <FaCheckCircle className="w-4 h-4" />;
      case 'pendente': return <FaClock className="w-4 h-4" />;
      case 'rejeitada': return <FaTimesCircle className="w-4 h-4" />;
      case 'renegociacao': return <FaSyncAlt className="w-4 h-4" />;
      default: return <FaFileInvoice className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <LoadingSpinner size="lg" text="Carregando dashboard..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
          <p className="mt-1 text-neutral-600">
            Bem-vindo, {user?.name} ({user?.role})
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Cotações Pendentes */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                  <FaClock className="w-6 h-6 text-warning-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Pendentes</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {stats?.cotacoes?.porStatus?.pendente || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Cotações Aprovadas */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                  <FaCheckCircle className="w-6 h-6 text-success-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Aprovadas</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {stats?.cotacoes?.porStatus?.aprovada || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Cotações Rejeitadas */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-error-100 rounded-lg flex items-center justify-center">
                  <FaTimesCircle className="w-6 h-6 text-error-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Rejeitadas</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {stats?.cotacoes?.porStatus?.rejeitada || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Cotações em Renegociação */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <FaSyncAlt className="w-6 h-6 text-primary-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Renegociação</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {stats?.cotacoes?.porStatus?.renegociacao || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Estatísticas Detalhadas */}
          <div className="lg:col-span-2 space-y-6">
            {/* Resumo Financeiro */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Resumo Financeiro</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-neutral-50 rounded-lg p-4">
                  <p className="text-sm text-neutral-600">Valor Total Aprovado</p>
                  <p className="text-xl font-bold text-neutral-900">
                    {formatCurrency(stats?.cotacoes?.valorTotal || 0)}
                  </p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-4">
                  <p className="text-sm text-neutral-600">Valor Médio por Cotação</p>
                  <p className="text-xl font-bold text-neutral-900">
                    {formatCurrency(stats?.cotacoes?.valorMedio || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Estatísticas por Categoria */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Visão Geral</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FaFileInvoice className="w-8 h-8 text-primary-600" />
                  </div>
                  <p className="text-2xl font-bold text-neutral-900">{stats?.cotacoes?.total || 0}</p>
                  <p className="text-sm text-neutral-600">Total de Cotações</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FaUsers className="w-8 h-8 text-success-600" />
                  </div>
                  <p className="text-2xl font-bold text-neutral-900">{stats?.usuarios?.total || 0}</p>
                  <p className="text-sm text-neutral-600">Usuários Ativos</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FaBox className="w-8 h-8 text-warning-600" />
                  </div>
                  <p className="text-2xl font-bold text-neutral-900">{stats?.produtos?.total || 0}</p>
                  <p className="text-sm text-neutral-600">Produtos Cadastrados</p>
                </div>
              </div>
            </div>
          </div>

          {/* Atividades Recentes */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Atividades Recentes</h3>
              <div className="space-y-3">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(activity.status)}`}>
                        {getStatusIcon(activity.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {activity.titulo}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {formatDate(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-neutral-500 text-center py-4">
                    Nenhuma atividade recente
                  </p>
                )}
              </div>
            </div>

            {/* Alertas */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Alertas</h3>
              <div className="space-y-3">
                {stats?.cotacoes?.porStatus?.pendente > 0 && (
                  <div className="flex items-center space-x-3 p-3 bg-warning-50 rounded-lg">
                    <FaExclamationTriangle className="w-5 h-5 text-warning-600" />
                    <div>
                      <p className="text-sm font-medium text-warning-800">
                        {stats.cotacoes.porStatus.pendente} cotações aguardando aprovação
                      </p>
                    </div>
                  </div>
                )}
                
                {stats?.cotacoes?.porStatus?.renegociacao > 0 && (
                  <div className="flex items-center space-x-3 p-3 bg-primary-50 rounded-lg">
                    <FaSyncAlt className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="text-sm font-medium text-primary-800">
                        {stats.cotacoes.porStatus.renegociacao} cotações em renegociação
                      </p>
                    </div>
                  </div>
                )}

                {(!stats?.cotacoes?.porStatus?.pendente && !stats?.cotacoes?.porStatus?.renegociacao) && (
                  <p className="text-sm text-neutral-500 text-center py-4">
                    Nenhum alerta no momento
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
