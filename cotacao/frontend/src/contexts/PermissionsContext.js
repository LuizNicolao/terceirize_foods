import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const PermissionsContext = createContext();

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions deve ser usado dentro de um PermissionsProvider');
  }
  return context;
};

export const PermissionsProvider = ({ children }) => {
  const { user, permissions } = useAuth();
  const [loading, setLoading] = useState(true);

  const loadUserPermissions = useCallback(async () => {
    if (user && user.id) {
      setLoading(true);
      try {
        // As permissões já são carregadas no AuthContext
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar permissões:', error);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadUserPermissions();
  }, [loadUserPermissions]);

  const canView = (screen) => {
    // Se permissions é um array, procurar pela permissão
    if (Array.isArray(permissions)) {
      const permission = permissions.find(p => p.screen === screen);
      if (!permission) {
        return false;
      }
      return Boolean(permission.can_view);
    }
    
    // Se permissions é um objeto (formato antigo)
    if (!permissions[screen]) {
      return false;
    }
    return permissions[screen].can_view || false;
  };

  const canCreate = (screen) => {
    if (Array.isArray(permissions)) {
      const permission = permissions.find(p => p.screen === screen);
      return permission ? Boolean(permission.can_create) : false;
    }
    if (!permissions[screen]) return false;
    return permissions[screen].can_create || false;
  };

  const canEdit = (screen) => {
    if (Array.isArray(permissions)) {
      const permission = permissions.find(p => p.screen === screen);
      return permission ? Boolean(permission.can_edit) : false;
    }
    if (!permissions[screen]) return false;
    return permissions[screen].can_edit || false;
  };

  const canDelete = (screen) => {
    if (Array.isArray(permissions)) {
      const permission = permissions.find(p => p.screen === screen);
      return permission ? Boolean(permission.can_delete) : false;
    }
    if (!permissions[screen]) return false;
    return permissions[screen].can_delete || false;
  };

  const value = {
    loading,
    canView,
    canCreate,
    canEdit,
    canDelete
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};
