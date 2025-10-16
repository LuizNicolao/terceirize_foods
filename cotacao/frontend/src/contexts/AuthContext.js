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
            
            if (response.data.success) {
              // CORREÇÃO: A resposta tem dois níveis de "data"
              // response.data.data.data (não response.data.data)
              const responseData = response.data.data?.data || response.data.data;
              const { user: userData, token: jwtToken } = responseData;
              
              console.log('✅ SSO validado com sucesso:', userData?.email);
              
              // Salvar token JWT da Cotação
              localStorage.setItem('token', jwtToken);
              api.defaults.headers.authorization = `Bearer ${jwtToken}`;
              setToken(jwtToken);
              
              // Verificar se userData e token existem
              if (!userData || !jwtToken) {
                console.error('❌ Dados incompletos:', { userData, jwtToken });
                throw new Error('Dados do usuário ou token não recebidos do servidor');
              }
              
              // Salvar usuário
              setUser(userData);
              
              // Buscar permissões do usuário
              const permsResponse = await api.get(`/auth/users/${userData.id}/permissions`);
              console.log('📋 Resposta de permissões:', permsResponse.data);
              
              if (permsResponse.data.success) {
                // Mesmo problema: dois níveis de "data"
                const permsData = permsResponse.data.data?.data || permsResponse.data.data;
                const userPermissions = permsData?.permissions || permsData || {};
                
                setPermissions(userPermissions);
                console.log('✅ Permissões carregadas:', userPermissions);
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
                // Dois níveis de data
                const userData = response.data.data?.user || response.data.data;
                setUser(userData);
                
                // Buscar permissões
                const permsResponse = await api.get(`/auth/users/${userData.id}/permissions`);
                if (permsResponse.data.success) {
                  const permsData = permsResponse.data.data?.data || permsResponse.data.data;
                  const userPermissions = permsData?.permissions || permsData || {};
                  setPermissions(userPermissions);
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
