import React from 'react';
import { FaTools, FaClock, FaCheckCircle, FaTimesCircle, FaWrench, FaChartLine } from 'react-icons/fa';
import { StatCard } from '../ui';

const SolicitacoesStats = ({ stats, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Mapear dados do backend para o formato esperado
  const gerais = stats.gerais || {};
  const porStatus = stats.porStatus || [];
  
  // Criar objeto de status para facilitar o acesso
  const statusMap = {};
  porStatus.forEach(item => {
    statusMap[item.status.toLowerCase()] = item.quantidade;
  });

  const statCards = [
    {
      title: 'Total de Solicitações',
      value: gerais.total_solicitacoes || 0,
      icon: FaTools,
      color: 'blue',
      change: null
    },
    {
      title: 'Pendentes',
      value: gerais.solicitacoes_pendentes || 0,
      icon: FaClock,
      color: 'yellow',
      change: null
    },
    {
      title: 'Aprovadas',
      value: gerais.solicitacoes_aprovadas || 0,
      icon: FaCheckCircle,
      color: 'green',
      change: null
    },
    {
      title: 'Reprovadas',
      value: gerais.solicitacoes_reprovadas || 0,
      icon: FaTimesCircle,
      color: 'red',
      change: null
    },
    {
      title: 'Em Manutenção',
      value: gerais.solicitacoes_pendente_manutencao || 0,
      icon: FaWrench,
      color: 'orange',
      change: null
    },
    {
      title: 'Concluídas',
      value: gerais.solicitacoes_concluidas || 0,
      icon: FaChartLine,
      color: 'green',
      change: null
    }
  ];

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            change={stat.change}
          />
        ))}
      </div>
    </div>
  );
};

export default SolicitacoesStats;
