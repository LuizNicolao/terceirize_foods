import React from 'react';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/auth/LoginForm';

const Login = () => {
  const { loading, showPassword, handleLogin, togglePasswordVisibility } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-green-700">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-4 animate-fadeInUp">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-600 mb-2">
            Foods
          </h1>
          <p className="text-gray-600">
            Sistema de Terceirização de Alimentos
          </p>
        </div>

        {/* Subtítulo */}
        <p className="text-center text-gray-600 mb-8">
          Faça login para acessar o sistema
        </p>

        {/* Formulário */}
        <LoginForm
          onSubmit={handleLogin}
          loading={loading}
          showPassword={showPassword}
          onTogglePassword={togglePasswordVisibility}
        />

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            © 2024 Terceirize Mais. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 