import React from 'react';
import { FaEdit, FaBuilding, FaBoxes, FaCalendarAlt } from 'react-icons/fa';

const PeriodicidadeTabs = ({
  activeTab,
  setActiveTab,
  unidadesSelecionadas,
  produtosIndividuais
}) => {
  const tabs = [
    {
      id: 'info',
      label: 'Informações',
      icon: FaEdit,
      count: null
    },
    {
      id: 'unidades',
      label: 'Unidades Escolares',
      icon: FaBuilding,
      count: unidadesSelecionadas.length
    },
    {
      id: 'produtos',
      label: 'Grupos de Produtos',
      icon: FaBoxes,
      count: produtosIndividuais.length
    },
    {
      id: 'calendario',
      label: 'Calendário de Compras',
      icon: FaCalendarAlt,
      count: null
    }
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="inline mr-2" />
              {tab.label}
              {tab.count !== null && (
                <span className="ml-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default PeriodicidadeTabs;
