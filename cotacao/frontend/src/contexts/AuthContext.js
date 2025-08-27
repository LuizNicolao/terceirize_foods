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
      // Verificar se há token SSO na URL
      const urlParams = new URLSearchParams(window.location.search);
      const ssoToken = urlParams.get('sso_token');
      
      console.log('🔍 Verificando SSO:', { ssoToken: !!ssoToken, hasToken: !!token });
      
      if (ssoToken && !token) {
        console.log('🔍 Iniciando login SSO...');
        // Tentar login SSO
        try {
          const response = await api.post('/auth/sso', { token: ssoToken });
          console.log('🔍 Resposta SSO:', response.data);
          const { token: newToken, user: userData } = response.data.data.data;
          
          if (userData && userData.id) {
            localStorage.setItem('token', newToken);
            api.defaults.headers.authorization = `Bearer ${newToken}`;
            setToken(newToken);
            setUser(userData);
            
            // Buscar permissões do usuário
            try {
              const permissionsResponse = await api.get(`/auth/users/${userData.id}/permissions`);
              setPermissions(permissionsResponse.data.data.data.permissions || {});
            } catch (error) {
              console.error('Erro ao buscar permissões:', error);
              setPermissions({
                dashboard: { can_view: true, can_create: true, can_edit: true, can_delete: true },
                usuarios: { can_view: true, can_create: true, can_edit: true, can_delete: true },
                cotacoes: { can_view: true, can_create: true, can_edit: true, can_delete: true },
                saving: { can_view: true, can_create: true, can_edit: true, can_delete: true }
              });
            }
            
            // Limpar o token SSO da URL
            window.history.replaceState({}, document.title, window.location.pathname);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Erro no login SSO:', error);
          // Se falhar, continuar com o fluxo normal
        }
      }
      
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

  // Função de login desabilitada - SSO apenas
  const login = async (email, senha, rememberMeOption = false) => {
    // Login desabilitado - usar SSO
    return { 
      success: false, 
      error: 'Login direto desabilitado. Use o sistema Foods para acessar.' 
    };
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rememberMe');
    delete api.defaults.headers.authorization;
    setToken(null);
    setUser(null);
    setRememberMe(false);
    setPermissions({});
    
    // Redirecionar para o sistema foods após logout
    window.location.href = 'https://foods.terceirizemais.com.br/foods';
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