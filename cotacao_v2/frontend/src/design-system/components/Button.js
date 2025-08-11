import React from 'react';
import styled from 'styled-components';
import { buttonStyles, colors } from '../index';

const StyledButton = styled.button.withConfig({
  shouldForwardProp: (prop) => !['fullWidth', 'variant', 'size'].includes(prop)
})`
  ${buttonStyles.base}
  ${props => buttonStyles.variants[props.variant] || buttonStyles.variants.primary}
  ${props => buttonStyles.sizes[props.size] || buttonStyles.sizes.md}
  
  ${props => props.disabled && `
    background: ${colors.neutral.gray} !important;
    cursor: not-allowed !important;
    transform: none !important;
    box-shadow: none !important;
  `}
  
  ${props => props.fullWidth && `
    width: 100%;
  `}
`;

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  fullWidth = false,
  ...props 
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      disabled={disabled}
      fullWidth={fullWidth}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default Button; 