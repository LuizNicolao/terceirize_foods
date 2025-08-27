import React, { createContext, useContext, useState, useEffect } from 'react';
// import { useAuth } from './AuthContext'; // DESABILITADO - Autenticação centralizada no Foods

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

  // DESABILITADO - Autenticação centralizada no Foods
  // Agora todas as permissões são liberadas por padrão
  // As permissões específicas serão controladas internamente no sistema

  const canView = (screen) => {
    // DESABILITADO - Autenticação centralizada no Foods
    // Agora todas as permissões são liberadas por padrão
    return true;
  };

  const canCreate = (screen) => {
    // DESABILITADO - Autenticação centralizada no Foods
    // Agora todas as permissões são liberadas por padrão
    return true;
  };

  const canEdit = (screen) => {
    // DESABILITADO - Autenticação centralizada no Foods
    // Agora todas as permissões são liberadas por padrão
    return true;
  };

  const canDelete = (screen) => {
    // DESABILITADO - Autenticação centralizada no Foods
    // Agora todas as permissões são liberadas por padrão
    return true;
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
