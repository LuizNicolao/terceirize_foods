import React from 'react';
import { useForm } from 'react-hook-form';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Button, Input } from '../ui';

const LoginForm = ({ onSubmit, loading, showPassword, onTogglePassword }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Campo Email */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaUser className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="email"
          placeholder="Email"
          className="pl-10"
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
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaLock className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder="Senha"
          className="pl-10 pr-10"
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
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          onClick={onTogglePassword}
        >
          {showPassword ? (
            <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          ) : (
            <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          )}
        </button>
        {errors.senha && (
          <p className="mt-1 text-sm text-red-600">{errors.senha.message}</p>
        )}
      </div>

      {/* Botão de Login */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Entrando...
          </div>
        ) : (
          'Entrar'
        )}
      </Button>
    </form>
  );
};

export default LoginForm;
