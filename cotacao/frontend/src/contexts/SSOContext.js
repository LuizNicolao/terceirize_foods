import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const SSOContext = createContext({});

export const useSSO = () => {
  const context = useContext(SSOContext);
  if (!context) {
    throw new Error('useSSO deve ser usado dentro de um SSOProvider');
  }
  return context;
};

export const SSOProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissions, setPermissions] = useState({});

  // Função para validar token SSO
  const validateSSOToken = async (ssoToken) => {
    try {
      setLoading(true);
      setError(null);

      // Fazer requisição para validar o token SSO
      const response = await api.post('/sso/validate', {}, {
        params: { sso_token: ssoToken }
      });

      if (response.data.success) {
        const userData = response.data.data;
        setUser(userData);
        setPermissions(userData.permissions || {});
        
        // Salvar dados no localStorage para persistência
        localStorage.setItem('sso_user', JSON.stringify(userData));
        localStorage.setItem('sso_token', ssoToken);
        
        return { success: true, user: userData };
      } else {
        throw new Error(response.data.message || 'Falha na validação SSO');
      }
    } catch (error) {
      console.error('Erro na validação SSO:', error);
      setError(error.response?.data?.message || 'Erro na validação SSO');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Função para obter dados do usuário atual
  const getCurrentUser = async () => {
    try {
      const ssoToken = localStorage.getItem('sso_token');
      if (!ssoToken) {
        throw new Error('Token SSO não encontrado');
      }

      const response = await api.get('/sso/user', {
        params: { sso_token: ssoToken }
      });

      if (response.data.success) {
        const userData = response.data.data;
        setUser(userData);
        setPermissions(userData.permissions || {});
        return userData;
      } else {
        throw new Error(response.data.message || 'Falha ao obter dados do usuário');
      }
    } catch (error) {
      console.error('Erro ao obter dados do usuário:', error);
      setError(error.response?.data?.message || 'Erro ao obter dados do usuário');
      return null;
    }
  };

  // Função para logout
  const logout = () => {
    setUser(null);
    setPermissions({});
    setError(null);
    localStorage.removeItem('sso_user');
    localStorage.removeItem('sso_token');
    
    // Redirecionar para o sistema principal
    window.location.href = 'https://foods.terceirizemais.com.br/foods';
  };

  // Função para verificar permissões
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

  // Inicializar SSO na entrada do módulo
  useEffect(() => {
    const initializeSSO = async () => {
      try {
        setLoading(true);
        
        // Verificar se há token SSO na URL
        const urlParams = new URLSearchParams(window.location.search);
        const ssoToken = urlParams.get('sso_token');
        
        console.log('🔍 URL atual:', window.location.href);
        console.log('🔍 Token SSO na URL:', ssoToken ? 'Sim' : 'Não');
        
        if (ssoToken) {
          console.log('🔍 Validando token SSO...');
          // Validar token SSO
          const result = await validateSSOToken(ssoToken);
          console.log('🔍 Resultado da validação:', result);
          if (!result.success) {
            console.log('❌ Validação SSO falhou, redirecionando...');
            // Se falhar, redirecionar para o sistema principal
            window.location.href = 'https://foods.terceirizemais.com.br/foods';
            return;
          }
          
          // Remover token da URL após validação
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        } else {
          // Verificar se há token salvo no localStorage
          const savedToken = localStorage.getItem('sso_token');
          if (savedToken) {
            const userData = await getCurrentUser();
            if (!userData) {
              // Se falhar, redirecionar para o sistema principal
              window.location.href = 'https://foods.terceirizemais.com.br/foods';
              return;
            }
          } else {
            // Sem token, redirecionar para o sistema principal
            window.location.href = 'https://foods.terceirizemais.com.br/foods';
            return;
          }
        }
      } catch (error) {
        console.error('Erro na inicialização SSO:', error);
        setError('Erro na inicialização do sistema');
        // Redirecionar para o sistema principal em caso de erro
        window.location.href = 'https://foods.terceirizemais.com.br/foods';
      } finally {
        setLoading(false);
      }
    };

    initializeSSO();
  }, []);

  return (
    <SSOContext.Provider value={{
      user,
      loading,
      error,
      permissions,
      validateSSOToken,
      getCurrentUser,
      logout,
      hasPermission,
      canView,
      canCreate,
      canEdit,
      canDelete,
      isAuthenticated: !!user
    }}>
      {children}
    </SSOContext.Provider>
  );
};
