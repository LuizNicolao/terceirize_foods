import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth as useAuthContext } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const handleLogin = async (data) => {
    try {
      setLoading(true);
      const success = await login(data.email, data.senha);
      
      if (success) {
        toast.success('Login realizado com sucesso!');
        navigate('/foods/dashboard');
      } else {
        toast.error('Email ou senha incorretos');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error('Erro ao realizar login');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return {
    loading,
    showPassword,
    handleLogin,
    togglePasswordVisibility
  };
};
