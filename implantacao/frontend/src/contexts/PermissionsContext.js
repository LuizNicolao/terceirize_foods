import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const PermissionsContext = createContext({});

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions deve ser usado dentro de um PermissionsProvider');
  }
  return context;
};

export const PermissionsProvider = ({ children }) => {
  const [userPermissions, setUserPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserPermissions();
    } else {
      setUserPermissions({});
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const loadUserPermissions = async () => {
    try {
      setLoading(true);
      
      const response = await api.get(`/permissoes/usuario/${user.id}`);
      
      // Verificar se a resposta tem a estrutura esperada
      let permissoes = [];
      
      if (response.data && response.data.success && response.data.data && response.data.data.permissoes) {
        // Nova estrutura: { success: true, data: { permissoes: [...] } }
        permissoes = response.data.data.permissoes;
      } else if (response.data && response.data.permissoes) {
        // Estrutura antiga: { permissoes: [...] }
        permissoes = response.data.permissoes;
      } else {
        permissoes = [];
      }
      
      // Converter permissões para um formato mais fácil de usar
      const permissions = {};
      permissoes.forEach(perm => {
        permissions[perm.tela] = {
          pode_visualizar: perm.pode_visualizar === 1,
          pode_criar: perm.pode_criar === 1,
          pode_editar: perm.pode_editar === 1,
          pode_excluir: perm.pode_excluir === 1,
          pode_movimentar: perm.pode_movimentar === 1
        };
      });
      
      setUserPermissions(permissions);
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
      setUserPermissions({});
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (screen, action) => {
    if (!userPermissions[screen]) {
      return false;
    }
    
    switch (action) {
      case 'visualizar':
        return userPermissions[screen].pode_visualizar;
      case 'criar':
        return userPermissions[screen].pode_criar;
      case 'editar':
        return userPermissions[screen].pode_editar;
      case 'excluir':
        return userPermissions[screen].pode_excluir;
      case 'movimentar':
        return userPermissions[screen].pode_movimentar;
      default:
        return false;
    }
  };

  const canView = (screen) => hasPermission(screen, 'visualizar');
  const canCreate = (screen) => hasPermission(screen, 'criar');
  const canEdit = (screen) => hasPermission(screen, 'editar');
  const canDelete = (screen) => hasPermission(screen, 'excluir');
  const canMovimentar = (screen) => hasPermission(screen, 'movimentar');

  const value = {
    userPermissions,
    loading,
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canMovimentar,
    reloadPermissions: loadUserPermissions
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}; 