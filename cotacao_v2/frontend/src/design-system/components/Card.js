import React from 'react';
import styled from 'styled-components';
import { cardStyles } from '../index';

const StyledCard = styled.div.withConfig({
  shouldForwardProp: (prop) => !['hover', 'variant'].includes(prop)
})`
  ${cardStyles.base}
  ${props => props.variant === 'dashboard' && cardStyles.dashboard}
  
  ${props => props.hover && `
    &:hover {
      ${cardStyles.hover}
    }
  `}
`;

const Card = ({ 
  children, 
  variant = 'base',
  hover = false,
  ...props 
}) => {
  return (
    <StyledCard
      variant={variant}
      hover={hover}
      {...props}
    >
      {children}
    </StyledCard>
  );
};

export default Card; 