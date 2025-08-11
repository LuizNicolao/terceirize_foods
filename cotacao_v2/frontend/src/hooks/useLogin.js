import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const useLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Atualizar dados do formulário
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

  // Alternar visibilidade da senha
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Validar formulário
  const validateForm = () => {
    if (!formData.email) {
      setError('Email é obrigatório');
      return false;
    }

    if (!formData.password) {
      setError('Senha é obrigatória');
      return false;
    }

    // Validação de email
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(formData.email)) {
      setError('Email inválido');
      return false;
    }

    // Validação de senha
    if (formData.password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return false;
    }

    return true;
  };

  // Submeter formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        toast.success('Login realizado com sucesso!');
        navigate('/dashboard');
      } else {
        setError(result.message || 'Credenciais inválidas');
        toast.error(result.message || 'Credenciais inválidas');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setError('Erro interno do servidor');
      toast.error('Erro interno do servidor');
    } finally {
      setIsLoading(false);
    }
  };

  // Limpar formulário
  const clearForm = () => {
    setFormData({
      email: '',
      password: ''
    });
    setError('');
    setShowPassword(false);
  };

  return {
    // Estados
    formData,
    showPassword,
    isLoading,
    error,
    
    // Funções
    handleChange,
    togglePasswordVisibility,
    handleSubmit,
    clearForm
  };
};
