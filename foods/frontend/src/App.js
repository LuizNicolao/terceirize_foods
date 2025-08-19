import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Layout, LoadingSpinner, ProtectedRoute } from './components/layout';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/usuarios/Usuarios';
import Fornecedores from './pages/fornecedores/Fornecedores';
import Clientes from './pages/clientes/Clientes';
import Filiais from './pages/filiais/Filiais';
import Rotas from './pages/rotas/Rotas';
import UnidadesEscolares from './pages/unidades-escolares/UnidadesEscolares';
import Produtos from './pages/produtos/Produtos';
import Grupos from './pages/grupos/Grupos';
import Subgrupos from './pages/subgrupos/Subgrupos';
import Unidades from './pages/unidades/Unidades';
import Marcas from './pages/marcas/Marcas';
import Classes from './pages/classes/Classes';
import Permissoes from './pages/permissoes/Permissoes';
import Veiculos from './pages/veiculos/Veiculos';
import Motoristas from './pages/motoristas/Motoristas';
import Ajudantes from './pages/ajudantes/Ajudantes';
import ProdutoOrigem from './pages/produto-origem/ProdutoOrigem';
import ProdutoGenerico from './pages/produto-generico/ProdutoGenerico';

// Componente para rotas protegidas com autenticação
const AuthenticatedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/foods/login" replace />;
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
    return <Navigate to="/foods" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Routes>
      {/* Rota pública */}
      <Route 
        path="/foods/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />

      {/* Rotas protegidas */}
      <Route 
        path="/foods" 
        element={
          <AuthenticatedRoute>
            <Dashboard />
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/usuarios" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="usuarios">
              <Usuarios />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/fornecedores" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="fornecedores">
              <Fornecedores />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/clientes" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="clientes">
              <Clientes />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/filiais" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="filiais">
              <Filiais />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/rotas" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="rotas">
              <Rotas />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/unidades-escolares" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="unidades_escolares">
              <UnidadesEscolares />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/produtos" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="produtos">
              <Produtos />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/grupos" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="grupos">
              <Grupos />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/subgrupos" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="subgrupos">
              <Subgrupos />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/unidades" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="unidades">
              <Unidades />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/marcas" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="marcas">
              <Marcas />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/classes" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="classes">
              <Classes />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />


      <Route 
        path="/foods/veiculos" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="veiculos">
              <Veiculos />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/motoristas" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="motoristas">
              <Motoristas />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/ajudantes" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="ajudantes">
              <Ajudantes />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/produto-origem" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="produto_origem">
              <ProdutoOrigem />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/produto-generico" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="produto_generico">
              <ProdutoGenerico />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      <Route 
        path="/foods/permissoes" 
        element={
          <AuthenticatedRoute>
            <ProtectedRoute screen="permissoes">
              <Permissoes />
            </ProtectedRoute>
          </AuthenticatedRoute>
        } 
      />

      {/* Redirecionar rotas não encontradas */}
      <Route path="*" element={<Navigate to="/foods" replace />} />
    </Routes>
  );
};

export default App; 
