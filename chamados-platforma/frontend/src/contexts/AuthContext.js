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
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [rememberMe, setRememberMe] = useState(localStorage.getItem('rememberMe') === 'true');

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

  const login = async (email, senha, rememberMeOption = false) => {
    try {
      const response = await api.post('/auth/login', { 
        email, 
        senha,
        rememberMe: rememberMeOption 
      });
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('rememberMe', rememberMeOption.toString());
      setRememberMe(rememberMeOption);
      
      api.defaults.headers.authorization = `Bearer ${newToken}`;
      
      setToken(newToken);
      setUser(userData);
      
      return { success: true };
    } catch (error) {
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
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    delete api.defaults.headers.authorization;
    setToken(null);
    setUser(null);
    setRememberMe(false);
  };

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      rememberMe,
      login,
      logout,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};

