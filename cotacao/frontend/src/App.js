import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PermissionsProvider } from './contexts/PermissionsContext';
import { Layout, ProtectedRoute } from './components/layout';
import { LoadingSpinner } from './components/ui';
import './utils/axiosConfig'; // Importar configuração do axios
import './design-system'; // Importar design system
// import Login from './pages/auth'; // DESABILITADO - Autenticação centralizada no Foods
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
// const AuthenticatedRoute = ({ children }) => {
//   const { isAuthenticated, loading } = useAuth();

//   if (loading) {
//     return <LoadingSpinner />;
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   return <Layout>{children}</Layout>;
// };

// Componente para rotas públicas
// const PublicRoute = ({ children }) => {
//   const { isAuthenticated, loading } = useAuth();

//   if (loading) {
//     return <LoadingSpinner />;
//   }

//   if (isAuthenticated) {
//     return <Navigate to="/dashboard" replace />;
//   }

//   return children;
// };

// Componente para rotas protegidas com SSO
const AuthenticatedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Acesso Restrito</h1>
          <p className="text-gray-600 mb-6">
            Você precisa estar autenticado no sistema Foods para acessar a Cotação.
          </p>
          <a 
            href="https://foods.terceirizemais.com.br/foods/login" 
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Fazer Login no Foods
          </a>
        </div>
      </div>
    );
  }

  return <Layout>{children}</Layout>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Rota pública */}
      {/* DESABILITADO - Autenticação centralizada no Foods
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      */}

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



      <Route 
        path="/" 
        element={<Navigate to="/dashboard" />} 
      />
    </Routes>
  );
}

function App() {
  return (
    <Router basename="/cotacao">
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