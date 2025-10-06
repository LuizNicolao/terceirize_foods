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

  // Função para realizar login SSO
  const performSSOLogin = async (foodsUser) => {
    try {
      console.log('🔄 [COTACAO DEBUG] Iniciando login SSO com dados:', foodsUser);
      
      const ssoResponse = await api.post('/auth/sso-login', {
        userData: foodsUser
      });

      console.log('📡 [COTACAO DEBUG] Resposta do servidor SSO:', ssoResponse.data);

      if (ssoResponse.data.success) {
        // Login SSO bem-sucedido
        setUser(ssoResponse.data.user);
        setToken(ssoResponse.data.token);
        
        // Definir token no cabeçalho Authorization do axios
        api.defaults.headers.common['Authorization'] = `Bearer ${ssoResponse.data.token}`;
        
        // Buscar permissões do usuário usando rota pública
        try {
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
        
        console.log('✅ [COTACAO DEBUG] Login SSO realizado com sucesso para usuário:', ssoResponse.data.user.name);
      } else {
        throw new Error(ssoResponse.data.error || 'Erro no login SSO');
      }
    } catch (error) {
      console.error('❌ Erro no login SSO:', error);
      
      // Registrar log de erro
      const errorLog = {
        timestamp: new Date().toISOString(),
        step: 'sso_login_error',
        error: error.message,
        foodsUser: foodsUser,
        currentUrl: window.location.href
      };
      localStorage.setItem('sso_debug_error', JSON.stringify(errorLog));
      
      // Redirecionar para Foods em caso de erro
      window.location.href = config.foodsUrl;
    }
  };

  // Implementação SSO real - só permite acesso via Foods
  useEffect(() => {
    const validateSSOAccess = async () => {
      try {
        // 1. Verificar se veio do Foods (dados na URL ou localStorage)
        let foodsUserData = localStorage.getItem('foodsUser');
        
        // Registrar log no localStorage para debug
        const debugLog = {
          timestamp: new Date().toISOString(),
          step: 'check_foodsUserData',
          foodsUserData: foodsUserData,
          localStorageKeys: Object.keys(localStorage),
          currentUrl: window.location.href,
          userAgent: navigator.userAgent,
          referrer: document.referrer
        };
        localStorage.setItem('sso_debug_log', JSON.stringify(debugLog));
        console.log('🔍 [COTACAO DEBUG] Verificando dados SSO:', debugLog);
        
        // 2. Se não há dados no localStorage, verificar URL parameters
        if (!foodsUserData) {
          const urlParams = new URLSearchParams(window.location.search);
          const ssoParam = urlParams.get('sso');
          
          if (ssoParam) {
            try {
              foodsUserData = decodeURIComponent(ssoParam);
              console.log('✅ [COTACAO DEBUG] Dados SSO encontrados na URL:', foodsUserData);
              
              // Salvar no localStorage para futuras navegações
              localStorage.setItem('foodsUser', foodsUserData);
              console.log('✅ [COTACAO DEBUG] Dados salvos no localStorage');
              
              // Limpar URL parameters após ler
              const newUrl = window.location.origin + window.location.pathname;
              window.history.replaceState({}, document.title, newUrl);
              console.log('✅ [COTACAO DEBUG] URL limpa:', newUrl);
            } catch (urlError) {
              console.error('❌ [COTACAO DEBUG] Erro ao decodificar parâmetros da URL:', urlError);
            }
          }
        }
        
        // 3. Se não encontrou dados, aguardar um pouco e tentar novamente
        if (!foodsUserData) {
          console.log('⏳ Aguardando dados SSO...');
          
          // Aguardar 3 segundos e verificar novamente (tempo maior para garantir que os dados cheguem)
          setTimeout(async () => {
            const retryFoodsUserData = localStorage.getItem('foodsUser');
            console.log('🔍 [COTACAO DEBUG] Retry - dados encontrados:', retryFoodsUserData);
            
            if (!retryFoodsUserData) {
              console.log('❌ [COTACAO DEBUG] Nenhum dado SSO encontrado após retry, redirecionando para Foods');
              
              // Redirecionar para Foods
              window.location.href = config.foodsUrl;
            } else {
              // Tentar fazer login com os dados encontrados no retry
              try {
                const retryFoodsUser = JSON.parse(retryFoodsUserData);
                console.log('✅ [COTACAO DEBUG] Dados encontrados no retry, fazendo login:', retryFoodsUser);
                await performSSOLogin(retryFoodsUser);
              } catch (retryError) {
                console.error('❌ [COTACAO DEBUG] Erro no retry SSO:', retryError);
                window.location.href = config.foodsUrl;
              }
            }
          }, 3000);
          return;
        }

        const foodsUser = JSON.parse(foodsUserData);

        // 3. Fazer login SSO no cotação usando a função centralizada
        await performSSOLogin(foodsUser);

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