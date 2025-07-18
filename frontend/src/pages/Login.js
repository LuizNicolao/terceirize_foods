import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-green) 0%, var(--dark-green) 100%);
`;

const LoginCard = styled.div`
  background: var(--white);
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
  color: var(--primary-green);
  font-size: 32px;
  font-weight: 700;
  margin: 0;
`;

const Subtitle = styled.p`
  color: var(--gray);
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
  background: var(--white);

  &:focus {
    border-color: var(--primary-green);
    box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
    outline: none;
  }

  &::placeholder {
    color: var(--gray);
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray);
  font-size: 18px;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--gray);
  cursor: pointer;
  font-size: 16px;
  padding: 4px;

  &:hover {
    color: var(--primary-green);
  }
`;

const LoginButton = styled.button`
  background: var(--primary-green);
  color: var(--white);
  padding: 14px 20px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;

  &:hover {
    background: var(--dark-green);
    transform: translateY(-1px);
  }

  &:disabled {
    background: var(--gray);
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.p`
  color: ${props => props.type === 'rate-limit' ? '#f57c00' : 'var(--error-red)'};
  font-size: 14px;
  margin: 0;
  text-align: center;
  padding: 12px;
  background: ${props => props.type === 'rate-limit' ? '#fff3e0' : 'transparent'};
  border-radius: 6px;
  border: ${props => props.type === 'rate-limit' ? '1px solid #ffb74d' : 'none'};
`;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const result = await login(data.email, data.senha);
      
      if (result.success) {
        toast.success('Login realizado com sucesso!');
        navigate('/');
      } else {
        // Tratamento específico para rate limiting
        if (result.isRateLimited) {
          setError('root', { 
            message: 'Muitas tentativas de login. Aguarde 15 minutos ou reinicie o servidor.',
            type: 'rate-limit'
          });
          toast.error('Rate limit atingido. Aguarde 15 minutos.', {
            duration: 5000
          });
        } else {
          setError('root', { message: result.error });
          toast.error(result.error);
        }
      }
    } catch (error) {
      setError('root', { message: 'Erro interno do servidor' });
      toast.error('Erro interno do servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <LogoText>Foods</LogoText>
        </Logo>
        
        <Subtitle>
          Sistema de Cadastro de Informações
        </Subtitle>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <InputIcon>
              <FaUser />
            </InputIcon>
            <Input
              type="email"
              placeholder="Email"
              {...register('email', {
                required: 'Email é obrigatório',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido'
                }
              })}
            />
            {errors.email && (
              <ErrorMessage>{errors.email.message}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <InputIcon>
              <FaLock />
            </InputIcon>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Senha"
              {...register('senha', {
                required: 'Senha é obrigatória',
                minLength: {
                  value: 6,
                  message: 'Senha deve ter pelo menos 6 caracteres'
                }
              })}
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </PasswordToggle>
            {errors.senha && (
              <ErrorMessage>{errors.senha.message}</ErrorMessage>
            )}
          </FormGroup>

                      {errors.root && (
              <ErrorMessage type={errors.root.type}>{errors.root.message}</ErrorMessage>
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