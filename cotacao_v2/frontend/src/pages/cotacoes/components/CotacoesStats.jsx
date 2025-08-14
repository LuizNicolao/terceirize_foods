import React from 'react';
import styled from 'styled-components';
import { 
  FaClock, 
  FaUserCheck, 
  FaSearch, 
  FaThumbsUp, 
  FaThumbsDown, 
  FaExchangeAlt 
} from 'react-icons/fa';
import { colors } from '../../../design-system';
import { Card } from '../../../design-system/components';

const StatusCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const StatusCard = styled(Card)`
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid ${props => props.color};
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  &.selected {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    transform: translateY(-4px);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.color};
    opacity: 0.3;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
`;

const CardIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.$bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.neutral.white};
  font-size: 20px;
  box-shadow: 0 4px 12px ${props => props.$bgColor}40;
`;

const CardTitle = styled.h3`
  color: ${colors.neutral.darkGray};
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  flex: 1;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CardCount = styled.span`
  color: ${colors.neutral.darkGray};
  font-size: 36px;
  font-weight: 700;
  line-height: 1;
`;

const CardLabel = styled.span`
  color: ${colors.neutral.gray};
  font-size: 14px;
  font-weight: 500;
`;

const CotacoesStats = ({ statusCounts, selectedStatus, onStatusSelect }) => {
  const statusCards = [
    {
      id: 'pendentes',
      title: 'Cotações Pendentes',
      count: statusCounts.pendentes || 0,
      color: colors.secondary.orange,
      icon: <FaClock />,
      bgColor: colors.secondary.orange
    },
    {
      id: 'aguardando-aprovacao',
      title: 'Aguardando Aprovação',
      count: statusCounts['aguardando-aprovacao'] || 0,
      color: colors.secondary.blue,
      icon: <FaUserCheck />,
      bgColor: colors.secondary.blue
    },
    {
      id: 'analise-supervisor',
      title: 'Análise do Supervisor',
      count: statusCounts['analise-supervisor'] || 0,
      color: '#9C27B0',
      icon: <FaSearch />,
      bgColor: '#9C27B0'
    },
    {
      id: 'aprovadas',
      title: 'Cotações Aprovadas',
      count: statusCounts.aprovadas || 0,
      color: colors.primary.green,
      icon: <FaThumbsUp />,
      bgColor: colors.primary.green
    },
    {
      id: 'rejeitadas',
      title: 'Cotações Rejeitadas',
      count: statusCounts.rejeitadas || 0,
      color: colors.status.error,
      icon: <FaThumbsDown />,
      bgColor: colors.status.error
    },
    {
      id: 'renegociacao',
      title: 'Em Renegociação',
      count: statusCounts.renegociacao || 0,
      color: '#FF5722',
      icon: <FaExchangeAlt />,
      bgColor: '#FF5722'
    }
  ];

  return (
    <StatusCardsGrid>
      {statusCards.map((card) => (
        <StatusCard 
          key={card.id}
          color={card.color}
          className={selectedStatus === card.id ? 'selected' : ''}
          onClick={() => onStatusSelect(card.id)}
        >
          <CardHeader>
            <CardIcon $bgColor={card.bgColor}>
              {card.icon}
            </CardIcon>
            <CardTitle>{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardCount>{card.count}</CardCount>
            <CardLabel>cotações</CardLabel>
          </CardContent>
        </StatusCard>
      ))}
    </StatusCardsGrid>
  );
};

export default CotacoesStats;
