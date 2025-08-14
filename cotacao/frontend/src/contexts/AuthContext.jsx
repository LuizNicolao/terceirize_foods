import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar se o usuário está logado ao carregar a aplicação
  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const storedUser = localStorage.getItem('user');
      const storedPermissions = localStorage.getItem('permissions');

      if (accessToken && refreshToken && storedUser) {
        try {
          // Configurar token padrão
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

          // Verificar se o token ainda é válido
          const response = await axios.get('/cotacao/api/auth/me');
          
          setUser(response.data.data.user);
          setPermissions(response.data.data.permissions);
          setIsAuthenticated(true);
        } catch (error) {
          // Token expirado, tentar renovar
          if (error.response?.status === 401) {
            try {
              const refreshResponse = await axios.post('/cotacao/api/auth/refresh', {
                refreshToken
              });

              const newAccessToken = refreshResponse.data.data.accessToken;
              
              // Atualizar tokens
              localStorage.setItem('accessToken', newAccessToken);
              axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

              // Buscar dados do usuário novamente
              const userResponse = await axios.get('/cotacao/api/auth/me');
              
              setUser(userResponse.data.data.user);
              setPermissions(userResponse.data.data.permissions);
              setIsAuthenticated(true);
            } catch (refreshError) {
              // Refresh token também expirado, fazer logout
              logout();
            }
          } else {
            logout();
          }
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/cotacao/api/auth/login', {
        email,
        password
      });

      const { user, permissions, tokens } = response.data.data;

      // Salvar no localStorage
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('permissions', JSON.stringify(permissions));

      // Configurar token padrão
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;

      // Atualizar estado
      setUser(user);
      setPermissions(permissions);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Erro ao fazer login';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    // Remover do localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');

    // Remover token do axios
    delete axios.defaults.headers.common['Authorization'];

    // Limpar estado
    setUser(null);
    setPermissions({});
    setIsAuthenticated(false);

    // Chamar logout no backend (opcional)
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      axios.post('/cotacao/api/auth/logout').catch(() => {
        // Ignorar erros no logout
      });
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axios.post('/cotacao/api/auth/change-password', {
        currentPassword,
        newPassword
      });

      toast.success('Senha alterada com sucesso!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Erro ao alterar senha';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const forgotPassword = async (email) => {
    try {
      await axios.post('/cotacao/api/auth/forgot-password', { email });
      
      toast.success('Se o email existir em nossa base, você receberá as instruções para redefinir sua senha');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Erro ao processar solicitação';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      await axios.post('/cotacao/api/auth/reset-password', {
        token,
        newPassword
      });

      toast.success('Senha redefinida com sucesso!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Erro ao redefinir senha';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const hasPermission = (screen, action) => {
    if (!permissions[screen]) return false;
    return permissions[screen][`can${action.charAt(0).toUpperCase() + action.slice(1)}`] || false;
  };

  const canView = (screen) => hasPermission(screen, 'view');
  const canCreate = (screen) => hasPermission(screen, 'create');
  const canEdit = (screen) => hasPermission(screen, 'edit');
  const canDelete = (screen) => hasPermission(screen, 'delete');

  const isAdmin = () => user?.role === 'administrador';
  const isGestor = () => user?.role === 'gestor';
  const isSupervisor = () => user?.role === 'supervisor';
  const isComprador = () => user?.role === 'comprador';

  const value = {
    user,
    permissions,
    isLoading,
    isAuthenticated,
    login,
    logout,
    changePassword,
    forgotPassword,
    resetPassword,
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canDelete,
    isAdmin,
    isGestor,
    isSupervisor,
    isComprador
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
