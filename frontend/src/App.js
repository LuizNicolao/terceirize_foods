import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import Fornecedores from './pages/Fornecedores';
import Produtos from './pages/Produtos';
import Grupos from './pages/Grupos';
import Subgrupos from './pages/Subgrupos';
import Unidades from './pages/Unidades';
import Permissoes from './pages/Permissoes';

// Componente para rotas protegidas
const ProtectedRoute = ({ children }) => {
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
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
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
        path="/" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/usuarios" 
        element={
          <ProtectedRoute>
            <Usuarios />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/fornecedores" 
        element={
          <ProtectedRoute>
            <Fornecedores />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/produtos" 
        element={
          <ProtectedRoute>
            <Produtos />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/grupos" 
        element={
          <ProtectedRoute>
            <Grupos />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/subgrupos" 
        element={
          <ProtectedRoute>
            <Subgrupos />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/unidades" 
        element={
          <ProtectedRoute>
            <Unidades />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/permissoes" 
        element={
          <ProtectedRoute>
            <Permissoes />
          </ProtectedRoute>
        } 
      />

      {/* Redirecionar rotas não encontradas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App; 
