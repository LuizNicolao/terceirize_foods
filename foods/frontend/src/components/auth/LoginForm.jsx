import React from 'react';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { FormInput, Button } from '../ui';

export const LoginForm = ({
  onSubmit,
  register,
  isLoading,
  errors,
  showPassword,
  onTogglePassword
}) => {
  console.log('LoginForm rendering with props:', { onSubmit, register, isLoading, errors, showPassword });
  
  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
            className="w-full px-3 py-3 pl-10 pr-3 border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all duration-300"
          />
        </div>
        {errors.email && (
          <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
        )}
      </div>

      <div className="relative">
        <div className="space-y-1">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FaLock />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Senha"
              {...register('senha', {
                required: 'Senha é obrigatória',
                minLength: {
                  value: 6,
                  message: 'Senha deve ter pelo menos 6 caracteres'
                }
              })}
              className="w-full px-3 py-3 pl-10 pr-12 border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all duration-300"
            />
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
            >
              {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
            </button>
          </div>
          {errors.senha && (
            <p className="text-sm text-red-600 mt-1">{errors.senha.message}</p>
          )}
        </div>
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

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  );
};
