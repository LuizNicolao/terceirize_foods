import React from 'react';
import styled from 'styled-components';
import { FaUsers, FaUserCheck, FaUserTimes, FaShieldAlt, FaUserTie, FaUserCog } from 'react-icons/fa';
import { colors } from '../../../design-system';

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const IconContainer = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.color};
  color: white;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${colors.neutral.darkGray};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: ${colors.neutral.gray};
  font-weight: 500;
`;

const UsuariosStats = ({ usuarios }) => {
  const stats = React.useMemo(() => {
    if (!usuarios || usuarios.length === 0) {
      return {
        total: 0,
        ativos: 0,
        inativos: 0,
        administradores: 0,
        gestores: 0,
        supervisores: 0,
        compradores: 0
      };
    }

    return {
      total: usuarios.length,
      ativos: usuarios.filter(u => u.status === 'ativo').length,
      inativos: usuarios.filter(u => u.status === 'inativo').length,
      administradores: usuarios.filter(u => u.role === 'administrador').length,
      gestores: usuarios.filter(u => u.role === 'gestor').length,
      supervisores: usuarios.filter(u => u.role === 'supervisor').length,
      compradores: usuarios.filter(u => u.role === 'comprador').length
    };
  }, [usuarios]);

  const statCards = [
    {
      icon: FaUsers,
      label: 'Total de Usuários',
      value: stats.total,
      color: colors.primary.green
    },
    {
      icon: FaUserCheck,
      label: 'Usuários Ativos',
      value: stats.ativos,
      color: '#28a745'
    },
    {
      icon: FaUserTimes,
      label: 'Usuários Inativos',
      value: stats.inativos,
      color: '#dc3545'
    },
    {
      icon: FaShieldAlt,
      label: 'Administradores',
      value: stats.administradores,
      color: '#dc3545'
    },
    {
      icon: FaUserTie,
      label: 'Gestores',
      value: stats.gestores,
      color: '#fd7e14'
    },
    {
      icon: FaUserCog,
      label: 'Supervisores',
      value: stats.supervisores,
      color: '#ffc107'
    }
  ];

  return (
    <StatsContainer>
      {statCards.map((card, index) => (
        <StatCard key={index}>
          <IconContainer color={card.color}>
            <card.icon size={24} />
          </IconContainer>
          <StatContent>
            <StatValue>{card.value}</StatValue>
            <StatLabel>{card.label}</StatLabel>
          </StatContent>
        </StatCard>
      ))}
    </StatsContainer>
  );
};

export default UsuariosStats;
