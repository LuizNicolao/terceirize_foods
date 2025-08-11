import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../design-system';

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, ${colors.primary.green} 0%, ${colors.primary.darkGreen} 100%);
`;

const LoginCard = styled.div`
  background: ${colors.neutral.white};
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 114, 62, 0.2);
  padding: 40px;
  width: 100%;
  max-width: 400px;
  animation: fadeInUp 0.6s ease-out;
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const LogoText = styled.h1`
  color: ${colors.primary.green};
  font-size: 32px;
  font-weight: 700;
  margin: 0;
`;

const Subtitle = styled.p`
  color: ${colors.neutral.gray};
  text-align: center;
  margin-bottom: 32px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: ${colors.neutral.white};

  &:focus {
    border-color: ${colors.primary.green};
    box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
    outline: none;
  }

  &::placeholder {
    color: ${colors.neutral.gray};
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: ${colors.neutral.gray};
  font-size: 18px;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${colors.neutral.gray};
  cursor: pointer;
  font-size: 16px;
  padding: 4px;

  &:hover {
    color: ${colors.primary.green};
  }
`;

const LoginButton = styled.button`
  background: ${colors.primary.green};
  color: ${colors.neutral.white};
  padding: 14px 20px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;

  &:hover {
    background: ${colors.primary.darkGreen};
    transform: translateY(-1px);
  }

  &:disabled {
    background: ${colors.neutral.gray};
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.p`
  color: ${colors.status.error};
  font-size: 14px;
  margin: 0;
  text-align: center;
`;

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro quando usuário começar a digitar
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validação básica
    if (!formData.email) {
      setError('Email é obrigatório');
      setIsLoading(false);
      return;
    }

    if (!formData.password) {
      setError('Senha é obrigatória');
      setIsLoading(false);
      return;
    }

    // Validação de email
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(formData.email)) {
      setError('Email inválido');
      setIsLoading(false);
      return;
    }

    // Validação de senha
    if (formData.password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Credenciais inválidas');
      }
    } catch (error) {
      setError('Erro interno do servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <LogoText>Sistema de Cotação</LogoText>
        </Logo>
        
        <Subtitle>
          Sistema de gerenciamento de cotações
        </Subtitle>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <InputIcon>
              <FaUser />
            </InputIcon>
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <InputIcon>
              <FaLock />
            </InputIcon>
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Senha"
              value={formData.password}
              onChange={handleChange}
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </PasswordToggle>
          </FormGroup>

          {error && (
            <ErrorMessage>{error}</ErrorMessage>
          )}

          <LoginButton type="submit" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </LoginButton>
        </Form>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login; 