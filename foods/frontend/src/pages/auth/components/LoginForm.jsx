import React from 'react';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Button } from '../../../components/ui';

export const LoginForm = ({ 
  register, 
  handleSubmit, 
  onSubmit, 
  errors, 
  showPassword, 
  isLoading,
  togglePasswordVisibility 
}) => {
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Campo Email */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
          <FaUser />
        </div>
        <input
          type="email"
          placeholder="Email"
          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
          {...register('email', {
            required: 'Email é obrigatório',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Email inválido'
            }
          })}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Campo Senha */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
          <FaLock />
        </div>
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Senha"
          className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
          {...register('senha', {
            required: 'Senha é obrigatória',
            minLength: {
              value: 6,
              message: 'Senha deve ter pelo menos 6 caracteres'
            }
          })}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors duration-200"
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
        {errors.senha && (
          <p className="mt-1 text-sm text-red-600">{errors.senha.message}</p>
        )}
      </div>

      {/* Erro Geral */}
      {errors.root && (
        <div className={`p-3 rounded-lg text-sm text-center ${
          errors.root.type === 'rate-limit' 
            ? 'bg-orange-50 text-orange-800 border border-orange-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {errors.root.message}
        </div>
      )}

      {/* Botão de Login */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 transform hover:-translate-y-0.5"
      >
        {isLoading ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  );
};
