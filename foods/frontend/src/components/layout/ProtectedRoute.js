import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../../contexts/PermissionsContext';
import { LoadingSpinner } from '../ui';

const ProtectedRoute = ({ children, screen, requiredPermission = 'visualizar' }) => {
  const { canView, loading } = usePermissions();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Se não especificou screen, permite acesso (para rotas que não precisam de permissão específica)
  if (!screen) {
    return children;
  }

  // Verificar se o usuário pode visualizar a tela
  if (!canView(screen)) {
    return <Navigate to="/foods" replace />;
  }

  return children;
};

export default ProtectedRoute; 