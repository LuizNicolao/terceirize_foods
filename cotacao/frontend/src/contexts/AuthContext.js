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
  const [rememberMe, setRememberMe] = useState(localStorage.getItem('rememberMe') === 'true');
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          api.defaults.headers.authorization = `Bearer ${token}`;
          const response = await api.get('/auth/verify');
          setUser(response.data.data.data.user);
          
          // Buscar permissões do usuário
          if (response.data.data.data.user) {
            try {
              const permissionsResponse = await api.get(`/auth/users/${response.data.data.data.user.id}/permissions`);
              setPermissions(permissionsResponse.data.data.data.permissions || {});
            } catch (error) {
              console.error('Erro ao buscar permissões:', error);
              // Definir permissões padrão para administrador
              setPermissions({
                dashboard: { can_view: true, can_create: true, can_edit: true, can_delete: true },
                usuarios: { can_view: true, can_create: true, can_edit: true, can_delete: true },
                cotacoes: { can_view: true, can_create: true, can_edit: true, can_delete: true },
                saving: { can_view: true, can_create: true, can_edit: true, can_delete: true }
              });
            }
          }
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
      
      const { token: newToken, user: userData } = response.data.data.data;
      
      // Verificar se userData existe e tem id
      if (!userData || !userData.id) {
        console.error('userData ou userData.id não encontrado:', userData);
        return { 
          success: false, 
          error: 'Dados do usuário inválidos' 
        };
      }
      
      // Salvar token no localStorage
      localStorage.setItem('token', newToken);
      
      // Salvar preferência "Mantenha-me conectado"
      localStorage.setItem('rememberMe', rememberMeOption.toString());
      setRememberMe(rememberMeOption);
      
      api.defaults.headers.authorization = `Bearer ${newToken}`;
      
      setToken(newToken);
      setUser(userData);
      
      // Buscar permissões do usuário
      try {
        const permissionsResponse = await api.get(`/auth/users/${userData.id}/permissions`);
        setPermissions(permissionsResponse.data.data.data.permissions || {});
      } catch (error) {
        console.error('Erro ao buscar permissões:', error);
        // Definir permissões padrão para administrador
        setPermissions({
          dashboard: { can_view: true, can_create: true, can_edit: true, can_delete: true },
          usuarios: { can_view: true, can_create: true, can_edit: true, can_delete: true },
          cotacoes: { can_view: true, can_create: true, can_edit: true, can_delete: true },
          saving: { can_view: true, can_create: true, can_edit: true, can_delete: true }
        });
      }
      
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
        error: error.response?.data?.message || 'Erro ao fazer login' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rememberMe');
    delete api.defaults.headers.authorization;
    setToken(null);
    setUser(null);
    setRememberMe(false);
    setPermissions({});
  };

  const hasPermission = (screen, action) => {
    if (!permissions[screen]) {
      return false;
    }
    
    return permissions[screen][action] || false;
  };

  const canView = (screen) => hasPermission(screen, 'can_view');
  const canCreate = (screen) => hasPermission(screen, 'can_create');
  const canEdit = (screen) => hasPermission(screen, 'can_edit');
  const canDelete = (screen) => hasPermission(screen, 'can_delete');

  const value = {
    user,
    token,
    loading,
    rememberMe,
    permissions,
    login,
    logout,
    canView,
    canCreate,
    canEdit,
    canDelete,
    hasPermission,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 