import React from 'react';

const NecessidadesTabs = ({ 
  activeTab, 
  setActiveTab, 
  userType,
  contagemRegistros = {} // { nutricionista: 0, coordenacao: 0, logistica: 0 }
}) => {
  const tabs = [
    {
      id: 'nutricionista',
      label: '👩‍⚕️ Ajuste Nutricionista',
      visible: ['nutricionista', 'supervisor', 'administrador'].includes(userType),
      contagem: contagemRegistros.nutricionista || 0
    },
    {
      id: 'coordenacao',
      label: '👨‍💼 Ajuste Coordenação',
      visible: ['coordenador', 'supervisor', 'administrador'].includes(userType),
      contagem: contagemRegistros.coordenacao || 0
    },
    {
      id: 'logistica',
      label: '🚚 Ajuste Logística',
      visible: ['logistica', 'coordenador', 'supervisor', 'administrador'].includes(userType),
      contagem: contagemRegistros.logistica || 0
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
              {tab.contagem > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  activeTab === tab.id
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.contagem}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default NecessidadesTabs;
