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
          pode_visualizar: perm.pode_visualizar === 1 || perm.pode_visualizar === true,
          pode_criar: perm.pode_criar === 1 || perm.pode_criar === true,
          pode_editar: perm.pode_editar === 1 || perm.pode_editar === true,
          pode_excluir: perm.pode_excluir === 1 || perm.pode_excluir === true,
          pode_movimentar: perm.pode_movimentar === 1 || perm.pode_movimentar === true,
          // Permissões específicas de chamados (podem não existir para outras telas)
          pode_assumir: (perm.pode_assumir === 1 || perm.pode_assumir === true) || false,
          pode_concluir: (perm.pode_concluir === 1 || perm.pode_concluir === true) || false,
          pode_reabrir: (perm.pode_reabrir === 1 || perm.pode_reabrir === true) || false,
          pode_atribuir: (perm.pode_atribuir === 1 || perm.pode_atribuir === true) || false
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
    // Se não há permissões específicas para a tela, NEGAR acesso por padrão (segurança)
    // Isso garante que apenas usuários com permissões explícitas tenham acesso
    if (!userPermissions[screen]) {
      return false; // Negar acesso quando não há permissões específicas (segurança por padrão)
    }
    
    const screenPerms = userPermissions[screen];
    
    switch (action) {
      case 'visualizar':
        return screenPerms.pode_visualizar === true;
      case 'criar':
        return screenPerms.pode_criar === true;
      case 'editar':
        return screenPerms.pode_editar === true;
      case 'excluir':
        return screenPerms.pode_excluir === true;
      case 'movimentar':
        return screenPerms.pode_movimentar === true;
      // Permissões específicas de chamados - verificar explicitamente se é true
      case 'assumir':
        return screenPerms.pode_assumir === true;
      case 'concluir':
        return screenPerms.pode_concluir === true;
      case 'reabrir':
        return screenPerms.pode_reabrir === true;
      case 'atribuir':
        return screenPerms.pode_atribuir === true;
      default:
        return false; // Negar por padrão para ações desconhecidas (mais seguro)
    }
  };

  const canView = (screen) => hasPermission(screen, 'visualizar');
  const canCreate = (screen) => hasPermission(screen, 'criar');
  const canEdit = (screen) => hasPermission(screen, 'editar');
  const canDelete = (screen) => hasPermission(screen, 'excluir');
  const canMovimentar = (screen) => hasPermission(screen, 'movimentar');
  
  // Permissões específicas de chamados
  const canAssumir = (screen) => hasPermission(screen, 'assumir');
  const canConcluir = (screen) => hasPermission(screen, 'concluir');
  const canReabrir = (screen) => hasPermission(screen, 'reabrir');
  const canAtribuir = (screen) => hasPermission(screen, 'atribuir');

  const value = {
    userPermissions,
    loading,
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canMovimentar,
    canAssumir,
    canConcluir,
    canReabrir,
    canAtribuir,
    reloadPermissions: loadUserPermissions
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}; 