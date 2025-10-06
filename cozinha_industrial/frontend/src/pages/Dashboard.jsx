import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { DashboardStats } from '../components/dashboard/DashboardStats';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    totalEscolas: 0,
    totalProdutos: 0,
    totalNecessidades: 0,
    totalRecebimentos: 0,
    totalUsuarios: 1,
    totalRegistrosDiarios: 0,
    necessidadesPendentes: 0,
    alertasUrgentes: 0
  });

  useEffect(() => {
    // Simular carregamento de dados
    const loadStats = async () => {
      setLoading(true);
      // Aqui você faria a chamada para a API
      setTimeout(() => {
        setStatsData(prev => ({
          ...prev,
          totalUsuarios: 1 // Pelo menos 1 usuário (o admin)
        }));
        setLoading(false);
      }, 1000);
    };

    loadStats();
  }, []);

  const handleCardClick = (route) => {
    if (route) {
      navigate(route);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header com informações do usuário */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Bem-vindo, {user?.nome || 'Usuário'}!
        </h1>
        <p className="text-gray-600 mt-1">
          Aqui está um resumo do sistema de implantação
        </p>
      </div>

      {/* Estatísticas */}
      <DashboardStats 
        statsData={statsData} 
        onCardClick={handleCardClick}
      />

      {/* Conteúdo Principal - Layout Responsivo */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 mt-6 md:mt-8">
        {/* Área Principal */}
        <div className="lg:col-span-3 space-y-4 md:space-y-6">
          {/* Atividades Recentes */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Atividades Recentes
            </h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Sistema iniciado com sucesso
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                Usuário logado: {user?.nome || 'Administrador'}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Informações do Sistema */}
        <div className="space-y-4 md:space-y-6">
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informações do Sistema
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Versão:</strong> 1.0.0</p>
              <p><strong>Ambiente:</strong> Desenvolvimento</p>
              <p><strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
              <p><strong>Status:</strong> <span className="text-green-600">Online</span></p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Status do Sistema
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Sistema Online</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-700">Banco de Dados Conectado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
