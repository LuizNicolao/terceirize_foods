import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { ChartCard } from '../ui';
import { getAlertaColor, formatDate } from '../../utils/dashboardUtils';

export const DashboardAlerts = ({ alertas }) => {
  return (
    <ChartCard title="Alertas do Sistema">
      <div className="space-y-3">
        {alertas.length > 0 ? (
          alertas.map((alerta, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border-l-4 ${getAlertaColor(alerta.nivel)}`}
            >
              <div className="flex items-start">
                <FaExclamationTriangle className="mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium">
                    {alerta.titulo || 'Alerta do Sistema'}
                  </div>
                  <div className="text-xs mt-1">
                    {alerta.descricao || 'Descrição do alerta'}
                  </div>
                  <div className="text-xs mt-1 opacity-75">
                    {formatDate(alerta.data_hora)}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            <FaExclamationTriangle className="mx-auto h-8 w-8 mb-2 text-gray-300" />
            <p className="text-sm">Nenhum alerta ativo</p>
          </div>
        )}
      </div>
    </ChartCard>
  );
};
