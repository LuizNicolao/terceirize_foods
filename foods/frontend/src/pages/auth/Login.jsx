import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  console.log('Login component rendering...');
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted');
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const senha = formData.get('senha');
    
    console.log('Login attempt:', { email, senha });
    
    const result = await login(email, senha);
    if (result.success) {
      navigate('/foods');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-600 to-green-800">
      <div className="bg-white rounded-xl shadow-2xl p-8 sm:p-10 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">
            Foods
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Sistema de Cadastro de Informações
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all duration-300"
            />
          </div>

          <div className="space-y-1">
            <input
              type="password"
              name="senha"
              placeholder="Senha"
              required
              className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all duration-300"
            />
          </div>

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
