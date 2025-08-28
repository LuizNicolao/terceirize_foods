import React from 'react';
import { FaDollarSign, FaChartLine, FaTruck, FaCreditCard } from 'react-icons/fa';

const ResumoAprovacao = ({ estatisticas, formatarValor }) => {
  if (!estatisticas) return null;

  const cards = [
    {
      title: 'Valor Total',
      value: estatisticas.valorTotal,
      icon: FaDollarSign,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Valor Aprovado',
      value: estatisticas.valorAprovado,
      icon: FaChartLine,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Economia',
      value: estatisticas.economia,
      icon: FaDollarSign,
      color: 'bg-purple-500',
      textColor: estatisticas.economia > 0 ? 'text-green-600' : 'text-red-600'
    },
    {
      title: 'Itens',
      value: estatisticas.totalItens,
      icon: FaTruck,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className={`text-2xl font-bold ${card.textColor}`}>
                {card.title === 'Itens' 
                  ? card.value 
                  : formatarValor ? formatarValor(card.value) : `R$ ${card.value?.toFixed(2) || '0,00'}`
                }
              </p>
            </div>
            <div className={`${card.color} text-white p-3 rounded-lg`}>
              <card.icon size={20} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResumoAprovacao;
