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
        console.log('🔍 Verificando localStorage do cotação...');
        
        // Tentar ler dados do sessionStorage primeiro
        const foodsUserData = sessionStorage.getItem('foodsUser');
        console.log('🔍 Dados do sessionStorage:', foodsUserData);
        
        if (foodsUserData) {
          const foodsUser = JSON.parse(foodsUserData);
          console.log('🔍 Usuário do Foods (localStorage):', foodsUser);
          
          // Buscar usuário no sistema de cotação por email
          console.log('🔍 Buscando usuário por email:', foodsUser.email);
          const response = await api.get(`/users/by-email/${encodeURIComponent(foodsUser.email)}`);
          
          console.log('🔍 Resposta da API:', response.data);
          
          if (response.data.data) {
            // Usuário encontrado no sistema de cotação
            console.log('✅ Usuário encontrado no sistema de cotação:', response.data.data);
            setUser(response.data.data);
            
            // Buscar permissões do usuário
            try {
              const permissionsResponse = await api.get(`/users/${response.data.data.id}/permissions`);
              setPermissions(permissionsResponse.data.data || {});
              console.log('✅ Permissões carregadas:', permissionsResponse.data.data);
            } catch (permissionsError) {
              console.warn('⚠️ Erro ao buscar permissões, usando permissões padrão:', permissionsError);
              setPermissions({});
            }
          } else {
            // Usuário não encontrado, usar dados do Foods
            console.log('⚠️ Usuário não encontrado no sistema de cotação, usando dados do Foods');
            setUser(foodsUser);
            setPermissions({});
            console.warn('Usuário não encontrado no sistema de cotação:', foodsUser.email);
          }
          
          // Limpar dados do sessionStorage
          sessionStorage.removeItem('foodsUser');
          console.log('✅ Dados removidos do sessionStorage');
          
          // Definir loading como false após processar
          setLoading(false);
          console.log('✅ Loading definido como false');
          console.log('✅ Estado final do usuário:', response.data.data);
        } else {
          console.log('⚠️ Nenhum usuário encontrado no sessionStorage');
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Erro ao buscar usuário:', error);
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