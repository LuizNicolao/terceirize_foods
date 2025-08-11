import React from 'react';
import { 
  FaTruck, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaExclamationTriangle,
  FaChartLine
} from 'react-icons/fa';

const RecentActivity = ({ activities, getActivityIcon, getActivityColor }) => {
  const getIconComponent = (type) => {
    const iconMap = {
      'cotacao_aprovada': FaCheckCircle,
      'nova_cotacao': FaTruck,
      'cotacao_rejeitada': FaTimesCircle,
      'supervisor_review': FaExclamationTriangle,
      'default': FaChartLine
    };
    const IconComponent = iconMap[type] || iconMap.default;
    return <IconComponent />;
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Atividades Recentes
        </h3>
        <div className="text-center text-gray-500 py-8">
          Nenhuma atividade recente
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Atividades Recentes
      </h3>
      
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={activity.id || index}
            className="flex items-center py-3 border-b border-gray-100 last:border-b-0"
          >
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white mr-3"
              style={{ backgroundColor: getActivityColor(activity.type) }}
            >
              {getIconComponent(activity.type)}
            </div>
            
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 mb-1">
                {activity.title}
              </div>
              <div className="text-xs text-gray-500">
                {activity.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
