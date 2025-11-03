import React, { useState } from 'react';
import { 
  FaUsers, 
  FaSchool, 
  FaBox, 
  FaClipboardList, 
  FaTruck, 
  FaCalendarDay,
  FaChartLine,
  FaExclamationTriangle,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';
import { StatCard } from '../ui';

export const DashboardStats = ({ statsData, onCardClick }) => {
  const [expandedCategories, setExpandedCategories] = useState({
    operacional: true,
    gestao: false,
    alertas: false
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
      icon: FaBox,
      color: "blue",
      cards: [
        {
          title: "Escolas",
          value: statsData.totalEscolas || 0,
          subtitle: "Total de escolas cadastradas",
          icon: FaSchool,
          color: "blue",
          route: "/unidades-escolares",
          trend: null,
          trendUp: null
        },
        {
          title: "Produtos",
          value: statsData.totalProdutos || 0,
          subtitle: "Produtos disponíveis",
          icon: FaBox,
          color: "green",
          route: "/produtos-per-capita",
          trend: null,
          trendUp: null
        },
        {
          title: "Necessidades",
          value: statsData.totalNecessidades || 0,
          subtitle: "Necessidades deste mês",
          icon: FaClipboardList,
          color: "purple",
          route: "/necessidades",
          trend: null,
          trendUp: null
        },
        {
          title: "Recebimentos",
          value: statsData.totalRecebimentos || 0,
          subtitle: "Recebimentos deste mês",
          icon: FaTruck,
          color: "orange",
          route: "/recebimentos-escolas",
          trend: null,
          trendUp: null
        }
      ]
    },
    gestao: {
      title: "Gestão",
      icon: FaUsers,
      color: "indigo",
      cards: [
        {
          title: "Usuários",
          value: statsData.totalUsuarios || 0,
          subtitle: "Usuários ativos",
          icon: FaUsers,
          color: "yellow",
          route: "/usuarios",
          trend: null,
          trendUp: null
        },
        {
          title: "Registros Diários",
          value: statsData.totalRegistrosDiarios || 0,
          subtitle: "Registros deste mês",
          icon: FaCalendarDay,
          color: "indigo",
          route: "/registros-diarios",
          trend: null,
          trendUp: null
        }
      ]
    },
    alertas: {
      title: "Alertas e Pendências",
      icon: FaExclamationTriangle,
      color: "red",
      cards: [
        {
          title: "Pendentes",
          value: statsData.necessidadesPendentes || 0,
          subtitle: "Necessidades pendentes",
          icon: FaClipboardList,
          color: "red",
          route: "/necessidades?status=pendente",
          trend: null,
          trendUp: null,
          isAlert: true
        },
        {
          title: "Atrasados",
          value: statsData.alertasUrgentes || 0,
          subtitle: "Recebimentos atrasados",
          icon: FaExclamationTriangle,
          color: "orange",
          route: "/recebimentos-escolas?status=Atrasado",
          trend: null,
          trendUp: null,
          isAlert: true
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
