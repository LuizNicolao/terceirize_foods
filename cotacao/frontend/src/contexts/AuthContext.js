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
  const [user, setUser] = useState(null); // Sem usuário padrão
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [permissions, setPermissions] = useState({});

    // Validar token SSO da URL
  useEffect(() => {
    const validateSSOToken = async () => {
      try {
        console.log('🔍 Iniciando validação SSO...');
        console.log('🌐 URL completa:', window.location.href);
        console.log('🔍 Query string:', window.location.search);
        
        // Capturar token SSO da URL
        const params = new URLSearchParams(window.location.search);
        const ssoToken = params.get('sso_token');
        
        console.log('🔑 Token SSO na URL:', ssoToken ? 'Sim' : 'Não');
        if (ssoToken) {
          console.log('🔑 Token SSO (primeiros 50 chars):', ssoToken.substring(0, 50) + '...');
        }
        
        if (ssoToken) {
          console.log('🔐 Token SSO encontrado, validando com backend...');
          
          // Limpar URL (remover token da URL por segurança)
          window.history.replaceState({}, document.title, '/cotacao');
          
          try {
            // Validar token SSO com o backend
            const response = await api.post('/auth/sso', { token: ssoToken });
            
            console.log('📊 Resposta do backend SSO:', response.data);
            
            if (response.data.success) {
              const { user: userData, token: jwtToken } = response.data.data;
              
              console.log('✅ SSO validado com sucesso:', userData.email);
              
              // Salvar token JWT da Cotação
              localStorage.setItem('token', jwtToken);
              api.defaults.headers.authorization = `Bearer ${jwtToken}`;
              setToken(jwtToken);
              
              // Salvar usuário
              setUser(userData);
              
              // Buscar permissões do usuário
              const permsResponse = await api.get(`/auth/users/${userData.id}/permissions`);
              if (permsResponse.data.success) {
                setPermissions(permsResponse.data.data.permissions || {});
                console.log('✅ Permissões carregadas:', permsResponse.data.data.permissions);
              }
            } else {
              console.error('❌ Erro na validação SSO:', response.data.message);
            }
          } catch (error) {
            console.error('❌ Erro ao chamar /auth/sso:', error);
          }
          
          setLoading(false);
        } else {
          console.log('ℹ️ Sem token SSO na URL, verificando token local...');
          // Sem token SSO - verificar se já tem token local
          const localToken = localStorage.getItem('token');
          if (localToken) {
            console.log('🔑 Token local encontrado, verificando validade...');
            api.defaults.headers.authorization = `Bearer ${localToken}`;
            setToken(localToken);
            // Verificar token local
            try {
              const response = await api.get('/auth/verify');
              if (response.data.success) {
                console.log('✅ Token local válido, usuário autenticado');
                setUser(response.data.data.user);
                // Buscar permissões
                const permsResponse = await api.get(`/auth/users/${response.data.data.user.id}/permissions`);
                if (permsResponse.data.success) {
                  setPermissions(permsResponse.data.data.permissions || {});
                  console.log('✅ Permissões carregadas do token local');
                }
              } else {
                // Token inválido
                console.log('❌ Token local inválido, limpando...');
                localStorage.removeItem('token');
                setUser(null);
              }
            } catch (error) {
              // Token expirado ou inválido - limpar silenciosamente
              console.log('ℹ️ Token local expirado ou inválido');
              localStorage.removeItem('token');
              setUser(null);
            }
          } else {
            console.log('ℹ️ Nenhum token encontrado, usuário não autenticado');
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Erro no SSO:', error);
        setLoading(false);
      }
    };

    validateSSOToken();
  }, []);

  // DESABILITADO - Login centralizado no Foods
  const login = async (email, senha, rememberMeOption = false) => {
    return { success: true };
  };

  // DESABILITADO - Logout centralizado no Foods
  const logout = () => {
    // Não faz nada - logout controlado pelo Foods
  };

  // Verificar permissões reais
  const hasPermission = (screen, action) => {
    if (!permissions[screen]) return false;
    return permissions[screen][`can_${action}`] === true;
  };

  const canView = (screen) => hasPermission(screen, 'view');
  const canCreate = (screen) => hasPermission(screen, 'create');
  const canEdit = (screen) => hasPermission(screen, 'edit');
  const canDelete = (screen) => hasPermission(screen, 'delete');

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
