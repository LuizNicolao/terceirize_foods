import React from 'react';
import { 
  FaRoute, 
  FaMapMarkerAlt, 
  FaRuler, 
  FaClock, 
  FaTachometerAlt,
  FaStopwatch,
  FaChartLine
} from 'react-icons/fa';
import {
  calculateEstimatedTime,
  calculateAverageSpeed,
  calculateAverageDistanceBetweenStops,
  calculateAverageTimePerSegment
} from './utils/routeUtils';

/**
 * Componente para exibir informações detalhadas da rota
 * Mostra distância, tempo estimado, velocidade média, etc.
 */
const RouteInfo = ({ unidadesComOrdem, distanciaTotal }) => {
  if (!unidadesComOrdem || unidadesComOrdem.length === 0) return null;

  const formatDistance = (km) => {
    if (km < 1) {
      return `${(km * 1000).toFixed(0)} m`;
    }
    return `${km.toFixed(2)} km`;
  };

  const formatTime = (minutos) => {
    if (minutos < 60) {
      return `${Math.round(minutos)} min`;
    }
    const horas = Math.floor(minutos / 60);
    const mins = Math.round(minutos % 60);
    return `${horas}h ${mins > 0 ? `${mins}min` : ''}`;
  };

  // Calcular estatísticas
  const numParadas = unidadesComOrdem.length;
  const numSegmentos = Math.max(0, numParadas - 1);
  
  const {
    tempoTotalMin,
    tempoViagemMin,
    tempoParadasMin,
    tempoTotalFormatado
  } = calculateEstimatedTime(distanciaTotal, numParadas);

  const velocidadeMedia = distanciaTotal > 0 && tempoViagemMin > 0
    ? calculateAverageSpeed(distanciaTotal, tempoViagemMin / 60)
    : 0;

  const distanciaMediaEntreParadas = calculateAverageDistanceBetweenStops(
    distanciaTotal,
    numSegmentos
  );

  const tempoMedioPorSegmento = calculateAverageTimePerSegment(
    tempoTotalMin,
    numSegmentos
  );

  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-[1000] border border-gray-200 max-w-sm">
      <div className="flex items-center gap-2 mb-3">
        <FaRoute className="text-red-500" />
        <h4 className="text-sm font-semibold text-gray-700">Estatísticas da Rota</h4>
      </div>
      
      <div className="space-y-2.5 text-sm">
        {/* Paradas */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600 flex items-center gap-1.5">
            <FaMapMarkerAlt className="text-xs" />
            Paradas:
          </span>
          <span className="font-semibold text-gray-800">{numParadas}</span>
        </div>
        
        {/* Distância Total */}
        {distanciaTotal > 0 && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center gap-1.5">
                <FaRuler className="text-xs" />
                Distância Total:
              </span>
              <span className="font-semibold text-gray-800">{formatDistance(distanciaTotal)}</span>
            </div>
            
            {/* Distância Média entre Paradas */}
            {numSegmentos > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center gap-1.5">
                  <FaChartLine className="text-xs" />
                  Dist. Média:
                </span>
                <span className="font-semibold text-gray-800">
                  {formatDistance(distanciaMediaEntreParadas)}
                </span>
              </div>
            )}
          </>
        )}
        
        {/* Tempo Estimado */}
        {tempoTotalMin > 0 && (
          <>
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 flex items-center gap-1.5">
                  <FaClock className="text-xs" />
                  Tempo Total:
                </span>
                <span className="font-semibold text-blue-600">{tempoTotalFormatado}</span>
              </div>
              
              <div className="space-y-1.5 pl-5 text-xs text-gray-500">
                <div className="flex items-center justify-between">
                  <span>Tempo de viagem:</span>
                  <span>{formatTime(tempoViagemMin)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tempo de paradas:</span>
                  <span>{formatTime(tempoParadasMin)}</span>
                </div>
                {numSegmentos > 0 && (
                  <div className="flex items-center justify-between">
                    <span>Tempo médio/trecho:</span>
                    <span>{formatTime(tempoMedioPorSegmento)}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Velocidade Média */}
            {velocidadeMedia > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-600 flex items-center gap-1.5">
                  <FaTachometerAlt className="text-xs" />
                  Velocidade Média:
                </span>
                <span className="font-semibold text-gray-800">
                  {velocidadeMedia.toFixed(1)} km/h
                </span>
              </div>
            )}
          </>
        )}
        
        {/* Ordem de Entrega */}
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center gap-1.5 mb-1">
            <FaStopwatch className="text-xs text-gray-500" />
            <span className="text-xs font-medium text-gray-600">Ordem de entrega:</span>
          </div>
          <p className="text-xs text-gray-500 pl-5">
            {unidadesComOrdem.map((u, idx) => (
              <span key={u.id}>
                {u.ordem_entrega || idx + 1}
                {idx < unidadesComOrdem.length - 1 && ' → '}
              </span>
            ))}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RouteInfo;

