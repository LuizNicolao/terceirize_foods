import React from 'react';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { FormInput } from '../ui/FormInput';
import { Button } from '../ui/Button';

export const LoginForm = ({
  onSubmit,
  register,
  isLoading,
  errors,
  showPassword,
  onTogglePassword
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <FormInput
        type="email"
        placeholder="Email"
        icon={<FaUser />}
        register={register('email', {
          required: 'Email é obrigatório',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Email inválido'
          }
        })}
        error={errors.email?.message}
      />

      <div className="relative">
        <FormInput
          type={showPassword ? 'text' : 'password'}
          placeholder="Senha"
          icon={<FaLock />}
          register={register('senha', {
            required: 'Senha é obrigatória',
            minLength: {
              value: 6,
              message: 'Senha deve ter pelo menos 6 caracteres'
            }
          })}
          error={errors.senha?.message}
        />
        
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
        >
          {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
        </button>
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
