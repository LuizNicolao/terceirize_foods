import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { PermissionsProvider } from './contexts/PermissionsContext';
import { Layout, ProtectedRoute } from './components/layout';
import { LoadingSpinner } from './components/ui';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/usuarios/Usuarios';
import Permissoes from './pages/permissoes/Permissoes';
import Chamados from './pages/chamados/Chamados';

// Componente para rotas protegidas com autenticação
const AuthenticatedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <PermissionsProvider>
      <Layout>{children}</Layout>
    </PermissionsProvider>
  );
};

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Rota de login */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <Login />
        } 
      />

      {/* Rotas protegidas */}
      <Route 
        path="/dashboard" 
        element={
          <AuthenticatedRoute>
            <Dashboard />
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/usuarios" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="usuarios">
              <Usuarios />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/permissoes" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="permissoes">
              <Permissoes />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/chamados" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="chamados">
              <Chamados />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      {/* Rota padrão */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <Navigate to="/login" replace />
        } 
      />
    </Routes>
  );
}

export default App;

