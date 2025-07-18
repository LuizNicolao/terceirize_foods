import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaUsers, FaTruck, FaBox, FaLayerGroup, FaChartLine, FaExclamationTriangle, FaDollarSign, FaRuler } from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';

const DashboardContainer = styled.div`
  padding: 24px;
`;

const Title = styled.h1`
  color: var(--dark-gray);
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
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

const PlaceholderChart = styled.div`
  height: 300px;
  background: var(--light-gray);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray);
  font-size: 16px;
`;

const RecentActivity = styled.div`
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
  background: var(--light-green);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 14px;
  color: var(--primary-green);
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityText = styled.div`
  font-size: 14px;
  color: var(--dark-gray);
  font-weight: 500;
`;

const ActivityTime = styled.div`
  font-size: 12px;
  color: var(--gray);
  margin-top: 4px;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: var(--gray);
  font-size: 16px;
`;

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Dashboard - useEffect executado');
    console.log('Dashboard - window.location.pathname:', window.location.pathname);
    console.log('Dashboard - localStorage lastRoute:', localStorage.getItem('lastRoute'));
    
    // Carregar dados da dashboard normalmente
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/stats');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Erro ao carregar dados da dashboard:', error);
      toast.error('Erro ao carregar dados da dashboard');
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} dias atrás`;
    
    return date.toLocaleDateString('pt-BR');
  };

  const getActivityIcon = (tipo) => {
    switch (tipo) {
      case 'produto':
        return FaBox;
      case 'fornecedor':
        return FaTruck;
      case 'grupo':
        return FaLayerGroup;
      case 'usuario':
        return FaUsers;
      default:
        return FaBox;
    }
  };

  if (loading) {
    return (
      <DashboardContainer>
        <Title>Dashboard</Title>
        <LoadingSpinner>Carregando dados da dashboard...</LoadingSpinner>
      </DashboardContainer>
    );
  }

  if (!dashboardData) {
    return (
      <DashboardContainer>
        <Title>Dashboard</Title>
        <div>Erro ao carregar dados</div>
      </DashboardContainer>
    );
  }

  const stats = [
    {
      icon: FaUsers,
      label: 'Usuários Ativos',
      value: dashboardData.stats.usuarios,
      subtitle: 'Usuários no sistema',
      color: 'var(--blue)'
    },
    {
      icon: FaTruck,
      label: 'Fornecedores',
      value: dashboardData.stats.fornecedores,
      subtitle: 'Fornecedores ativos',
      color: 'var(--primary-green)'
    },
    {
      icon: FaBox,
      label: 'Produtos',
      value: dashboardData.stats.produtos,
      subtitle: 'Produtos ativos',
      color: 'var(--orange)'
    },
    {
      icon: FaLayerGroup,
      label: 'Grupos',
      value: dashboardData.stats.grupos,
      subtitle: 'Grupos ativos',
      color: 'var(--success-green)'
    },
    {
      icon: FaRuler,
      label: 'Unidades',
      value: dashboardData.stats.unidades,
      subtitle: 'Unidades de medida',
      color: 'var(--purple)'
    },
    {
      icon: FaDollarSign,
      label: 'Valor Estoque',
      value: formatCurrency(dashboardData.stats.valorEstoque),
      subtitle: 'Valor total em estoque',
      color: 'var(--success-green)'
    },
    {
      icon: FaExclamationTriangle,
      label: 'Estoque Baixo',
      value: dashboardData.stats.produtosEstoqueBaixo,
      subtitle: 'Produtos com estoque baixo',
      color: 'var(--error-red)'
    }
  ];

  return (
    <DashboardContainer>
      <Title>Dashboard</Title>

      <StatsGrid>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <StatCard key={index}>
              <StatHeader>
                <StatIcon color={stat.color}>
                  <Icon />
                </StatIcon>
              </StatHeader>
              <StatValue>{stat.value}</StatValue>
              <StatLabel>{stat.label}</StatLabel>
              <StatSubtitle>{stat.subtitle}</StatSubtitle>
            </StatCard>
          );
        })}
      </StatsGrid>

      <ContentGrid>
        <ChartCard>
          <ChartTitle>Últimos Produtos Cadastrados</ChartTitle>
          {dashboardData.recentes.produtos.length === 0 ? (
            <PlaceholderChart>
              Nenhum produto cadastrado ainda
            </PlaceholderChart>
          ) : (
            <div>
              {dashboardData.recentes.produtos.map((produto, index) => (
                <ActivityItem key={index}>
                  <ActivityIcon>
                    <FaBox />
                  </ActivityIcon>
                  <ActivityContent>
                    <ActivityText>{produto.nome}</ActivityText>
                    <ActivityTime>
                      {produto.fornecedor ? `Fornecedor: ${produto.fornecedor}` : 'Sem fornecedor'} • {formatDate(produto.criado_em)}
                    </ActivityTime>
                  </ActivityContent>
                </ActivityItem>
              ))}
            </div>
          )}
        </ChartCard>

        <RecentActivity>
          <ChartTitle>Atividades Recentes</ChartTitle>
          {dashboardData.atividades.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--gray)', padding: '20px' }}>
              Nenhuma atividade recente
            </div>
          ) : (
            dashboardData.atividades.map((activity, index) => {
              const Icon = getActivityIcon(activity.tipo);
              return (
                <ActivityItem key={index}>
                  <ActivityIcon>
                    <Icon />
                  </ActivityIcon>
                  <ActivityContent>
                    <ActivityText>{activity.acao}: {activity.titulo}</ActivityText>
                    <ActivityTime>{formatDate(activity.data)}</ActivityTime>
                  </ActivityContent>
                </ActivityItem>
              );
            })
          )}
        </RecentActivity>
      </ContentGrid>
    </DashboardContainer>
  );
};

export default Dashboard; 