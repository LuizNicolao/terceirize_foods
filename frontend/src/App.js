import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import Fornecedores from './pages/Fornecedores';
import Clientes from './pages/Clientes';
import Filiais from './pages/Filiais';
import Rotas from './pages/Rotas';
import UnidadesEscolares from './pages/UnidadesEscolares';
import Produtos from './pages/Produtos';
import Grupos from './pages/Grupos';
import Subgrupos from './pages/Subgrupos';
import Unidades from './pages/Unidades';
import Marcas from './pages/Marcas';
import Classes from './pages/Classes';
import NomeGenericoProduto from './pages/NomeGenericoProduto';
import Permissoes from './pages/Permissoes';

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
        path="/fornecedores" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="fornecedores">
              <Fornecedores />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/clientes" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="clientes">
              <Clientes />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/filiais" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="filiais">
              <Filiais />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/rotas" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="rotas">
              <Rotas />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/unidades-escolares" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="unidades_escolares">
              <UnidadesEscolares />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/produtos" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="produtos">
              <Produtos />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/grupos" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="grupos">
              <Grupos />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/subgrupos" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="subgrupos">
              <Subgrupos />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/unidades" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="unidades">
              <Unidades />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/marcas" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="marcas">
              <Marcas />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/classes" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="classes">
              <Classes />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/nome-generico-produto" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="nome_generico_produto">
              <NomeGenericoProduto />
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

      {/* Redirecionar rotas não encontradas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App; 
