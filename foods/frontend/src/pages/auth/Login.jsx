import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FaUser, FaLock } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm();

  const onSubmit = async (data) => {
    const result = await login(data.email, data.senha);
    
    if (result.success) {
      toast.success('Login realizado com sucesso!');
      navigate('/foods');
    } else {
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
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-600 to-green-800">
      <div className="bg-white rounded-xl shadow-2xl p-8 sm:p-10 w-full max-w-md mx-4 animate-fadeInUp">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">
            Foods
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Sistema de Cadastro de Informações
          </p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-1">
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FaUser />
              </div>
              <input
                type="email"
                placeholder="Email"
                {...register('email', {
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido'
                  }
                })}
                className={`w-full px-3 py-3 pl-10 pr-3 border-2 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all duration-300 ${
                  errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-green-500'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FaLock />
              </div>
              <input
                type="password"
                placeholder="Senha"
                {...register('senha', {
                  required: 'Senha é obrigatória',
                  minLength: {
                    value: 6,
                    message: 'Senha deve ter pelo menos 6 caracteres'
                  }
                })}
                className={`w-full px-3 py-3 pl-10 pr-3 border-2 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all duration-300 ${
                  errors.senha ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-green-500'
                }`}
              />
            </div>
            {errors.senha && (
              <p className="text-sm text-red-600 mt-1">{errors.senha.message}</p>
            )}
          </div>

          {errors.root && (
            <div className={`p-3 rounded-lg text-sm text-center ${
              errors.root.type === 'rate-limit'
                ? 'bg-orange-50 text-orange-700 border border-orange-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {errors.root.message}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
