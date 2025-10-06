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
      
      // Salvar token no localStorage
      localStorage.setItem('token', newToken);
      
      // Salvar usuário no localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Salvar preferência "Mantenha-me conectado"
      localStorage.setItem('rememberMe', rememberMeOption.toString());
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
    // 1. Limpar dados locais
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    delete api.defaults.headers.authorization;
    setToken(null);
    setUser(null);
    setRememberMe(false);
    
    // 2. Limpar dados compartilhados
    localStorage.removeItem('foodsUser');
    
    // 3. Notificar sistemas filhos sobre o logout (mas não fechar janelas automaticamente)
    window.postMessage({ type: 'FOODS_LOGOUT' }, '*');
    
    // 4. Tentar fechar janela do cotação se estiver aberta (apenas se for logout manual)
    if (window.cotacaoWindow && !window.cotacaoWindow.closed) {
      try {
        // Notificar o cotacao sobre o logout antes de fechar
        window.cotacaoWindow.postMessage({ type: 'FOODS_LOGOUT' }, '*');
        setTimeout(() => {
          if (!window.cotacaoWindow.closed) {
            window.cotacaoWindow.close();
          }
        }, 1000);
      } catch (e) {
        // Não foi possível fechar janela do cotação
        console.log('Não foi possível fechar janela do cotação:', e);
      }
    }
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
    rememberMe,
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