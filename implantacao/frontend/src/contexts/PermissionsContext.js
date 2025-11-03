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

  const hasPermission = (screen, action, aba = null) => {
    // Se especificou uma aba, precisa verificar:
    // 1. Permissão específica da aba E
    // 2. Permissão geral da tela (pai) - obrigatória para funcionar
    if (aba) {
      const screenAba = `${screen}.${aba}`;
      
      // Verificar se tem permissão geral da tela (pai)
      const hasParentPermission = userPermissions[screen] && 
        (action === 'visualizar' ? userPermissions[screen].pode_visualizar :
         action === 'criar' ? userPermissions[screen].pode_criar :
         action === 'editar' ? userPermissions[screen].pode_editar :
         action === 'excluir' ? userPermissions[screen].pode_excluir :
         action === 'movimentar' ? userPermissions[screen].pode_movimentar : false);
      
      // Se tem permissão específica da aba
      if (userPermissions[screenAba]) {
        // Verificar ação específica da aba
        let hasAbaPermission = false;
        switch (action) {
          case 'visualizar':
            hasAbaPermission = userPermissions[screenAba].pode_visualizar;
            break;
          case 'criar':
            hasAbaPermission = userPermissions[screenAba].pode_criar;
            break;
          case 'editar':
            hasAbaPermission = userPermissions[screenAba].pode_editar;
            break;
          case 'excluir':
            hasAbaPermission = userPermissions[screenAba].pode_excluir;
            break;
          case 'movimentar':
            hasAbaPermission = userPermissions[screenAba].pode_movimentar;
            break;
          default:
            hasAbaPermission = false;
        }
        
        // Para a aba funcionar, precisa ter AMBAS: permissão pai E permissão filha
        return hasParentPermission && hasAbaPermission;
      }
      
      // Se não tem permissão específica da aba, mas tem permissão pai, usa a pai
      return hasParentPermission;
    }
    
    // Sem aba especificada: verificar apenas permissão geral da tela
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

  const canView = (screen, aba = null) => hasPermission(screen, 'visualizar', aba);
  const canCreate = (screen, aba = null) => hasPermission(screen, 'criar', aba);
  const canEdit = (screen, aba = null) => hasPermission(screen, 'editar', aba);
  const canDelete = (screen, aba = null) => hasPermission(screen, 'excluir', aba);
  const canMovimentar = (screen, aba = null) => hasPermission(screen, 'movimentar', aba);

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