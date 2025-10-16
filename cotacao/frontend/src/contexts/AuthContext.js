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
        // Capturar token SSO da URL
        const params = new URLSearchParams(window.location.search);
        const ssoToken = params.get('sso_token');
        
        if (ssoToken) {
          
          // Limpar URL (remover token da URL por segurança)
          window.history.replaceState({}, document.title, '/cotacao');
          
          try {
            // Validar token SSO com o backend
            const response = await api.post('/auth/sso', { token: ssoToken });
            
            if (response.data.success) {
              // A resposta tem dois níveis de "data"
              const responseData = response.data.data?.data || response.data.data;
              const { user: userData, token: jwtToken } = responseData;
              
              // Verificar se userData e token existem
              if (!userData || !jwtToken) {
                throw new Error('Dados do usuário ou token não recebidos do servidor');
              }
              
              // Salvar token JWT da Cotação
              localStorage.setItem('token', jwtToken);
              api.defaults.headers.authorization = `Bearer ${jwtToken}`;
              setToken(jwtToken);
              setUser(userData);
              
              // Buscar permissões do usuário
              const permsResponse = await api.get(`/auth/users/${userData.id}/permissions`);
              
              if (permsResponse.data.success) {
                const permsData = permsResponse.data.data?.data || permsResponse.data.data;
                const userPermissions = permsData?.permissions || permsData || {};
                setPermissions(userPermissions);
              }
            }
          } catch (error) {
            console.error('Erro ao validar SSO:', error);
          }
          
          setLoading(false);
        } else {
          // Sem token SSO - verificar se já tem token local
          const localToken = localStorage.getItem('token');
          if (localToken) {
            api.defaults.headers.authorization = `Bearer ${localToken}`;
            setToken(localToken);
            
            try {
              const response = await api.get('/auth/verify');
              
              if (response.data.success) {
                // Dois níveis de data
                const verifyData = response.data.data?.data || response.data.data;
                const userData = verifyData?.user || verifyData;
                setUser(userData);
                
                // Buscar permissões
                const permsResponse = await api.get(`/auth/users/${userData.id}/permissions`);
                
                if (permsResponse.data.success) {
                  const permsData = permsResponse.data.data?.data || permsResponse.data.data;
                  const userPermissions = permsData?.permissions || permsData || {};
                  setPermissions(userPermissions);
                }
              } else {
                localStorage.removeItem('token');
                setUser(null);
              }
            } catch (error) {
              // Token expirado ou inválido - limpar silenciosamente
              localStorage.removeItem('token');
              setUser(null);
            }
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
