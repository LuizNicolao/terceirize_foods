import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { getAlertaColor } from '../../utils/dashboardUtils';

const DashboardAlerts = ({ alertas = [] }) => {
  // Garantir que alertas seja sempre um array
  const alertasArray = Array.isArray(alertas) ? alertas : [];

  return (
    <div className="col-span-1 lg:col-span-2">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaExclamationTriangle className="w-5 h-5 text-red-500 mr-2" />
            Alertas
          </h3>
          <span className="text-sm text-gray-500">
            {alertasArray.length} alerta{alertasArray.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="space-y-3">
          {alertasArray.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Nenhum alerta ativo
            </p>
          ) : (
            alertasArray.map((alerta, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border-l-4 ${getAlertaColor(alerta.nivel)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {alerta.titulo}
                    </p>
                    <p className="text-xs mt-1">
                      {alerta.descricao}
                    </p>
                  </div>
                  <span className="text-xs font-medium uppercase">
                    {alerta.nivel}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardAlerts;
