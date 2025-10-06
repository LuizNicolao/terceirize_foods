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
        console.log('🔍 Verificando localStorage...');
        console.log('🔍 localStorage completo:', localStorage);
        let foodsUserData = localStorage.getItem('foodsUser');
        console.log('🔍 foodsUserData do localStorage:', foodsUserData);
        console.log('🔍 Tipo do foodsUserData:', typeof foodsUserData);
        
        // Registrar log no localStorage para debug
        const debugLog = {
          timestamp: new Date().toISOString(),
          step: 'check_foodsUserData',
          foodsUserData: foodsUserData,
          localStorageKeys: Object.keys(localStorage),
          currentUrl: window.location.href
        };
        localStorage.setItem('sso_debug_log', JSON.stringify(debugLog));
        
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
              console.error('Erro ao decodificar parâmetros da URL:', urlError);
            }
          }
        }
        
        if (!foodsUserData) {
          // 3. Se não veio do Foods, bloquear acesso
          console.log('❌ Nenhum dado SSO encontrado, redirecionando para Foods');
          console.log('🔍 localStorage keys:', Object.keys(localStorage));
          console.log('🔍 URL atual:', window.location.href);
          console.log('🔍 Config foodsUrl:', config.foodsUrl);
          
          // Registrar log de erro no localStorage
          const errorLog = {
            timestamp: new Date().toISOString(),
            step: 'no_foodsUserData_found',
            foodsUserData: foodsUserData,
            localStorageKeys: Object.keys(localStorage),
            currentUrl: window.location.href,
            configFoodsUrl: config.foodsUrl,
            error: 'Nenhum dado SSO encontrado'
          };
          localStorage.setItem('sso_debug_error', JSON.stringify(errorLog));
          
          // Delay temporário para debug
          console.log('⏰ Aguardando 10 segundos antes de redirecionar...');
          setTimeout(() => {
            window.location.href = config.foodsUrl;
          }, 10000);
          return;
        }

        const foodsUser = JSON.parse(foodsUserData);
        console.log('🔍 foodsUser parseado:', foodsUser);

        // 3. Fazer login SSO no cotação
        try {
          console.log('🔍 Fazendo login SSO...');
          const ssoResponse = await api.post('/auth/sso-login', {
            userData: foodsUser
          });
          console.log('🔍 Resposta SSO:', ssoResponse.data);

          if (ssoResponse.data.success) {
            // 4. Login SSO bem-sucedido
            console.log('✅ Login SSO bem-sucedido!');
            setUser(ssoResponse.data.user);
            setToken(ssoResponse.data.token);
            
            // Definir token no cabeçalho Authorization do axios
            api.defaults.headers.common['Authorization'] = `Bearer ${ssoResponse.data.token}`;
            console.log('✅ Token definido no axios');
            
            // 5. Buscar permissões do usuário usando rota pública
            try {
              // Buscar permissões específicas do usuário via rota pública
              const userPermsResponse = await api.get(`/public/usuario/${ssoResponse.data.user.id}/permissions`);
              if (userPermsResponse.data && Array.isArray(userPermsResponse.data)) {
                const permissionsObj = {};
                userPermsResponse.data.forEach(perm => {
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
              console.error('Erro ao buscar permissões:', permError);
              // Usar permissões padrão se não conseguir buscar
              const defaultPerms = {
                dashboard: { can_view: true, can_create: false, can_edit: false, can_delete: false },
                usuarios: { can_view: false, can_create: false, can_edit: false, can_delete: false },
                cotacoes: { can_view: true, can_create: true, can_edit: true, can_delete: false },
                saving: { can_view: true, can_create: true, can_edit: true, can_delete: false },
                supervisor: { can_view: false, can_create: false, can_edit: false, can_delete: false },
                aprovacoes: { can_view: false, can_create: false, can_edit: false, can_delete: false }
              };
              setPermissions(defaultPerms);
            }

            // 6. NÃO limpar dados do localStorage para permitir reload da página
            // localStorage.removeItem('foodsUser');
            
          } else {
            throw new Error('Falha no login SSO');
          }
        } catch (ssoError) {
          // Se falhar o SSO, redirecionar para Foods
          console.error('❌ Erro no SSO:', ssoError);
          console.log('❌ Redirecionando para Foods devido ao erro');
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
    // localStorage.removeItem('foodsUser'); // NÃO limpar - necessário para SSO
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