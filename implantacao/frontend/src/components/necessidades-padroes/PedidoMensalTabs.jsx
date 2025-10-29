import React from 'react';
import { FaPlus, FaCog } from 'react-icons/fa';

const PedidoMensalTabs = ({ 
  activeTab, 
  setActiveTab 
}) => {
  const tabs = [
    {
      id: 'criar',
      label: 'Criar Pedido Padrão',
      icon: <FaPlus className="mr-2" />
    },
    {
      id: 'gerenciar',
      label: 'Gerenciar Padrões',
      icon: <FaCog className="mr-2" />
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default PedidoMensalTabs;
