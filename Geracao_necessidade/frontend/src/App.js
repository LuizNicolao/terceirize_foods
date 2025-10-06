import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PermissionsProvider } from './contexts/PermissionsContext';
import { Toaster } from 'react-hot-toast';

// Páginas
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard';
import Necessidades from './pages/necessidades';
import Usuarios from './pages/usuarios';
import MediasEscolas from './pages/medias-escolas';
import ProdutosPerCapita from './pages/produtos-per-capita';
import RecebimentosEscolas from './pages/recebimentos-escolas';
import SolicitacoesManutencao from './pages/solicitacoes-manutencao';

// Componentes
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';

function App() {
  return (
    <AuthProvider>
      <PermissionsProvider>
        <Router>
          <div className="App">
          <Routes>
            {/* Rota pública - Login */}
            <Route path="/login" element={<Login />} />
            
            {/* Rotas protegidas */}
            <Route path="/" element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/necessidades" element={
              <ProtectedRoute>
                <Layout>
                  <Necessidades />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/usuarios" element={
              <ProtectedRoute>
                <Layout>
                  <Usuarios />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/medias-escolas" element={
              <ProtectedRoute>
                <Layout>
                  <MediasEscolas />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/produtos-per-capita" element={
              <ProtectedRoute>
                <Layout>
                  <ProdutosPerCapita />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/recebimentos-escolas" element={
              <ProtectedRoute>
                <Layout>
                  <RecebimentosEscolas />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/solicitacoes-manutencao" element={
              <ProtectedRoute>
                <Layout>
                  <SolicitacoesManutencao />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Rota 404 */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          
          {/* Toast notifications */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          </div>
        </Router>
      </PermissionsProvider>
    </AuthProvider>
  );
}

export default App;
