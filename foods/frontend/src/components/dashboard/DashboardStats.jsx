import React from 'react';
import { 
  FaUsers, 
  FaTruck, 
  FaBox, 
  FaLayerGroup, 
  FaBuilding,
  FaRoute,
  FaRuler,
  FaUser,
  FaTag,
  FaCubes,
  FaStore,
  FaCar,
  FaUserTie
} from 'react-icons/fa';
import { StatCard } from '../ui';

const DashboardStats = ({ statsData }) => {
  const statsCards = [
    {
      title: "Usuários",
      value: statsData.totalUsuarios,
      subtitle: "Total de usuários ativos",
      icon: FaUsers,
      color: "bg-blue-500"
    },
    {
      title: "Veículos",
      value: statsData.totalVeiculos,
      subtitle: "Total de veículos",
      icon: FaTruck,
      color: "bg-green-500"
    },
    {
      title: "Produtos",
      value: statsData.totalProdutos,
      subtitle: "Total de produtos",
      icon: FaBox,
      color: "bg-purple-500"
    },
    {
      title: "Grupos",
      value: statsData.totalGrupos,
      subtitle: "Total de grupos",
      icon: FaLayerGroup,
      color: "bg-orange-500"
    },
    {
      title: "Filiais",
      value: statsData.totalFiliais,
      subtitle: "Total de filiais",
      icon: FaBuilding,
      color: "bg-teal-500"
    },
    {
      title: "Rotas",
      value: statsData.totalRotas,
      subtitle: "Total de rotas",
      icon: FaRoute,
      color: "bg-pink-500"
    },
    {
      title: "Motoristas",
      value: statsData.totalMotoristas,
      subtitle: "Total de motoristas",
      icon: FaUser,
      color: "bg-indigo-500"
    },
    {
      title: "Unidades Escolares",
      value: statsData.totalUnidadesEscolares,
      subtitle: "Total de unidades",
      icon: FaRuler,
      color: "bg-red-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsCards.map((card, index) => (
        <StatCard
          key={index}
          title={card.title}
          value={card.value}
          subtitle={card.subtitle}
          icon={card.icon}
          color={card.color}
        />
      ))}
    </div>
  );
};

export default DashboardStats;
