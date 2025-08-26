import React from 'react';
import { 
  FaTruck, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaExclamationTriangle,
  FaChartLine
} from 'react-icons/fa';

const DashboardActivity = ({ recentActivity, getActivityIcon }) => {
  const getIconComponent = (type) => {
    switch (type) {
      case 'cotacao_aprovada':
        return <FaCheckCircle />;
      case 'nova_cotacao':
        return <FaTruck />;
      case 'cotacao_rejeitada':
        return <FaTimesCircle />;
      case 'supervisor_review':
        return <FaExclamationTriangle />;
      default:
        return <FaChartLine />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Atividades Recentes</h3>
      {recentActivity && recentActivity.length > 0 ? (
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center py-3 border-b border-gray-100 last:border-b-0">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center mr-3 text-white text-sm"
                style={{ backgroundColor: activity.color }}
              >
                {getIconComponent(activity.type)}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800 mb-1">
                  {activity.title}
                </div>
                <div className="text-xs text-gray-500">
                  {activity.timeText || activity.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8 italic">
          Nenhuma atividade recente encontrada
        </div>
      )}
    </div>
  );
};

export default DashboardActivity;
