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
  // Capturar dados do usuário da URL (SSO do Foods)
  const [user, setUser] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const userParam = urlParams.get('user');
      if (userParam) {
        const userData = JSON.parse(decodeURIComponent(userParam));
        return userData;
      }
    } catch (error) {
      console.error('Erro ao capturar dados do usuário:', error);
    }
    // Fallback para usuário padrão
    return { id: 1, name: 'Sistema', role: 'administrador' };
  });
  
  const [loading, setLoading] = useState(false);
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

  // Limpar parâmetros da URL após capturar dados do usuário
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('user')) {
      // Remover parâmetro user da URL
      urlParams.delete('user');
      const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '');
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  // DESABILITADO - Login centralizado no Foods
  const login = async (email, senha, rememberMeOption = false) => {
    return { success: true };
  };

  // DESABILITADO - Logout centralizado no Foods
  const logout = () => {
    // Não faz nada - logout controlado pelo Foods
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