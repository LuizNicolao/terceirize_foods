import React from 'react';
import { FaRoute, FaMapMarkerAlt, FaRuler } from 'react-icons/fa';

/**
 * Componente para exibir informações da rota
 * Mostra distância total, número de paradas, etc.
 */
const RouteInfo = ({ unidadesComOrdem, distanciaTotal }) => {
  if (!unidadesComOrdem || unidadesComOrdem.length === 0) return null;

  const formatDistance = (km) => {
    if (km < 1) {
      return `${(km * 1000).toFixed(0)} m`;
    }
    return `${km.toFixed(2)} km`;
  };

  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-[1000] border border-gray-200 max-w-xs">
      <div className="flex items-center gap-2 mb-3">
        <FaRoute className="text-red-500" />
        <h4 className="text-sm font-semibold text-gray-700">Informações da Rota</h4>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 flex items-center gap-1">
            <FaMapMarkerAlt className="text-xs" />
            Paradas:
          </span>
          <span className="font-semibold text-gray-800">{unidadesComOrdem.length}</span>
        </div>
        
        {distanciaTotal > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600 flex items-center gap-1">
              <FaRuler className="text-xs" />
              Distância Total:
            </span>
            <span className="font-semibold text-gray-800">{formatDistance(distanciaTotal)}</span>
          </div>
        )}
        
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Ordem de entrega: {unidadesComOrdem.map(u => u.ordem_entrega).join(' → ')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RouteInfo;

