import React from 'react';
import { FaChartLine } from 'react-icons/fa';
import { ChartCard, ActivityCard } from '../ui';
import { getActivityIcon, getActivityColor, formatDate } from '../../utils/dashboardUtils';

export const DashboardActivities = ({ atividades }) => {
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
