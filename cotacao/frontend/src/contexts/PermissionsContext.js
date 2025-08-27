import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState(false); // Sempre carregado
  const [permissions, setPermissions] = useState({});

  // Receber permissões do AuthContext
  const { permissions: authPermissions } = useAuth();

  useEffect(() => {
    if (authPermissions) {
      setPermissions(authPermissions);
    }
  }, [authPermissions]);

  const canView = (screen) => {
    // Usar permissões do usuário encontrado no sistema de cotação
    if (Array.isArray(permissions)) {
      const permission = permissions.find(p => p.screen === screen);
      return permission ? Boolean(permission.can_view) : true; // Padrão: permitir se não encontrado
    }
    if (!permissions[screen]) return true; // Padrão: permitir se não encontrado
    return permissions[screen].can_view || true;
  };

  const canCreate = (screen) => {
    if (Array.isArray(permissions)) {
      const permission = permissions.find(p => p.screen === screen);
      return permission ? Boolean(permission.can_create) : true;
    }
    if (!permissions[screen]) return true;
    return permissions[screen].can_create || true;
  };

  const canEdit = (screen) => {
    if (Array.isArray(permissions)) {
      const permission = permissions.find(p => p.screen === screen);
      return permission ? Boolean(permission.can_edit) : true;
    }
    if (!permissions[screen]) return true;
    return permissions[screen].can_edit || true;
  };

  const canDelete = (screen) => {
    if (Array.isArray(permissions)) {
      const permission = permissions.find(p => p.screen === screen);
      return permission ? Boolean(permission.can_delete) : true;
    }
    if (!permissions[screen]) return true;
    return permissions[screen].can_delete || true;
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
