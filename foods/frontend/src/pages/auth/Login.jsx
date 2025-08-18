import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLoginForm } from '../../hooks/useLoginForm';
import { LoginForm } from '../../components/auth/LoginForm';
import { LoginLayout } from '../../components/auth/LoginLayout';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const {
    isLoading,
    errors,
    handleSubmit,
    showPassword,
    togglePasswordVisibility
  } = useLoginForm(login, () => {
    navigate('/foods');
  });

  return (
    <LoginLayout>
      <LoginForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        errors={errors}
        showPassword={showPassword}
        onTogglePassword={togglePasswordVisibility}
      />
    </LoginLayout>
  );
};

export default Login;
