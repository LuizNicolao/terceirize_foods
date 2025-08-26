import React from 'react';
import { 
  FaTruck, 
  FaCheckCircle, 
  FaClock, 
  FaTimesCircle, 
  FaDollarSign,
  FaUsers,
  FaSyncAlt,
  FaExclamationCircle,
  FaCalendar,
  FaGasPump,
  FaChartLine,
  FaPiggyBank,
  FaPercentage
} from 'react-icons/fa';

const DashboardStats = ({ stats, formatCurrency }) => {
  const statsConfig = [
    // Cards de Status das Cotações
    {
      icon: <FaClock className="text-xl" />,
      color: "bg-yellow-500",
      value: stats?.pendentes || 0,
      label: "Cotações Aguardando Aprovação",
      subtitle: "Pendentes de análise"
    },
    {
      icon: <FaCheckCircle className="text-xl" />,
      color: "bg-green-500",
      value: stats?.aprovadas || 0,
      label: "Cotações Aprovadas",
      subtitle: "Aprovadas com sucesso"
    },
    {
      icon: <FaTimesCircle className="text-xl" />,
      color: "bg-red-500",
      value: stats?.rejeitadas || 0,
      label: "Cotações Rejeitadas",
      subtitle: "Rejeitadas pelo gestor"
    },
    {
      icon: <FaSyncAlt className="text-xl" />,
      color: "bg-cyan-500",
      value: stats?.renegociacao || 0,
      label: "Cotações em Renegociação",
      subtitle: "Em processo de renegociação"
    },
    {
      icon: <FaCalendar className="text-xl" />,
      color: "bg-blue-500",
      value: stats?.programadas || 0,
      label: "Cotações Programadas",
      subtitle: "Compra programada"
    },
    {
      icon: <FaExclamationCircle className="text-xl" />,
      color: "bg-red-600",
      value: stats?.emergenciais || 0,
      label: "Cotações Emergenciais",
      subtitle: "Compra emergencial"
    },
    // Cards de Economia (Saving)
    {
      icon: <FaPiggyBank className="text-xl" />,
      color: "bg-green-500",
      value: formatCurrency(stats?.economia_total || 0),
      label: "Economia Total",
      subtitle: "Economia gerada pelo sistema"
    },
    {
      icon: <FaPercentage className="text-xl" />,
      color: "bg-purple-500",
      value: `${(stats?.economia_percentual || 0).toFixed(2)}%`,
      label: "Economia Percentual",
      subtitle: "Percentual de economia"
    },
    {
      icon: <FaChartLine className="text-xl" />,
      color: "bg-blue-500",
      value: formatCurrency(stats?.total_negociado || 0),
      label: "Total Negociado",
      subtitle: "Valor total negociado"
    },
    {
      icon: <FaCheckCircle className="text-xl" />,
      color: "bg-green-500",
      value: formatCurrency(stats?.total_aprovado || 0),
      label: "Total Aprovado",
      subtitle: "Valor total aprovado"
    },
    // Cards de Taxas (placeholder - serão implementados depois)
    {
      icon: <FaDollarSign className="text-xl" />,
      color: "bg-yellow-500",
      value: "R$ 0,00",
      label: "Cotação do Dólar",
      subtitle: "Taxa atual do dólar"
    },
    {
      icon: <FaGasPump className="text-xl" />,
      color: "bg-red-600",
      value: "R$ 0,00",
      label: "Preço do Diesel",
      subtitle: "Preço atual do diesel"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
      {statsConfig.map((stat, index) => (
        <div 
          key={index}
          className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${stat.color}`}>
              {stat.icon}
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-2">
            {stat.value}
          </div>
          <div className="text-sm font-medium text-gray-600 mb-1">
            {stat.label}
          </div>
          <div className="text-xs text-gray-500">
            {stat.subtitle}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
