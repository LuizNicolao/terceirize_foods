import React from 'react';
import { FaUser, FaSync, FaTimes } from 'react-icons/fa';
import { Button } from '../../../../components/ui';

const DecisaoButtons = ({ decisao, onDecisaoChange }) => {
  const decisoes = [
    {
      value: 'enviar_gestor',
      label: 'Enviar para Gestor',
      icon: FaUser,
      color: 'green'
    },
    {
      value: 'renegociacao',
      label: 'Solicitar Renegociação',
      icon: FaSync,
      color: 'orange'
    },
    {
      value: 'rejeitar',
      label: 'Rejeitar',
      icon: FaTimes,
      color: 'red'
    }
  ];

  const getButtonClasses = (decisaoValue, color) => {
    const isActive = decisao === decisaoValue;
    const colorClasses = {
      green: isActive 
        ? 'bg-green-600 text-white border-green-600 hover:bg-green-700' 
        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
      orange: isActive 
        ? 'bg-orange-600 text-white border-orange-600 hover:bg-orange-700' 
        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
      red: isActive 
        ? 'bg-red-600 text-white border-red-600 hover:bg-red-700' 
        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
    };

    return `flex items-center gap-2 ${colorClasses[color]}`;
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Decisão *
      </label>
      <div className="flex gap-2 flex-wrap">
        {decisoes.map(({ value, label, icon: Icon, color }) => (
          <Button
            key={value}
            type="button"
            variant={decisao === value ? 'default' : 'outline'}
            onClick={() => onDecisaoChange(value)}
            className={getButtonClasses(value, color)}
          >
            <Icon size={14} />
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default DecisaoButtons;
