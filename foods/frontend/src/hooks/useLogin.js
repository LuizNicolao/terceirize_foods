import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export const useLogin = (navigate) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const onSubmit = async (data, setError) => {
    setIsLoading(true);
    
    try {
      const result = await login(data.email, data.senha);
      
      if (result.success) {
        toast.success('Login realizado com sucesso!');
        return result;
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
        return result;
      }
    } catch (error) {
      setError('root', { message: 'Erro interno do servidor' });
      toast.error('Erro interno do servidor');
      return { success: false, error: 'Erro interno do servidor' };
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return {
    showPassword,
    isLoading,
    onSubmit,
    togglePasswordVisibility
  };
};
