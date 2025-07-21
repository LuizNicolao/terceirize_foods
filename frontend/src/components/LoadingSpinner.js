import React from 'react';
import styled from 'styled-components';

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: ${props => props.$inline ? 'auto' : '100vh'};
  background: ${props => props.$inline ? 'transparent' : 'linear-gradient(135deg, var(--primary-green) 0%, var(--dark-green) 100%)'};
  padding: ${props => props.$inline ? '20px' : '0'};
`;

const Spinner = styled.div`
  width: ${props => props.$inline ? '30px' : '50px'};
  height: ${props => props.$inline ? '30px' : '50px'};
  border: ${props => props.$inline ? '3px' : '5px'} solid ${props => props.$inline ? 'rgba(0, 114, 62, 0.3)' : 'rgba(255, 255, 255, 0.3)'};
  border-radius: 50%;
  border-top-color: ${props => props.$inline ? 'var(--primary-green)' : 'var(--white)'};
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const SpinnerText = styled.div`
  margin-left: 12px;
  color: ${props => props.$inline ? 'var(--gray)' : 'var(--white)'};
  font-size: 14px;
`;

const LoadingSpinner = ({ inline = false, text = '' }) => {
  return (
    <SpinnerContainer $inline={inline}>
      <Spinner $inline={inline} />
      {text && <SpinnerText $inline={inline}>{text}</SpinnerText>}
    </SpinnerContainer>
  );
};

export default LoadingSpinner; 