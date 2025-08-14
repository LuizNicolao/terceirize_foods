import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/shared';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import './index.css';

// Componente principal da aplicação
const AppContent = () => {
  return (
    <Router>
      <Routes>
        {/* Rota de login */}
        <Route path="/cotacao/login" element={<Login />} />
        
        {/* Rotas protegidas */}
        <Route 
          path="/cotacao/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Redirecionar raiz para dashboard */}
        <Route 
          path="/cotacao" 
          element={<Navigate to="/cotacao/dashboard" replace />} 
        />
        
        {/* Redirecionar qualquer outra rota para dashboard */}
        <Route 
          path="*" 
          element={<Navigate to="/cotacao/dashboard" replace />} 
        />
      </Routes>
    </Router>
  );
};

// Componente principal
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
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
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
  );
};

export default App;
