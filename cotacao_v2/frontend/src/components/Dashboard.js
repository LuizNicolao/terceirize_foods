import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';
import './Dashboard.css';

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Layout>
      <div className="welcome-card">
        <h2>Dashboard</h2>
        <p>Login realizado com sucesso! Esta é a área principal do sistema.</p>
        <p>Autenticado: {isAuthenticated ? 'Sim' : 'Não'}</p>
        <p>Usuário: {user?.name || 'N/A'}</p>
        <p>Manter conectado: {localStorage.getItem('rememberMe') ? 'Sim' : 'Não'}</p>
      </div>
    </Layout>
  );
};

export default Dashboard; 