import React from 'react';
import { FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

/**
 * Componente de alertas do dashboard
 */
const DashboardAlerts = ({ alertas = [], onNavigate, loading = false }) => {
  /**
   * Obter ícone baseado no tipo do alerta
   */
  const getAlertIcon = (tipo) => {
    switch (tipo) {
      case 'error':
      case 'urgent':
        return FaExclamationTriangle;
      case 'warning':
        return FaExclamationTriangle;
      case 'info':
        return FaInfoCircle;
      case 'success':
        return FaCheckCircle;
      default:
        return FaInfoCircle;
    }
  };

  /**
   * Obter classes de cor baseadas no tipo do alerta
   */
  const getAlertColor = (tipo) => {
    switch (tipo) {
      case 'error':
      case 'urgent':
        return 'border-red-200 bg-red-50 text-red-800 hover:bg-red-100';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800 hover:bg-yellow-100';
      case 'info':
        return 'border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100';
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800 hover:bg-green-100';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800 hover:bg-gray-100';
    }
  };

  /**
   * Obter cor do ícone baseada no tipo do alerta
   */
  const getIconColor = (tipo) => {
    switch (tipo) {
      case 'error':
      case 'urgent':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'info':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  /**
   * Handler para clique no alerta
   */
  const handleAlertClick = (alerta) => {
    if (alerta.route && onNavigate) {
      onNavigate(alerta.route);
    }
  };

  /**
   * Formatar timestamp para exibição
   */
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return null;
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Agora mesmo';
    } else if (diffInHours < 24) {
      return `Há ${diffInHours}h`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="border rounded-lg p-3 animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="h-5 w-5 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Alertas</h3>
        <span className="text-sm text-gray-500">
          {alertas.length} {alertas.length === 1 ? 'alerta' : 'alertas'}
        </span>
      </div>

      {alertas.length === 0 ? (
        <div className="text-center py-8">
          <FaCheckCircle className="mx-auto h-12 w-12 text-green-400 mb-3" />
          <p className="text-sm text-gray-500 font-medium">Nenhum alerta no momento</p>
          <p className="text-xs text-gray-400 mt-1">Tudo funcionando perfeitamente!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alertas.map((alerta, index) => {
            const Icon = getAlertIcon(alerta.tipo);
            const colorClasses = getAlertColor(alerta.tipo);
            const iconColor = getIconColor(alerta.tipo);
            
            return (
              <div 
                key={`alert-${index}`} 
                className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${colorClasses}`}
                onClick={() => handleAlertClick(alerta)}
              >
                <div className="flex items-start space-x-3">
                  <Icon className={`h-5 w-5 mt-0.5 ${iconColor} flex-shrink-0`} />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {alerta.titulo}
                    </p>
                    <p className="text-xs mt-1 opacity-90 leading-relaxed">
                      {alerta.descricao}
                    </p>
                    {alerta.timestamp && (
                      <p className="text-xs mt-2 opacity-75">
                        {formatTimestamp(alerta.timestamp)}
                      </p>
                    )}
                  </div>
                  
                  {alerta.route && (
                    <FaArrowRight className="h-4 w-4 opacity-50 flex-shrink-0 mt-0.5" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardAlerts;
