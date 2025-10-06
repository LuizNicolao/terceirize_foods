import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import config from '../config/environment';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Capturar dados do usuário da URL (SSO do Foods) e buscar no sistema de cotação
  const [user, setUser] = useState({ id: 1, name: 'Sistema', role: 'administrador' });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [permissions, setPermissions] = useState({
    dashboard: { can_view: true, can_create: true, can_edit: true, can_delete: true },
    usuarios: { can_view: true, can_create: true, can_edit: true, can_delete: true },
    cotacoes: { can_view: true, can_create: true, can_edit: true, can_delete: true },
    saving: { can_view: true, can_create: true, can_edit: true, can_delete: true },
    supervisor: { can_view: true, can_create: true, can_edit: true, can_delete: true },
    aprovacoes: { can_view: true, can_create: true, can_edit: true, can_delete: true }
  });

  // Implementação SSO real - só permite acesso via Foods
  useEffect(() => {
    const validateSSOAccess = async () => {
      try {
        // 1. Verificar se veio do Foods (dados na URL ou localStorage)
        let foodsUserData = localStorage.getItem('foodsUser');
        
        // 2. Se não há dados no localStorage, verificar URL parameters
        if (!foodsUserData) {
          const urlParams = new URLSearchParams(window.location.search);
          const ssoParam = urlParams.get('sso');
          
          if (ssoParam) {
            try {
              foodsUserData = decodeURIComponent(ssoParam);
              
              // Limpar URL parameters após ler
              const newUrl = window.location.origin + window.location.pathname;
              window.history.replaceState({}, document.title, newUrl);
            } catch (urlError) {
              // Erro ao decodificar parâmetros da URL
            }
          }
        }
        
        if (!foodsUserData) {
          // 3. Se não veio do Foods, bloquear acesso
          window.location.href = config.foodsUrl;
          return;
        }

        const foodsUser = JSON.parse(foodsUserData);

        // 3. Fazer login SSO no cotação
        try {
          const ssoResponse = await api.post('/auth/sso-login', {
            userData: foodsUser
          });

          if (ssoResponse.data.success) {
            // 4. Login SSO bem-sucedido
            setUser(ssoResponse.data.user);
            setToken(ssoResponse.data.token);
            
            // 5. Buscar permissões do usuário
            try {
              const permsResponse = await api.get(`/users/by-email/${encodeURIComponent(foodsUser.email)}`);
              if (permsResponse.data.data && permsResponse.data.data.permissions) {
                const permissionsObj = {};
                permsResponse.data.data.permissions.forEach(perm => {
                  permissionsObj[perm.screen] = {
                    can_view: perm.can_view === 1,
                    can_create: perm.can_create === 1,
                    can_edit: perm.can_edit === 1,
                    can_delete: perm.can_delete === 1
                  };
                });
                setPermissions(permissionsObj);
              }
            } catch (permError) {
              // Usar permissões padrão se não conseguir buscar
              setPermissions({
                dashboard: { can_view: true, can_create: false, can_edit: false, can_delete: false },
                usuarios: { can_view: false, can_create: false, can_edit: false, can_delete: false },
                cotacoes: { can_view: true, can_create: true, can_edit: true, can_delete: false },
                saving: { can_view: true, can_create: true, can_edit: true, can_delete: false },
                supervisor: { can_view: false, can_create: false, can_edit: false, can_delete: false },
                aprovacoes: { can_view: false, can_create: false, can_edit: false, can_delete: false }
              });
            }

            // 6. Limpar dados do localStorage APÓS login bem-sucedido
            localStorage.removeItem('foodsUser');
            
          } else {
            throw new Error('Falha no login SSO');
          }
        } catch (ssoError) {
          // Se falhar o SSO, redirecionar para Foods
          window.location.href = config.foodsUrl;
          return;
        }

      } catch (error) {
        // Em caso de erro, redirecionar para Foods
        window.location.href = config.foodsUrl;
        return;
      } finally {
        setLoading(false);
      }
    };

    validateSSOAccess();

    // 4. Verificar periodicamente se ainda está logado no Foods
    const checkSSOStatus = setInterval(() => {
      // Verificar se ainda há dados do Foods no localStorage
      const foodsUser = localStorage.getItem('foodsUser');
      if (!foodsUser && user) {
        logout();
      }
    }, 30000); // Verificar a cada 30 segundos

    // 5. Listener para logout do Foods
    const handleFoodsLogout = (event) => {
      if (event.data && event.data.type === 'FOODS_LOGOUT') {
        logout();
      }
    };

    window.addEventListener('message', handleFoodsLogout);

    return () => {
      clearInterval(checkSSOStatus);
      window.removeEventListener('message', handleFoodsLogout);
    };
  }, []);

  // DESABILITADO - Login centralizado no Foods
  const login = async (email, senha, rememberMeOption = false) => {
    return { success: true };
  };

  // Logout sincronizado com Foods
  const logout = () => {
    // 1. Limpar dados locais
    setUser(null);
    setToken(null);
    setPermissions({});
    
    // 2. Limpar localStorage e sessionStorage
    localStorage.removeItem('cotacao_token');
    localStorage.removeItem('cotacao_user');
    localStorage.removeItem('foodsUser');
    sessionStorage.removeItem('cotacao_token');
    
    // 3. Redirecionar para Foods
    window.location.href = config.foodsUrl;
  };

  // DESABILITADO - Permissões centralizadas no Foods
  // Agora todas as permissões são liberadas por padrão
  const hasPermission = (screen, action) => {
    return true;
  };

  const canView = (screen) => true;
  const canCreate = (screen) => true;
  const canEdit = (screen) => true;
  const canDelete = (screen) => true;

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