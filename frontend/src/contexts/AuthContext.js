import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          api.defaults.headers.authorization = `Bearer ${token}`;
          const response = await api.get('/auth/verify');
          setUser(response.data.user);
        } catch (error) {
          console.error('Token inválido:', error);
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  const login = async (email, senha) => {
    try {
      const response = await api.post('/auth/login', { email, senha });
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      api.defaults.headers.authorization = `Bearer ${newToken}`;
      
      setToken(newToken);
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      // Tratamento específico para erro 429 (Too Many Requests)
      if (error.response?.status === 429) {
        return { 
          success: false, 
          error: 'Muitas tentativas de login. Aguarde 15 minutos ou reinicie o servidor.',
          isRateLimited: true
        };
      }
      
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao fazer login' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.authorization;
    setToken(null);
    setUser(null);
  };

  const changePassword = async (senhaAtual, novaSenha) => {
    try {
      await api.post('/auth/change-password', { senha_atual: senhaAtual, nova_senha: novaSenha });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao alterar senha' 
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    changePassword,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 