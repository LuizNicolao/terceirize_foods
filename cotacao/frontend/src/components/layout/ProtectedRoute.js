import React from 'react';
import { useSSO } from '../../contexts/SSOContext';
import { LoadingSpinner } from '../ui';

const ProtectedRoute = ({ children, screen }) => {
  const { canView, loading } = useSSO();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!canView(screen)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Acesso Negado
          </h1>
          <p className="text-gray-600">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
