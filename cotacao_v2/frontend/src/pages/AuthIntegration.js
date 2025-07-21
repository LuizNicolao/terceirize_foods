import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  text-align: center;
  max-width: 400px;
  width: 90%;
`;

const Icon = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
  color: ${props => {
    if (props.$status === 'loading') return '#667eea';
    if (props.$status === 'success') return '#28a745';
    if (props.$status === 'error') return '#dc3545';
    return '#667eea';
  }};
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 10px;
  font-size: 24px;
`;

const Message = styled.p`
  color: #666;
  margin-bottom: 20px;
  font-size: 16px;
  line-height: 1.5;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
  margin: 20px 0;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  width: ${props => props.$progress}%;
  transition: width 0.3s ease;
`;

const AuthIntegration = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Processando autenticação...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Token de autenticação não encontrado');
      return;
    }

    // Simular progresso
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    // Processar autenticação
    const processAuth = async () => {
      try {
        // Armazenar token no localStorage
        localStorage.setItem('token', token);
        
        // Verificar se o token é válido fazendo uma requisição
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setStatus('success');
          setMessage('Autenticação realizada com sucesso! Redirecionando...');
          setProgress(100);
          
          // Redirecionar após 2 segundos
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          throw new Error('Token inválido');
        }
      } catch (error) {
        console.error('Erro na autenticação:', error);
        setStatus('error');
        setMessage('Erro na autenticação. Tente novamente.');
        setProgress(100);
        
        // Limpar token inválido
        localStorage.removeItem('token');
      }
    };

    processAuth();

    return () => clearInterval(progressInterval);
  }, [searchParams, navigate]);

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <FaSpinner className="fa-spin" />;
      case 'success':
        return <FaCheckCircle />;
      case 'error':
        return <FaExclamationTriangle />;
      default:
        return <FaSpinner className="fa-spin" />;
    }
  };

  return (
    <Container>
      <Card>
        <Icon $status={status}>
          {getIcon()}
        </Icon>
        <Title>
          {status === 'loading' && 'Autenticando...'}
          {status === 'success' && 'Sucesso!'}
          {status === 'error' && 'Erro'}
        </Title>
        <Message>{message}</Message>
        <ProgressBar>
          <ProgressFill $progress={progress} />
        </ProgressBar>
      </Card>
    </Container>
  );
};

export default AuthIntegration; 