import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const PermissionGuard = ({ 
  screen, 
  action = 'can_view', 
  children, 
  fallback = null,
  requireAll = false 
}) => {
  const { hasPermission } = useAuth();

  // Se requireAll é true, verifica se tem todas as permissões
  if (requireAll && Array.isArray(action)) {
    const hasAllPermissions = action.every(perm => hasPermission(screen, perm));
    return hasAllPermissions ? children : fallback;
  }

  // Se action é um array, verifica se tem pelo menos uma permissão
  if (Array.isArray(action)) {
    const hasAnyPermission = action.some(perm => hasPermission(screen, perm));
    return hasAnyPermission ? children : fallback;
  }

  // Verifica uma única permissão
  const hasPermissionToShow = hasPermission(screen, action);
  return hasPermissionToShow ? children : fallback;
};

export default PermissionGuard; 