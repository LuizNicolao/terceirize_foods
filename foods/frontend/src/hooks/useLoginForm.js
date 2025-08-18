import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export const useLoginForm = (loginFunction, onSuccess) => {
  console.log('useLoginForm called with:', { loginFunction, onSuccess });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm();

  console.log('useForm result:', { register, handleSubmit, errors });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data) => {
    console.log('onSubmit called with data:', data);
    setIsLoading(true);
    
    try {
      const result = await loginFunction(data.email, data.senha);
      
      if (result.success) {
        toast.success('Login realizado com sucesso!');
        onSuccess();
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

  const result = {
    register,
    handleSubmit: handleSubmit(onSubmit),
    isLoading,
    errors,
    showPassword,
    togglePasswordVisibility
  };

  console.log('useLoginForm returning:', result);
  return result;
};
