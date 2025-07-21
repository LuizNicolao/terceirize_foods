import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    checkAuthStatus();
    checkSSO();
  }, []);

  const checkSSO = async () => {
    try {
      // Verificar se há token SSO na URL
      const urlParams = new URLSearchParams(window.location.search);
      const ssoToken = urlParams.get('sso_token');
      
      if (ssoToken) {
        console.log('🔍 Token SSO encontrado, tentando autenticar...');
        
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/sso`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token: ssoToken })
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('token', data.token);
          setUser(data.user);
          setIsAuthenticated(true);
          
          // Buscar permissões do usuário
          await fetchUserPermissions(data.user.id);
          
          // Limpar o parâmetro da URL
          window.history.replaceState({}, document.title, window.location.pathname);
          
          console.log('✅ SSO realizado com sucesso!');
        } else {
          console.log('❌ SSO falhou, removendo token da URL');
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    } catch (error) {
      console.error('Erro no SSO:', error);
      // Limpar o parâmetro da URL em caso de erro
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
        
        // Buscar permissões do usuário
        await fetchUserPermissions(userData.id);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Erro ao verificar status de autenticação:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPermissions = async (userId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/${userId}/permissions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const permissionsData = await response.json();
        
        const permissionsMap = {};
        
        permissionsData.forEach(permission => {
          permissionsMap[permission.screen] = {
            can_view: permission.can_view === 1,
            can_create: permission.can_create === 1,
            can_edit: permission.can_edit === 1,
            can_delete: permission.can_delete === 1
          };
        });
        
        setPermissions(permissionsMap);
      }
    } catch (error) {
      console.error('Erro ao buscar permissões:', error);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        
        // Buscar permissões do usuário
        await fetchUserPermissions(data.user.id);
        
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Erro no login' };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, message: 'Erro ao conectar com o servidor' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    setPermissions({});
  };

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

  const value = {
    user,
    isAuthenticated,
    loading,
    permissions,
    login,
    logout,
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canDelete
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 