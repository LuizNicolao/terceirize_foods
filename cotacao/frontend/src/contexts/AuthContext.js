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

    // Buscar usuário do sistema de cotação baseado no email do Foods
  useEffect(() => {
    const findUserByEmail = async () => {
      try {
        // Tentar ler dados do sessionStorage primeiro
        const foodsUserData = sessionStorage.getItem('foodsUser');
        
        if (foodsUserData) {
          const foodsUser = JSON.parse(foodsUserData);
          
          // Buscar usuário no sistema de cotação por email
          const response = await api.get(`/users/by-email/${encodeURIComponent(foodsUser.email)}`);
          
          if (response.data.data) {
            // Usuário encontrado no sistema de cotação
            setUser(response.data.data.data);
            
            // Usar permissões que já vêm na resposta do usuário
            if (response.data.data.data.permissions) {
              // Converter array de permissões para objeto
              const permissionsObj = {};
              response.data.data.data.permissions.forEach(perm => {
                permissionsObj[perm.screen] = {
                  can_view: perm.can_view === 1,
                  can_create: perm.can_create === 1,
                  can_edit: perm.can_edit === 1,
                  can_delete: perm.can_delete === 1
                };
              });
              setPermissions(permissionsObj);
            } else {
              setPermissions({});
            }
          } else {
            // Usuário não encontrado, usar dados do Foods
            setUser(foodsUser);
            setPermissions({});
          }
          
          // Definir loading como false após processar
          setLoading(false);
          
          // Limpar dados do sessionStorage APÓS definir o usuário
          sessionStorage.removeItem('foodsUser');
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        // Em caso de erro, manter usuário padrão
        setLoading(false);
      }
    };

    findUserByEmail();
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
