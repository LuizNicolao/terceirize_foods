import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SidebarProvider } from './contexts/SidebarContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './utils/axiosConfig'; // Importar configuração do axios
import { Login } from './pages/auth';
import Dashboard from './pages/dashboard/Dashboard';
import { Usuarios } from './pages/usuarios';
import { Cotacoes } from './pages/cotacoes';
import EditarUsuario from './components/EditarUsuario';
import VisualizarUsuario from './components/VisualizarUsuario';
import { Supervisor } from './pages/supervisor';
import Aprovacoes from './components/Aprovacoes';
import AnalisarCotacao from './components/AnalisarCotacao';
import AnalisarCotacaoSupervisor from './components/AnalisarCotacaoSupervisor';
import Saving from './components/Saving';
import VisualizarSaving from './components/VisualizarSaving';


// Componente para rotas protegidas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Carregando...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Componente para rotas públicas (login)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Carregando...</div>;
  }
  
  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
};

function AppRoutes() {
  return (
    <div className="App">
      <Routes>
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/dashboard" 
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
          path="/cotacoes" 
          element={
            <ProtectedRoute>
              <Cotacoes />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/editar-usuario/:id" 
          element={
            <ProtectedRoute>
              <EditarUsuario />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/visualizar-usuario/:id" 
          element={
            <ProtectedRoute>
              <VisualizarUsuario />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/supervisor" 
          element={
            <ProtectedRoute>
              <Supervisor />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/aprovacoes" 
          element={
            <ProtectedRoute>
              <Aprovacoes />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analisar-cotacao/:id" 
          element={
            <ProtectedRoute>
              <AnalisarCotacao />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analisar-cotacao-supervisor/:id" 
          element={
            <ProtectedRoute>
              <AnalisarCotacaoSupervisor />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/saving" 
          element={
            <ProtectedRoute>
              <Saving />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/visualizar-saving/:id" 
          element={
            <ProtectedRoute>
              <VisualizarSaving />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/" 
          element={<Navigate to="/login" />} 
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SidebarProvider>
          <AppRoutes />
        </SidebarProvider>
      </AuthProvider>
    </Router>
  );
}

export default App; 