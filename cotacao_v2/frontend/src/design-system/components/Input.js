import React from 'react';
import styled from 'styled-components';
import { inputStyles, colors } from '../index';

const StyledInput = styled.input.withConfig({
  shouldForwardProp: (prop) => !['withIcon', 'error'].includes(prop)
})`
  ${inputStyles.base}
  ${props => props.withIcon && inputStyles.withIcon}
  ${props => props.error && inputStyles.error}
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const Label = styled.label`
  color: ${colors.neutral.darkGray};
  font-weight: 600;
  font-size: 14px;
`;

const ErrorMessage = styled.span`
  color: ${colors.status.error};
  font-size: 14px;
  margin: 0;
`;

const Input = ({ 
  label, 
  error, 
  withIcon = false,
  ...props 
}) => {
  return (
    <InputWrapper>
      {label && <Label>{label}</Label>}
      <StyledInput
        withIcon={withIcon}
        error={error}
        {...props}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputWrapper>
  );
};

export default Input; 