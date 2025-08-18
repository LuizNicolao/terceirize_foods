import React from 'react';
import { FaChartLine, FaBox, FaTruck, FaUser, FaLayerGroup, FaBuilding, FaRoute, FaRuler } from 'react-icons/fa';
import { ChartCard, ActivityCard } from '../../../components/ui';

export const DashboardActivities = ({ atividades, formatDate }) => {
  const getActivityIcon = (tipo) => {
    const icons = {
      'produto': FaBox,
      'fornecedor': FaTruck,
      'cliente': FaUser,
      'grupo': FaLayerGroup,
      'usuario': FaUser,
      'filial': FaBuilding,
      'rota': FaRoute,
      'unidade_escolar': FaRuler,
      'motorista': FaUser,
      'ajudante': FaUser,
      'veiculo': FaTruck
    };
    return icons[tipo] || FaChartLine;
  };

  const getActivityColor = (tipo) => {
    const colors = {
      'produto': 'bg-purple-500',
      'fornecedor': 'bg-green-500',
      'cliente': 'bg-blue-500',
      'grupo': 'bg-orange-500',
      'usuario': 'bg-indigo-500',
      'filial': 'bg-teal-500',
      'rota': 'bg-pink-500',
      'unidade_escolar': 'bg-red-500',
      'motorista': 'bg-yellow-500',
      'ajudante': 'bg-gray-500',
      'veiculo': 'bg-cyan-500'
    };
    return colors[tipo] || 'bg-gray-500';
  };

  return (
    <ChartCard title="Atividades Recentes">
      <div className="space-y-2">
        {atividades.length > 0 ? (
          atividades.map((atividade, index) => (
            <ActivityCard
              key={index}
              title={`${atividade.acao}: ${atividade.titulo}`}
              subtitle={`ID: ${atividade.id}`}
              time={formatDate(atividade.data)}
              icon={getActivityIcon(atividade.tipo)}
              color={getActivityColor(atividade.tipo)}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FaChartLine className="mx-auto h-12 w-12 mb-4 text-gray-300" />
            <p>Nenhuma atividade recente</p>
          </div>
        )}
      </div>
    </ChartCard>
  );
};
