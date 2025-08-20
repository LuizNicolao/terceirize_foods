import React, { useState } from 'react';
import { 
  FaExclamationTriangle, 
  FaTimes, 
  FaEye, 
  FaCheck,
  FaClock,
  FaFilter
} from 'react-icons/fa';
import { ChartCard } from '../ui';
import { getAlertaColor, formatDate } from '../../utils/dashboardUtils';

export const DashboardAlerts = ({ alertas, onNavigate }) => {
  const [filterLevel, setFilterLevel] = useState('todos');
  const [dismissedAlerts, setDismissedAlerts] = useState([]);

  const handleDismissAlert = (alertId) => {
    setDismissedAlerts(prev => [...prev, alertId]);
  };

  const handleViewDetails = (alerta) => {
    if (onNavigate) {
      // Navegar para a página relevante baseada no tipo de alerta
      const routeMap = {
        'estoque': '/produtos',
        'documentacao': '/veiculos',
        'motoristas': '/motoristas'
      };
      onNavigate(routeMap[alerta.tipo] || '/dashboard');
    }
  };

  const filteredAlerts = alertas.filter(alerta => {
    if (dismissedAlerts.includes(alerta.id)) return false;
    if (filterLevel === 'todos') return true;
    return alerta.nivel === filterLevel;
  });

  const getLevelLabel = (level) => {
    const labels = {
      'baixo': 'Baixo',
      'medio': 'Médio',
      'alto': 'Alto'
    };
    return labels[level] || level;
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'alto':
        return <FaExclamationTriangle className="text-red-500" />;
      case 'medio':
        return <FaExclamationTriangle className="text-orange-500" />;
      case 'baixo':
        return <FaExclamationTriangle className="text-yellow-500" />;
      default:
        return <FaExclamationTriangle className="text-gray-500" />;
    }
  };

  return (
    <ChartCard title="Alertas do Sistema">
      <div className="space-y-4">
        {/* Filtros */}
        <div className="flex items-center space-x-2">
          <FaFilter className="text-gray-400 h-4 w-4" />
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="text-xs border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="todos">Todos os níveis</option>
            <option value="alto">Alto</option>
            <option value="medio">Médio</option>
            <option value="baixo">Baixo</option>
          </select>
          <span className="text-xs text-gray-500">
            {filteredAlerts.length} alerta{filteredAlerts.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Lista de Alertas */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alerta, index) => (
              <div
                key={alerta.id || index}
                className={`relative p-4 rounded-lg border-l-4 ${getAlertaColor(alerta.nivel)} bg-white border border-gray-200 hover:shadow-sm transition-all duration-200`}
              >
                {/* Botão de fechar */}
                <button
                  onClick={() => handleDismissAlert(alerta.id || index)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <FaTimes className="h-3 w-3" />
                </button>

                <div className="flex items-start space-x-3 pr-6">
                  <div className="flex-shrink-0 mt-1">
                    {getLevelIcon(alerta.nivel)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {alerta.titulo || 'Alerta do Sistema'}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        alerta.nivel === 'alto' ? 'bg-red-100 text-red-800' :
                        alerta.nivel === 'medio' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {getLevelLabel(alerta.nivel)}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {alerta.descricao || 'Descrição do alerta'}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-xs text-gray-500 flex items-center">
                          <FaClock className="mr-1 h-3 w-3" />
                          {formatDate(alerta.data_hora)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(alerta)}
                          className="flex items-center px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors duration-200"
                        >
                          <FaEye className="mr-1 h-3 w-3" />
                          Ver detalhes
                        </button>
                        <button
                          onClick={() => handleDismissAlert(alerta.id || index)}
                          className="flex items-center px-2 py-1 text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors duration-200"
                        >
                          <FaCheck className="mr-1 h-3 w-3" />
                          Resolver
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FaExclamationTriangle className="mx-auto h-8 w-8 mb-2 text-gray-300" />
              <p className="text-sm">
                {dismissedAlerts.length > 0 ? 'Todos os alertas foram resolvidos' : 'Nenhum alerta ativo'}
              </p>
              {dismissedAlerts.length > 0 && (
                <button
                  onClick={() => setDismissedAlerts([])}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-700"
                >
                  Restaurar alertas
                </button>
              )}
            </div>
          )}
        </div>

        {/* Resumo */}
        {filteredAlerts.length > 0 && (
          <div className="border-t border-gray-200 pt-3">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {filteredAlerts.filter(a => a.nivel === 'alto').length} crítico{filteredAlerts.filter(a => a.nivel === 'alto').length !== 1 ? 's' : ''}
              </span>
              <span>
                Última atualização: {new Date().toLocaleTimeString('pt-BR')}
              </span>
            </div>
          </div>
        )}
      </div>
    </ChartCard>
  );
};
