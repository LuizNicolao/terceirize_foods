import React from 'react';

const RecebimentosTabs = ({ 
  activeTab, 
  setActiveTab, 
  userType 
}) => {
  const tabs = [
    {
      id: 'lista',
      label: '📝 Lista de Recebimentos',
      visible: true
    },
    {
      id: 'relatorios',
      label: '📊 Relatórios',
      visible: true // Temporário: mostrar para todos
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.filter(tab => tab.visible).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default RecebimentosTabs;
