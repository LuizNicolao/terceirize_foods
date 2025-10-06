import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
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
    try {
      const savedUser = localStorage.getItem('necessidades_user');
      return savedUser && savedUser !== 'null' ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('Erro ao carregar usuário do localStorage:', error);
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('necessidades_token'));
  const [rememberMe, setRememberMe] = useState(localStorage.getItem('necessidades_rememberMe') === 'true');

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          api.defaults.headers.authorization = `Bearer ${token}`;
          const response = await api.get('/auth/verify');
          // A nova estrutura da API retorna os dados em response.data.data
          const userData = response.data.data ? response.data.data.usuario : response.data.usuario;
          setUser(userData);
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
        senha
      });
      // A nova estrutura da API retorna os dados em response.data.data
      const responseData = response.data.data ? response.data.data : response.data;
      const { token: newToken, usuario: userData } = responseData;
      
      // Salvar token no localStorage
      localStorage.setItem('necessidades_token', newToken);
      
      // Salvar usuário no localStorage
      localStorage.setItem('necessidades_user', JSON.stringify(userData));
      
      // Salvar preferência "Mantenha-me conectado"
      localStorage.setItem('necessidades_rememberMe', rememberMeOption.toString());
      setRememberMe(rememberMeOption);
      
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
    localStorage.removeItem('necessidades_token');
    localStorage.removeItem('necessidades_user');
    localStorage.removeItem('necessidades_rememberMe');
    delete api.defaults.headers.authorization;
    setToken(null);
    setUser(null);
    setRememberMe(false);
  };

  const value = {
    user,
    token,
    loading,
    rememberMe,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
