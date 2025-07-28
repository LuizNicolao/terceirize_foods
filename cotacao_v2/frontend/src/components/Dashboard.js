import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';
import styled from 'styled-components';
import { 
  FaTruck, 
  FaCheckCircle, 
  FaClock, 
  FaTimesCircle, 
  FaChartLine, 
  FaDollarSign,
  FaUsers,
  FaExclamationTriangle
} from 'react-icons/fa';
import './Dashboard.css';

const DashboardContainer = styled.div`
  padding: 24px;
`;

const Title = styled.h1`
  color: var(--dark-gray);
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
`;

const WelcomeMessage = styled.p`
  color: var(--gray);
  font-size: 16px;
  margin-bottom: 32px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: var(--white);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: var(--white);
  background: ${props => props.color};
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: var(--dark-gray);
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: var(--gray);
  font-weight: 500;
`;

const StatSubtitle = styled.div`
  font-size: 12px;
  color: var(--gray);
  margin-top: 4px;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: var(--white);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ChartTitle = styled.h3`
  color: var(--dark-gray);
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
`;

const RecentActivityCard = styled.div`
  background: var(--white);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const ActivityIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 14px;
  color: var(--white);
  background: ${props => props.color};
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: var(--dark-gray);
  margin-bottom: 4px;
`;

const ActivityTime = styled.div`
  font-size: 12px;
  color: var(--gray);
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: var(--gray);
`;

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados reais da API
      const [statsResponse, activityResponse] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL || 'http://82.29.57.43:5000'}/api/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch(`${process.env.REACT_APP_API_URL || 'http://82.29.57.43:5000'}/api/dashboard/activity`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      if (statsResponse.ok && activityResponse.ok) {
        const stats = await statsResponse.json();
        const recentActivity = await activityResponse.json();
        
        setDashboardData({
          stats,
          recentActivity
        });
      } else {
        console.error('Erro ao carregar dados do dashboard');
        // Fallback para dados mockados em caso de erro
        const mockData = {
          stats: {
            totalCotacoes: 0,
            cotacoesPendentes: 0,
            cotacoesAprovadas: 0,
            cotacoesRejeitadas: 0,
            totalEconomia: 0,
            usuariosAtivos: 0
          },
          recentActivity: []
        };
        setDashboardData(mockData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      // Fallback para dados mockados em caso de erro
      const mockData = {
        stats: {
          totalCotacoes: 0,
          cotacoesPendentes: 0,
          cotacoesAprovadas: 0,
          cotacoesRejeitadas: 0,
          totalEconomia: 0,
          usuariosAtivos: 0
        },
        recentActivity: []
      };
      setDashboardData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'cotacao_aprovada':
        return <FaCheckCircle />;
      case 'nova_cotacao':
        return <FaTruck />;
      case 'cotacao_rejeitada':
        return <FaTimesCircle />;
      case 'supervisor_review':
        return <FaExclamationTriangle />;
      default:
        return <FaChartLine />;
    }
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner>Carregando dashboard...</LoadingSpinner>
      </Layout>
    );
  }

  return (
    <Layout>
      <DashboardContainer>
        <Title>Dashboard</Title>
        <WelcomeMessage>
          Bem-vindo, {user?.name || 'Usuário'}! Aqui está um resumo das atividades do sistema de cotação.
        </WelcomeMessage>

        <StatsGrid>
          <StatCard>
            <StatHeader>
              <StatIcon color="#3B82F6">
                <FaTruck />
              </StatIcon>
            </StatHeader>
            <StatValue>{dashboardData.stats.totalCotacoes}</StatValue>
            <StatLabel>Total de Cotações</StatLabel>
            <StatSubtitle>Este mês</StatSubtitle>
          </StatCard>

          <StatCard>
            <StatHeader>
              <StatIcon color="#F59E0B">
                <FaClock />
              </StatIcon>
            </StatHeader>
            <StatValue>{dashboardData.stats.cotacoesPendentes}</StatValue>
            <StatLabel>Cotações Pendentes</StatLabel>
            <StatSubtitle>Aguardando aprovação</StatSubtitle>
          </StatCard>

          <StatCard>
            <StatHeader>
              <StatIcon color="#10B981">
                <FaCheckCircle />
              </StatIcon>
            </StatHeader>
            <StatValue>{dashboardData.stats.cotacoesAprovadas}</StatValue>
            <StatLabel>Cotações Aprovadas</StatLabel>
            <StatSubtitle>Este mês</StatSubtitle>
          </StatCard>

          <StatCard>
            <StatHeader>
              <StatIcon color="#EF4444">
                <FaTimesCircle />
              </StatIcon>
            </StatHeader>
            <StatValue>{dashboardData.stats.cotacoesRejeitadas}</StatValue>
            <StatLabel>Cotações Rejeitadas</StatLabel>
            <StatSubtitle>Este mês</StatSubtitle>
          </StatCard>

          <StatCard>
            <StatHeader>
              <StatIcon color="#10B981">
                <FaDollarSign />
              </StatIcon>
            </StatHeader>
            <StatValue>{formatCurrency(dashboardData.stats.totalEconomia)}</StatValue>
            <StatLabel>Economia Total</StatLabel>
            <StatSubtitle>Este mês</StatSubtitle>
          </StatCard>

          <StatCard>
            <StatHeader>
              <StatIcon color="#8B5CF6">
                <FaUsers />
              </StatIcon>
            </StatHeader>
            <StatValue>{dashboardData.stats.usuariosAtivos}</StatValue>
            <StatLabel>Usuários Ativos</StatLabel>
            <StatSubtitle>No sistema</StatSubtitle>
          </StatCard>
        </StatsGrid>

        <ContentGrid>
          <ChartCard>
            <ChartTitle>Resumo de Cotações</ChartTitle>
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray)' }}>
              Gráfico de cotações por status (implementar com biblioteca de gráficos)
            </div>
          </ChartCard>

          <RecentActivityCard>
            <ChartTitle>Atividades Recentes</ChartTitle>
            {dashboardData.recentActivity.map((activity) => (
              <ActivityItem key={activity.id}>
                <ActivityIcon color={activity.color}>
                  {getActivityIcon(activity.type)}
                </ActivityIcon>
                <ActivityContent>
                  <ActivityTitle>{activity.title}</ActivityTitle>
                  <ActivityTime>{activity.time}</ActivityTime>
                </ActivityContent>
              </ActivityItem>
            ))}
          </RecentActivityCard>
        </ContentGrid>
      </DashboardContainer>
    </Layout>
  );
};

export default Dashboard; 