import React from 'react';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useAuth } from '../../contexts/AuthContext';

const NecessidadesTabs = ({ 
  activeTab, 
  setActiveTab, 
  userType 
}) => {
  const { canView } = usePermissions();
  const { user } = useAuth();
  
  // Tipos de acesso que têm permissão geral (compatibilidade)
  const tiposComAcesso = ['nutricionista', 'coordenador', 'supervisor', 'administrador'];
  const hasGeneralPermission = canView('analise_necessidades') || tiposComAcesso.includes(user?.tipo_de_acesso);
  
  const tabs = [
    {
      id: 'nutricionista',
      label: '👩‍⚕️ Ajuste Nutricionista',
      visible: hasGeneralPermission || canView('analise_necessidades', 'nutricionista') || ['nutricionista', 'supervisor', 'administrador'].includes(userType)
    },
    {
      id: 'coordenacao',
      label: '👨‍💼 Ajuste Coordenação',
      visible: hasGeneralPermission || canView('analise_necessidades', 'coordenacao') || ['coordenador', 'supervisor', 'administrador'].includes(userType)
    },
    {
      id: 'logistica',
      label: '🚚 Ajuste Logística',
      visible: hasGeneralPermission || canView('analise_necessidades', 'logistica') || ['logistica', 'coordenador', 'supervisor', 'administrador'].includes(userType)
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

export default NecessidadesTabs;
