import React from 'react';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useLogin } from '../../hooks/useLogin';

const Login = () => {
  const {
    formData,
    showPassword,
    isLoading,
    error,
    handleChange,
    togglePasswordVisibility,
    handleSubmit
  } = useLogin();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 to-green-800 px-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md animate-fade-in">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-600 mb-2">
            Sistema de Cotação
          </h1>
          <p className="text-gray-600">
            Sistema de gerenciamento de cotações
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo Email */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUser className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              disabled={isLoading}
            />
          </div>

          {/* Campo Senha */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Senha"
              value={formData.password}
              onChange={handleChange}
              className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              {showPassword ? (
                <FaEyeSlash className="h-5 w-5" />
              ) : (
                <FaEye className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm text-center">
                {error}
              </p>
            </div>
          )}

          {/* Botão de Login */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Entrando...
              </div>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        {/* Informações Adicionais */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Entre com suas credenciais para acessar o sistema
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
