import React from 'react';
import { ActivityCard } from '../ui';
import { getActivityIcon, getActivityColor, formatDate } from '../../utils/dashboardUtils';

const DashboardActivities = ({ atividades = [] }) => {
  // Garantir que atividades seja sempre um array
  const atividadesArray = Array.isArray(atividades) ? atividades : [];

  return (
    <div className="col-span-1 lg:col-span-2">
      <ActivityCard title="Atividades Recentes">
        <div className="space-y-4">
          {atividadesArray.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Nenhuma atividade recente
            </p>
          ) : (
            atividadesArray.map((atividade, index) => {
              const Icon = getActivityIcon(atividade.tipo);
              const colorClass = getActivityColor(atividade.tipo);
              
              return (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-full ${colorClass} text-white`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {atividade.descricao}
                    </p>
                    <p className="text-xs text-gray-500">
                      {atividade.usuario} • {formatDate(atividade.data)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ActivityCard>
    </div>
  );
};

export default DashboardActivities;
