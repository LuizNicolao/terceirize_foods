import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { SecurityNotice } from '../../components/auth/SecurityNotice';
import { Logo, CaptchaCheckbox } from '../../components/ui';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showSecurityNotice, setShowSecurityNotice] = useState(true);
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [captchaError, setCaptchaError] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch
  } = useForm();

  const watchedPassword = watch('senha', '');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateCaptcha = () => {
    if (!captchaChecked) {
      setCaptchaError('Por favor, confirme que você não é um robô');
      return false;
    }
    setCaptchaError('');
    return true;
  };

  const onSubmit = async (data) => {
    // Validar captcha antes de prosseguir
    if (!validateCaptcha()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await login(data.email, data.senha, rememberMe);
      
      if (result.success) {
        toast.success('Login realizado com sucesso!');
        navigate('/dashboard');
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
    } catch (error) {
      setError('root', { message: 'Erro interno do servidor' });
      toast.error('Erro interno do servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCaptchaChange = (checked) => {
    setCaptchaChecked(checked);
    if (checked && captchaError) {
      setCaptchaError('');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-green-800">
      <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10 w-full max-w-md mx-4 animate-fadeInUp">
        <div className="text-center mb-8">
          <div className="mb-4">
            <Logo size="xl" showText={false} className="mx-auto mb-3" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">
            Chamados
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Plataforma de Gestão de Chamados
          </p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FaUser />
              </div>
              <input
                type="email"
                placeholder="Digite seu email"
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
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600 mt-1 flex items-center">
                <span className="mr-1">⚠</span>
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FaLock />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite sua senha"
                {...register('senha', {
                  required: 'Senha é obrigatória',
                  minLength: {
                    value: 6,
                    message: 'Senha deve ter pelo menos 6 caracteres'
                  }
                })}
                className={`w-full px-3 py-3 pl-10 pr-12 border-2 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all duration-300 ${
                  errors.senha ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-green-500'
                }`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
            {errors.senha && (
              <p className="text-sm text-red-600 mt-1 flex items-center">
                <span className="mr-1">⚠</span>
                {errors.senha.message}
              </p>
            )}
          </div>

          {/* Captcha */}
          <div className="space-y-1">
            <CaptchaCheckbox
              isChecked={captchaChecked}
              onChange={handleCaptchaChange}
              disabled={isLoading}
              error={captchaError}
              required={true}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-700">Mantenha-me conectado</span>
            </label>
          </div>

          {rememberMe && (
            <SecurityNotice 
              isVisible={showSecurityNotice} 
              onClose={() => setShowSecurityNotice(false)} 
            />
          )}

          {errors.root && (
            <div className={`p-4 rounded-lg text-sm text-center border ${
              errors.root.type === 'rate-limit'
                ? 'bg-orange-50 text-orange-700 border-orange-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              <div className="flex items-center justify-center">
                <span className="mr-2">
                  {errors.root.type === 'rate-limit' ? '⏰' : '⚠'}
                </span>
                {errors.root.message}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !captchaChecked}
            className={`w-full font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center ${
              isLoading || !captchaChecked
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            © 2024 Chamados Plataforma. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
