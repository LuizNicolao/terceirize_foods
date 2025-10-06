import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PermissionsProvider } from './contexts/PermissionsContext';
import { Layout, ProtectedRoute } from './components/layout';
import { LoadingSpinner } from './components/ui';
import './utils/axiosConfig'; // Importar configuração do axios
import './design-system'; // Importar design system
import Login from './pages/auth';
import Dashboard from './pages/dashboard';
import Usuarios from './pages/usuarios';
// import { EditarUsuario, VisualizarUsuario } from './components/usuarios'; // Removido - componentes não mais utilizados
import Cotacoes from './pages/cotacoes';
// import { AnalisarCotacao } from './components/cotacoes'; // Removido - componente não mais utilizado
import { Supervisor, AnalisarCotacaoSupervisor } from './pages/supervisor';
import NovaCotacao from './pages/cotacoes/NovaCotacao';
import VisualizarCotacao from './pages/cotacoes/VisualizarCotacao';
import EditarCotacao from './pages/cotacoes/EditarCotacao';
import Saving from './pages/saving/Saving';
import { Aprovacoes, VisualizarAprovacao } from './pages/aprovacoes';

  // Componente para rotas protegidas com autenticação
  const AuthenticatedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
      return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    return <Layout>{children}</Layout>;
  };

// Componente para rotas públicas
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};


function AppRoutes() {
  return (
    <Routes>
      {/* Rota pública */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />

      {/* Rotas protegidas */}
      <Route 
        path="/dashboard" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="dashboard">
              <Dashboard />
            </ProtectedRoute>
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
        path="/cotacoes" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="cotacoes">
              <Cotacoes />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/nova-cotacao" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="cotacoes">
              <NovaCotacao />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/visualizar-cotacao/:id" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="cotacoes">
              <VisualizarCotacao />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/editar-cotacao/:id" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="cotacoes">
              <EditarCotacao />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      {/* Rotas removidas - componentes não mais utilizados
      <Route 
        path="/editar-usuario/:id" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="usuarios">
              <EditarUsuario />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/visualizar-usuario/:id" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="usuarios">
              <VisualizarUsuario />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />
      */}

      <Route 
        path="/supervisor" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="supervisor">
              <Supervisor />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/supervisor/analisar/:id" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="supervisor">
              <AnalisarCotacaoSupervisor />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/aprovacoes" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="aprovacoes">
              <Aprovacoes />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/aprovacoes/visualizar/:id" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="aprovacoes">
              <VisualizarAprovacao />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      {/* Rota removida - componente AnalisarCotacao não mais utilizado
      <Route 
        path="/analisar-cotacao/:id" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="cotacoes">
              <AnalisarCotacao />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />
      */}

      <Route 
        path="/saving" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="saving">
              <Saving />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />



      {/* Rota para /cotacao (compatibilidade com SSO) */}
      <Route 
        path="/cotacao" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="dashboard">
              <Dashboard />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      {/* Rotas com prefixo /cotacao para navegação */}
      <Route 
        path="/cotacao/usuarios" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="usuarios">
              <Usuarios />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/cotacao/cotacoes" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="cotacoes">
              <Cotacoes />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/cotacao/cotacoes/:id" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="cotacoes">
              <VisualizarCotacao />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/cotacao/cotacoes/:id/editar" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="cotacoes">
              <EditarCotacao />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/cotacao/saving" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="saving">
              <Saving />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/cotacao/supervisor" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="supervisor">
              <Supervisor />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/cotacao/aprovacoes" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="aprovacoes">
              <Aprovacoes />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/cotacao/aprovacoes/:id" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="aprovacoes">
              <VisualizarAprovacao />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/" 
        element={<Navigate to="/dashboard" />} 
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <PermissionsProvider>
          <AppRoutes />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </PermissionsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App; 