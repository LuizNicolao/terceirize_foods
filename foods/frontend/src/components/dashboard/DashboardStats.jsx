import React from 'react';
import { useNavigate } from 'react-router-dom';
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

const DashboardStats = ({ statsData = {} }) => {
  const navigate = useNavigate();
  
  // Garantir que statsData seja sempre um objeto
  const safeStatsData = statsData && typeof statsData === 'object' ? statsData : {};

  const statsCards = [
    {
      title: "Usuários",
      value: safeStatsData.totalUsuarios || 0,
      subtitle: "Total de usuários ativos",
      icon: FaUsers,
      color: "blue",
      path: "/foods/usuarios"
    },
    {
      title: "Veículos",
      value: safeStatsData.totalVeiculos || 0,
      subtitle: "Total de veículos",
      icon: FaTruck,
      color: "green",
      path: "/foods/veiculos"
    },
    {
      title: "Produtos",
      value: safeStatsData.totalProdutos || 0,
      subtitle: "Total de produtos",
      icon: FaBox,
      color: "purple",
      path: "/foods/produtos"
    },
    {
      title: "Grupos",
      value: safeStatsData.totalGrupos || 0,
      subtitle: "Total de grupos",
      icon: FaLayerGroup,
      color: "orange",
      path: "/foods/grupos"
    },
    {
      title: "Filiais",
      value: safeStatsData.totalFiliais || 0,
      subtitle: "Total de filiais",
      icon: FaBuilding,
      color: "blue",
      path: "/foods/filiais"
    },
    {
      title: "Rotas",
      value: safeStatsData.totalRotas || 0,
      subtitle: "Total de rotas",
      icon: FaRoute,
      color: "purple",
      path: "/foods/rotas"
    },
    {
      title: "Motoristas",
      value: safeStatsData.totalMotoristas || 0,
      subtitle: "Total de motoristas",
      icon: FaUser,
      color: "green",
      path: "/foods/motoristas"
    },
    {
      title: "Unidades Escolares",
      value: safeStatsData.totalUnidadesEscolares || 0,
      subtitle: "Total de unidades",
      icon: FaRuler,
      color: "red",
      path: "/foods/unidades-escolares"
    },
    {
      title: "Fornecedores",
      value: safeStatsData.totalFornecedores || 0,
      subtitle: "Total de fornecedores",
      icon: FaTruck,
      color: "blue",
      path: "/foods/fornecedores"
    },
    {
      title: "Clientes",
      value: safeStatsData.totalClientes || 0,
      subtitle: "Total de clientes",
      icon: FaUsers,
      color: "green",
      path: "/foods/clientes"
    },
    {
      title: "Ajudantes",
      value: safeStatsData.totalAjudantes || 0,
      subtitle: "Total de ajudantes",
      icon: FaUser,
      color: "orange",
      path: "/foods/ajudantes"
    },
    {
      title: "Subgrupos",
      value: safeStatsData.totalSubgrupos || 0,
      subtitle: "Total de subgrupos",
      icon: FaLayerGroup,
      color: "purple",
      path: "/foods/subgrupos"
    }
  ];

  const handleCardClick = (path) => {
    if (path) {
      navigate(path);
    }
  };

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
          onClick={() => handleCardClick(card.path)}
        />
      ))}
    </div>
  );
};

export default DashboardStats;
