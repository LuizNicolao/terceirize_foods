import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaPlus } from 'react-icons/fa';
import { colors } from '../../../design-system';
import { Button } from '../../../design-system/components';

const ContentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
`;

const ContentTitle = styled.h2`
  color: ${colors.neutral.darkGray};
  font-size: 20px;
  font-weight: 600;
  margin: 0;
`;

const NewButton = styled(Button)`
  background: ${colors.primary.green};
  color: ${colors.neutral.white};
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #005a2e;
    transform: translateY(-1px);
  }
`;

const CotacoesActions = ({ selectedStatus, statusCards }) => {
  const navigate = useNavigate();

  const getTitle = () => {
    if (selectedStatus === 'todas') {
      return 'Todas as Cotações';
    }
    return statusCards.find(card => card.id === selectedStatus)?.title || 'Cotações';
  };

  return (
    <ContentHeader>
      <ContentTitle>{getTitle()}</ContentTitle>
      <NewButton onClick={() => navigate('/nova-cotacao')}>
        <FaPlus />
        Nova Cotação
      </NewButton>
    </ContentHeader>
  );
};

export default CotacoesActions;
