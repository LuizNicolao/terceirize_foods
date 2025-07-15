import React from 'react';
import styled from 'styled-components';
import { FaUsers, FaTruck, FaBox, FaLayerGroup, FaChartLine } from 'react-icons/fa';

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

const StatChange = styled.div`
  font-size: 12px;
  color: ${props => props.$positive ? 'var(--success-green)' : 'var(--error-red)'};
  font-weight: 600;
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

const Dashboard = () => {
  const stats = [
    {
      icon: FaUsers,
      label: 'Usuários Ativos',
      value: '24',
      change: '+12%',
      positive: true,
      color: 'var(--blue)'
    },
    {
      icon: FaTruck,
      label: 'Fornecedores',
      value: '156',
      change: '+8%',
      positive: true,
      color: 'var(--primary-green)'
    },
    {
      icon: FaBox,
      label: 'Produtos',
      value: '1,234',
      change: '+15%',
      positive: true,
      color: 'var(--orange)'
    },
    {
      icon: FaLayerGroup,
      label: 'Grupos',
      value: '45',
      change: '+3%',
      positive: true,
      color: 'var(--success-green)'
    }
  ];

  const recentActivities = [
    {
      icon: FaBox,
      text: 'Novo produto "Arroz Integral" cadastrado',
      time: '2 minutos atrás'
    },
    {
      icon: FaTruck,
      text: 'Fornecedor "Distribuidora ABC" atualizado',
      time: '15 minutos atrás'
    },
    {
      icon: FaUsers,
      text: 'Usuário "João Silva" criado',
      time: '1 hora atrás'
    },
    {
      icon: FaLayerGroup,
      text: 'Grupo "Cereais" criado',
      time: '2 horas atrás'
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
                <StatChange $positive={stat.positive}>
                  {stat.change}
                </StatChange>
              </StatHeader>
              <StatValue>{stat.value}</StatValue>
              <StatLabel>{stat.label}</StatLabel>
            </StatCard>
          );
        })}
      </StatsGrid>

      <ContentGrid>
        <ChartCard>
          <ChartTitle>Vendas dos Últimos 7 Dias</ChartTitle>
          <PlaceholderChart>
            Gráfico de vendas será implementado aqui
          </PlaceholderChart>
        </ChartCard>

        <RecentActivity>
          <ChartTitle>Atividades Recentes</ChartTitle>
          {recentActivities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <ActivityItem key={index}>
                <ActivityIcon>
                  <Icon />
                </ActivityIcon>
                <ActivityContent>
                  <ActivityText>{activity.text}</ActivityText>
                  <ActivityTime>{activity.time}</ActivityTime>
                </ActivityContent>
              </ActivityItem>
            );
          })}
        </RecentActivity>
      </ContentGrid>
    </DashboardContainer>
  );
};

export default Dashboard; 