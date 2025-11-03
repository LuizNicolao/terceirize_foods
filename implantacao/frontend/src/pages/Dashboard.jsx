import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { DashboardStats } from '../components/dashboard/DashboardStats';
import dashboardService from '../services/dashboardService';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    totalEscolas: 0,
    totalProdutos: 0,
    totalNecessidades: 0,
    totalRecebimentos: 0,
    totalUsuarios: 0,
    totalRegistrosDiarios: 0,
    necessidadesPendentes: 0,
    alertasUrgentes: 0
  });
  const [atividadesRecentes, setAtividadesRecentes] = useState([]);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const response = await dashboardService.obterEstatisticas();
        
        if (response.success && response.data) {
          const { estatisticas } = response.data;
          
          setStatsData({
            totalEscolas: estatisticas.totalEscolas || 0,
            totalProdutos: estatisticas.totalProdutos || 0,
            totalNecessidades: estatisticas.necessidadesMes?.total || 0,
            totalRecebimentos: estatisticas.recebimentosMes?.total || 0,
            totalUsuarios: estatisticas.totalUsuarios || 0,
            totalRegistrosDiarios: estatisticas.registrosMes?.total || 0,
            necessidadesPendentes: estatisticas.alertas?.necessidadesPendentes || 0,
            alertasUrgentes: estatisticas.alertas?.recebimentosAtrasados || 0
          });
          
          setAtividadesRecentes(response.data.atividadesRecentes || []);
        } else {
          toast.error('Erro ao carregar estatísticas');
        }
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        toast.error('Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
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
              {atividadesRecentes.length > 0 ? (
                atividadesRecentes.slice(0, 10).map((atividade, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <span className="font-medium">{atividade.entidade}</span> - {atividade.tipo}
                      {atividade.detalhe && <span className="text-gray-500"> • {atividade.detalhe}</span>}
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(atividade.data).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Nenhuma atividade recente
                </div>
              )}
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
