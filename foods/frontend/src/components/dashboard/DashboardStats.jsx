import React, { useState } from 'react';
import { 
  FaUsers, 
  FaTruck, 
  FaBox, 
  FaLayerGroup, 
  FaUser,
  FaBuilding,
  FaRoute,
  FaRuler,
  FaChevronDown,
  FaChevronUp,
  FaChartLine,
  FaExclamationTriangle
} from 'react-icons/fa';
import { StatCard } from '../ui';

export const DashboardStats = ({ statsData, onCardClick }) => {
  const [expandedCategories, setExpandedCategories] = useState({
    operacional: true,
    recursos: false,
    financeiro: false,
    administrativo: false
  });

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const categories = {
    operacional: {
      title: "Operacional",
      icon: FaTruck,
      color: "blue",
      cards: [
        {
          title: "Produtos",
          value: statsData.totalProdutos,
          subtitle: "Produtos cadastrados",
          icon: FaBox,
          color: "orange",
          route: "/produtos",
          trend: "+5%",
          trendUp: true
        },
        {
          title: "Fornecedores",
          value: statsData.totalFornecedores,
          subtitle: "Fornecedores ativos",
          icon: FaTruck,
          color: "green",
          route: "/fornecedores",
          trend: "+2%",
          trendUp: true
        },
        {
          title: "Clientes",
          value: statsData.totalClientes,
          subtitle: "Clientes ativos",
          icon: FaUser,
          color: "purple",
          route: "/clientes",
          trend: "+8%",
          trendUp: true
        },
        {
          title: "Rotas",
          value: statsData.totalRotas,
          subtitle: "Rotas configuradas",
          icon: FaRoute,
          color: "teal",
          route: "/rotas",
          trend: "0%",
          trendUp: null
        }
      ]
    },
    recursos: {
      title: "Recursos Humanos",
      icon: FaUsers,
      color: "indigo",
      cards: [
        {
          title: "Usuários",
          value: statsData.totalUsuarios,
          subtitle: "Usuários ativos",
          icon: FaUsers,
          color: "blue",
          route: "/usuarios",
          trend: "+3%",
          trendUp: true
        },
        {
          title: "Motoristas",
          value: statsData.totalMotoristas,
          subtitle: "Motoristas ativos",
          icon: FaUser,
          color: "gray",
          route: "/motoristas",
          trend: "-1%",
          trendUp: false
        },
        {
          title: "Ajudantes",
          value: statsData.totalAjudantes,
          subtitle: "Ajudantes ativos",
          icon: FaUser,
          color: "lime",
          route: "/ajudantes",
          trend: "+4%",
          trendUp: true
        }
      ]
    },
    financeiro: {
      title: "Financeiro & Estoque",
      icon: FaChartLine,
      color: "green",
      cards: [
        {
          title: "Valor em Estoque",
          value: `R$ ${statsData.valorEstoque?.toLocaleString('pt-BR') || '0'}`,
          subtitle: "Valor total do estoque",
          icon: FaBox,
          color: "emerald",
          route: "/produtos",
          trend: "+12%",
          trendUp: true,
          isCurrency: true
        },
        {
          title: "Estoque Baixo",
          value: statsData.produtosEstoqueBaixo,
          subtitle: "Produtos com estoque baixo",
          icon: FaExclamationTriangle,
          color: "yellow",
          route: "/produtos",
          trend: "-5%",
          trendUp: false,
          isAlert: true
        },
        {
          title: "Sem Estoque",
          value: statsData.produtosSemEstoque,
          subtitle: "Produtos sem estoque",
          icon: FaExclamationTriangle,
          color: "red",
          route: "/produtos",
          trend: "+2%",
          trendUp: false,
          isAlert: true
        }
      ]
    },
    administrativo: {
      title: "Administrativo",
      icon: FaBuilding,
      color: "purple",
      cards: [
        {
          title: "Filiais",
          value: statsData.totalFiliais,
          subtitle: "Filiais ativas",
          icon: FaBuilding,
          color: "cyan",
          route: "/filiais",
          trend: "0%",
          trendUp: null
        },
        {
          title: "Unidades Escolares",
          value: statsData.totalUnidadesEscolares,
          subtitle: "Unidades atendidas",
          icon: FaRuler,
          color: "violet",
          route: "/unidades-escolares",
          trend: "+1%",
          trendUp: true
        },
        {
          title: "Veículos",
          value: statsData.totalVeiculos,
          subtitle: "Veículos disponíveis",
          icon: FaTruck,
          color: "emerald",
          route: "/veiculos",
          trend: "+2%",
          trendUp: true
        }
      ]
    }
  };

  return (
    <div className="space-y-6">
      {/* KPIs Principais - Sempre visíveis */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Principais Indicadores</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(categories).slice(0, 4).map(([key, category]) => (
            <div
              key={key}
              onClick={() => onCardClick && onCardClick(category.cards[0]?.route)}
              className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{category.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{category.cards[0]?.value || 0}</p>
                </div>
                <category.icon className={`text-2xl text-${category.color}-500`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categorias Detalhadas */}
      {Object.entries(categories).map(([key, category]) => (
        <div key={key} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header da Categoria */}
          <div 
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
            onClick={() => toggleCategory(key)}
          >
            <div className="flex items-center space-x-3">
              <category.icon className={`text-xl text-${category.color}-500`} />
              <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
              <span className="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full">
                {category.cards.length} itens
              </span>
            </div>
            {expandedCategories[key] ? (
              <FaChevronUp className="text-gray-400" />
            ) : (
              <FaChevronDown className="text-gray-400" />
            )}
          </div>

          {/* Cards da Categoria */}
          {expandedCategories[key] && (
            <div className="border-t border-gray-200 p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {category.cards.map((card, index) => (
                  <div
                    key={index}
                    onClick={() => onCardClick && onCardClick(card.route)}
                    className={`relative p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                      card.isAlert 
                        ? 'border-red-200 bg-red-50 hover:bg-red-100' 
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    {/* Indicador de Tendência */}
                    {card.trend && (
                      <div className={`absolute top-2 right-2 text-xs font-medium px-2 py-1 rounded-full ${
                        card.trendUp === null 
                          ? 'bg-gray-100 text-gray-600'
                          : card.trendUp 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                      }`}>
                        {card.trend}
                      </div>
                    )}

                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-${card.color}-100`}>
                        <card.icon className={`text-lg text-${card.color}-600`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {card.title}
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {card.value}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {card.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
