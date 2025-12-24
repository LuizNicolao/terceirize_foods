import React, { useState, useEffect } from 'react';
import DashboardService from '../services/dashboard';
import DashboardStats from '../components/dashboard/DashboardStats';
import DashboardCharts from '../components/dashboard/DashboardCharts';
import { LoadingSpinner } from '../components/ui';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [estatisticas, setEstatisticas] = useState(null);
  const [dadosTemporais, setDadosTemporais] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarEstatisticas();
    loadDadosTemporais();
  }, []);

  const carregarEstatisticas = async () => {
    setLoading(true);
    try {
      const result = await DashboardService.obterEstatisticas();
      if (result.success) {
        setEstatisticas(result.data);
      } else {
        toast.error(result.error || 'Erro ao carregar estatísticas');
      }
    } catch (error) {
      toast.error('Erro ao carregar estatísticas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadDadosTemporais = async () => {
    try {
      const result = await DashboardService.obterDadosTemporais();
      if (result.success) {
        setDadosTemporais(result.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados temporais:', error);
    }
  };

  if (loading) {
  return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          Visão geral da plataforma de chamados
        </p>
      </div>

      <DashboardStats estatisticas={estatisticas} />
      <DashboardCharts estatisticas={estatisticas} dadosTemporais={dadosTemporais} />
    </div>
  );
};

export default Dashboard;
