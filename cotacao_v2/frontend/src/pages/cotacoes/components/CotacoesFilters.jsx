import React from 'react';
import styled from 'styled-components';
import { FaFilter } from 'react-icons/fa';
import { colors } from '../../../design-system';
import { Card } from '../../../design-system/components';

const FilterSection = styled(Card)`
  padding: 24px;
  margin-bottom: 24px;
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const FilterLabel = styled.label`
  color: ${colors.neutral.darkGray};
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FilterSelect = styled.select`
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: ${colors.neutral.white};
  color: ${colors.neutral.darkGray};
  font-size: 14px;
  min-width: 220px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${colors.primary.green};
    box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
  }
`;

const CotacoesFilters = ({ selectedStatus, onStatusFilter }) => {
  return (
    <FilterSection>
      <FilterContainer>
        <FilterLabel>
          <FaFilter />
          Filtrar por Status:
        </FilterLabel>
        <FilterSelect 
          value={selectedStatus} 
          onChange={(e) => onStatusFilter(e.target.value)}
        >
          <option value="todas">Todas as Cotações</option>
          <option value="pendentes">Pendentes</option>
          <option value="aguardando-aprovacao">Aguardando Aprovação</option>
          <option value="analise-supervisor">Aguardando Análise do Supervisor</option>
          <option value="aprovadas">Aprovadas</option>
          <option value="rejeitadas">Rejeitadas</option>
          <option value="renegociacao">Em Renegociação</option>
        </FilterSelect>
      </FilterContainer>
    </FilterSection>
  );
};

export default CotacoesFilters;
