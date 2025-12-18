/**
 * Componente de Abas para a tela de Necessidades
 * Permite navegar entre Listagem e Correção
 */

import React from 'react';

const NecessidadesTabsCorrecao = ({ 
  activeTab, 
  setActiveTab,
  isAdministrador = false
}) => {
  const tabs = [
    {
      id: 'listagem',
      label: '📋 Listagem de Necessidades',
      visible: true
    },
    {
      id: 'correcao',
      label: '✏️ Correção de Necessidades',
      visible: isAdministrador // Apenas administradores podem ver a aba de correção
    }
  ];

  const tabsVisiveis = tabs.filter(tab => tab.visible);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabsVisiveis.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
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

export default NecessidadesTabsCorrecao;
