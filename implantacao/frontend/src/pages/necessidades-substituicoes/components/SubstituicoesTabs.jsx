import React, { useState } from 'react';
import { FaUserMd, FaUserTie } from 'react-icons/fa';
import SubstituicoesTableNutricionista from './SubstituicoesTableNutricionista';
import SubstituicoesTableCoordenacao from './SubstituicoesTableCoordenacao';

const SubstituicoesTabs = ({
  necessidades,
  produtosGenericos,
  loadingGenericos,
  onSaveConsolidated,
  onSaveIndividual,
  onLiberarParaCoordenacao,
  onAprovar,
  onRejeitar,
  canEdit,
  canApprove
}) => {
  const [activeTab, setActiveTab] = useState('nutricionista');

  const tabs = [
    {
      id: 'nutricionista',
      label: 'Ajuste Nutricionista',
      icon: FaUserMd,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'coordenacao',
      label: 'Ajuste Coordenação',
      icon: FaUserTie,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    }
  ];

  // Filtrar necessidades por status baseado na aba ativa
  const getFilteredNecessidades = () => {
    if (activeTab === 'nutricionista') {
      // Mostrar necessidades com status pendente ou sem substituições
      return necessidades.filter(nec => 
        !nec.substituicoes_existentes || 
        nec.escolas.some(escola => 
          !escola.substituicao || 
          escola.substituicao.status === 'pendente'
        )
      );
    } else {
      // Mostrar necessidades com status conf
      return necessidades.filter(nec => 
        nec.escolas.some(escola => 
          escola.substituicao && 
          escola.substituicao.status === 'conf'
        )
      );
    }
  };

  const filteredNecessidades = getFilteredNecessidades();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Tabs Header */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${isActive 
                    ? `${tab.color} ${tab.borderColor} border-b-2` 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className={`
                  w-5 h-5 mr-2 transition-colors
                  ${isActive ? tab.color : 'text-gray-400 group-hover:text-gray-500'}
                `} />
                {tab.label}
                {filteredNecessidades.length > 0 && (
                  <span className={`
                    ml-2 py-0.5 px-2 rounded-full text-xs font-medium
                    ${isActive ? 'bg-white text-gray-900' : 'bg-gray-100 text-gray-600'}
                  `}>
                    {filteredNecessidades.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'nutricionista' && (
          <SubstituicoesTableNutricionista
            necessidades={filteredNecessidades}
            produtosGenericos={produtosGenericos}
            loadingGenericos={loadingGenericos}
            onSaveConsolidated={onSaveConsolidated}
            onSaveIndividual={onSaveIndividual}
            onLiberarParaCoordenacao={onLiberarParaCoordenacao}
            canEdit={canEdit}
          />
        )}

        {activeTab === 'coordenacao' && (
          <SubstituicoesTableCoordenacao
            necessidades={filteredNecessidades}
            produtosGenericos={produtosGenericos}
            loadingGenericos={loadingGenericos}
            onSaveConsolidated={onSaveConsolidated}
            onSaveIndividual={onSaveIndividual}
            onAprovar={onAprovar}
            onRejeitar={onRejeitar}
            canEdit={canEdit}
            canApprove={canApprove}
          />
        )}
      </div>
    </div>
  );
};

export default SubstituicoesTabs;
