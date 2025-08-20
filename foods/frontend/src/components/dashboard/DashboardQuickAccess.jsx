import React from 'react';
import { 
  FaUsers, 
  FaTruck, 
  FaBox, 
  FaRoute,
  FaUser,
  FaBuilding,
  FaChartLine,
  FaExclamationTriangle,
  FaPlus,
  FaSearch
} from 'react-icons/fa';
import { ChartCard } from '../ui';

export const DashboardQuickAccess = ({ onNavigate }) => {
  const quickActions = [
    {
      title: "Gerenciar Usuários",
      icon: FaUsers,
      color: "blue",
      route: "/usuarios",
      description: "Adicionar, editar ou remover usuários",
      action: "Ver todos"
    },
    {
      title: "Gerenciar Produtos",
      icon: FaBox,
      color: "purple",
      route: "/produtos",
      description: "Cadastrar e gerenciar produtos",
      action: "Ver todos"
    },
    {
      title: "Gerenciar Fornecedores",
      icon: FaTruck,
      color: "green",
      route: "/fornecedores",
      description: "Cadastrar e gerenciar fornecedores",
      action: "Ver todos"
    },
    {
      title: "Gerenciar Rotas",
      icon: FaRoute,
      color: "teal",
      route: "/rotas",
      description: "Configurar rotas de entrega",
      action: "Ver todas"
    },
    {
      title: "Gerenciar Veículos",
      icon: FaTruck,
      color: "emerald",
      route: "/veiculos",
      description: "Cadastrar e gerenciar veículos",
      action: "Ver todos"
    },
    {
      title: "Gerenciar Clientes",
      icon: FaUser,
      color: "indigo",
      route: "/clientes",
      description: "Cadastrar e gerenciar clientes",
      action: "Ver todos"
    }
  ];

  const handleCardClick = (route) => {
    if (onNavigate) {
      onNavigate(route);
    }
  };

  return (
    <ChartCard title="Acesso Rápido">
      <div className="space-y-3">
        {/* Busca Rápida */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar rapidamente..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions.map((action, index) => (
            <div
              key={index}
              onClick={() => handleCardClick(action.route)}
              className="group relative bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all duration-200"
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg bg-${action.color}-100 group-hover:bg-${action.color}-200 transition-colors duration-200`}>
                  <action.icon className={`text-lg text-${action.color}-600`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 group-hover:text-gray-700 transition-colors duration-200">
                    {action.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {action.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-medium text-blue-600 group-hover:text-blue-700 transition-colors duration-200">
                      {action.action}
                    </span>
                    <FaPlus className="h-3 w-3 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ações Especiais */}
        <div className="border-t border-gray-200 pt-3 mt-4">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Ações Especiais</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => handleCardClick("/produtos")}
              className="flex items-center justify-center px-3 py-2 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors duration-200"
            >
              <FaExclamationTriangle className="mr-1 h-3 w-3" />
              Estoque Baixo
            </button>
            <button
              onClick={() => handleCardClick("/dashboard")}
              className="flex items-center justify-center px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              <FaChartLine className="mr-1 h-3 w-3" />
              Relatórios
            </button>
          </div>
        </div>
      </div>
    </ChartCard>
  );
};
