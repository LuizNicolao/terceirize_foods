import React from 'react';
import { 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaExclamationCircle,
  FaInfoCircle
} from 'react-icons/fa';

const DashboardAlerts = ({ alerts }) => {
  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning':
        return <FaExclamationTriangle />;
      case 'success':
        return <FaCheckCircle />;
      case 'danger':
        return <FaExclamationCircle />;
      case 'info':
        return <FaInfoCircle />;
      default:
        return <FaInfoCircle />;
    }
  };

  const getAlertStyles = (type) => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: 'text-yellow-500',
          text: 'text-yellow-800'
        };
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: 'text-green-500',
          text: 'text-green-800'
        };
      case 'danger':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-500',
          text: 'text-red-800'
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-500',
          text: 'text-blue-800'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: 'text-gray-500',
          text: 'text-gray-800'
        };
    }
  };

  if (!alerts || alerts.length === 0) {
    return (
      <div className="mb-6">
        <div className="text-center py-6 px-4 text-gray-500 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <FaCheckCircle className="text-2xl mb-2 mx-auto text-green-500" />
          <div>Nenhum alerta no momento</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 space-y-3">
      {alerts.map((alerta, index) => {
        const styles = getAlertStyles(alerta.tipo);
        
        return (
          <div 
            key={index}
            className={`${styles.bg} ${styles.border} border rounded-lg p-4 flex items-center gap-3 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}
          >
            <div className={`text-xl flex-shrink-0 ${styles.icon}`}>
              {getAlertIcon(alerta.tipo)}
            </div>
            <div className={`text-sm font-medium flex-1 ${styles.text}`}>
              {alerta.mensagem}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardAlerts;
